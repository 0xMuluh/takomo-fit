"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import type { L } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { api, type Evidence, type FitResponse, type Questionnaire } from "@/lib/api";
import { certaintyLabel, certaintySummary, diffFits, partValue, type Change } from "@/lib/format";
import { saveFitContext, type CaptureKey } from "@/lib/session";
import { Capture, captureForTest, captureIntro, CAPTURES, evidenceKeys, measuredNote } from "../capture/captures";
import { Button, cx, ErrorNote, Spinner } from "../ui";
import { FitterSays, Interview, type Ctx, type LogEntry } from "./Interview";
import { SpecPanel } from "./SpecPanel";

type Step = { status: "done" | "skipped"; note?: string };
type Saved = {
  ctx: Ctx; log: LogEntry[]; stage: "interview" | "measure"; evidence: Evidence;
  steps: Partial<Record<CaptureKey, Step>>; firstRead?: string;
};

const KEY = "pf:session";
const ORDER: CaptureKey[] = ["body", "hand", "swing", "ballLine", "radar"];
const fresh = (): Saved => ({ ctx: { q: { characteristics: [] }, x: { misses: [] } }, log: [], stage: "interview", evidence: {}, steps: {} });

function changeSentence(changes: Change[], fit: FitResponse, l: L): string {
  const real = changes.filter((c) => c.part !== "purchase");
  if (!real.length) return l.t.session.noChange;
  return real.map((c) => {
    const comp = fit.components.find((x) => x.part === c.part)!;
    return c.from !== c.to
      ? l.t.session.changes(l.t.part[c.part], c.from, c.to)
      : l.t.session.stays(l.t.part[c.part], c.to, certaintyLabel(comp, l).toLowerCase(), l.f.pct(c.confTo));
  }).join(" ");
}

export function FitSession() {
  const router = useRouter();
  const l = useI18n();
  const [s, setS] = useState<Saved>(fresh);
  const [fit, setFit] = useState<FitResponse>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [capturing, setCapturing] = useState<CaptureKey>();
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const loaded = useRef(false);

  const refit = async (ctx: Ctx, evidence: Evidence) => {
    setBusy(true);
    setErr(undefined);
    try {
      const next = await api.createFit(
        { questionnaire: ctx.q as Questionnaire, evidence },
        { lang: l.lang, units: l.units },
      );
      saveFitContext(next.fit_id, { q: ctx.q, x: ctx.x, captured: evidenceKeys(evidence) });
      return next;
    } catch (e) {
      setErr(e instanceof Error ? e.message : l.t.session.refitFailed);
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (new URLSearchParams(window.location.search).has("new")) {
      sessionStorage.removeItem(KEY);
      window.history.replaceState(null, "", "/fit/guided");
      return;
    }
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return;
    try {
      const saved: Saved = JSON.parse(raw);
      setS(saved);
      if (saved.stage === "measure") void refit(saved.ctx, saved.evidence).then((f) => f && setFit(f));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded.current) sessionStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);

  useEffect(() => {
    if (!loaded.current || s.stage !== "measure") return;
    void api.createFit(
      { questionnaire: s.ctx.q as Questionnaire, evidence: s.evidence },
      { lang: l.lang, units: l.units },
    ).then((f) => {
      setFit(f);
      setS((p) => ({
        ...p,
        firstRead: Object.keys(p.steps).length
          ? l.t.session.updatedRead(certaintySummary(f, l))
          : l.t.session.firstRead(f.spec.head_name, partValue("shaft", f.spec.shaft.slug, f, l), certaintySummary(f, l)),
      }));
    }).catch(() => {});
  }, [l.lang, l.units]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (cs: Change[]) => {
    setChanged(new Set(cs.map((c) => c.part)));
    setTimeout(() => setChanged(new Set()), 2500);
  };

  const finishInterview = async (ctx: Ctx) => {
    const f = await refit(ctx, s.evidence);
    if (!f) return;
    if (fit) flash(diffFits(fit, f, l));
    setFit(f);
    setS((p) => ({
      ...p, ctx, stage: "measure",
      firstRead: p.firstRead && Object.keys(p.steps).length
        ? l.t.session.updatedRead(certaintySummary(f, l))
        : l.t.session.firstRead(f.spec.head_name, partValue("shaft", f.spec.shaft.slug, f, l), certaintySummary(f, l)),
    }));
  };

  const addEvidence = async (k: CaptureKey, ev: Evidence) => {
    const evidence = { ...s.evidence, ...ev };
    const f = await refit(s.ctx, evidence);
    if (!f) return;
    const cs = fit ? diffFits(fit, f, l) : [];
    setFit(f);
    flash(cs);
    setCapturing(undefined);
    setS((p) => ({
      ...p, evidence,
      steps: { ...p.steps, [k]: { status: "done", note: `${measuredNote(ev, p.ctx.q.height_cm, l)} ${changeSentence(cs, f, l)}` } },
    }));
  };

  const skip = (k: CaptureKey) => setS((p) => ({ ...p, steps: { ...p.steps, [k]: { status: "skipped" } } }));
  const reopen = (k: CaptureKey) => {
    setS((p) => {
      const steps = { ...p.steps };
      delete steps[k];
      return { ...p, steps };
    });
    setCapturing(k);
  };

  const finish = () => fit && router.push(`/fit/${fit.fit_id}`);
  const startOver = () => {
    sessionStorage.removeItem(KEY);
    setS(fresh());
    setFit(undefined);
    setCapturing(undefined);
  };

  const current = ORDER.find((k) => !s.steps[k]);
  const doneCount = ORDER.filter((k) => s.steps[k]?.status === "done").length;

  return (
    <>
    <SiteHeader back="/" actions={
      <>
        <Link href="/fit" className="hidden text-[13px] font-semibold text-fairway hover:underline sm:block">
          {l.t.session.talkInstead}
        </Link>
        {(s.log.length > 0 || fit) && (
          <button type="button" onClick={startOver} className="text-[13px] font-medium text-muted hover:text-ink">
            {l.t.session.startOver}
          </button>
        )}
      </>
    } />
    <div className="mx-auto max-w-xl px-4 pb-[max(env(safe-area-inset-bottom),4rem)] pt-3 sm:px-6">
      <Link href="/fit" className="mb-1 inline-block text-[13px] font-semibold text-fairway sm:hidden">
        {l.t.session.talkInstead}
      </Link>

      {fit && s.stage === "measure" && <SpecPanel fit={fit} changed={changed} busy={busy} />}

      {s.stage === "interview" ? (
        <>
          <Interview
            ctx={s.ctx}
            log={s.log}
            onAnswer={(entry, ctx) => setS((p) => ({ ...p, ctx, log: [...p.log, entry] }))}
            onBack={() => setS((p) => {
              const last = p.log[p.log.length - 1];
              return last ? { ...p, ctx: last.before, log: p.log.slice(0, -1) } : p;
            })}
            onComplete={(ctx) => void finishInterview(ctx)}
          />
          {s.firstRead && !busy && (
            <Button className="mt-4 w-full" onClick={() => void finishInterview(s.ctx)}>{l.t.session.backToMeasuring}</Button>
          )}
          {busy && <div className="mt-4"><Spinner label={l.t.session.firstReadBusy} /></div>}
          {err && <div className="mt-4"><ErrorNote>{err}</ErrorNote></div>}
        </>
      ) : (
        <div className="mt-2 space-y-4">
          {s.firstRead && <FitterSays>{s.firstRead}</FitterSays>}
          <button type="button" className="text-[13px] text-muted hover:text-ink"
                  onClick={() => setS((p) => ({ ...p, stage: "interview" }))}>
            {l.t.session.changeAnswers}
          </button>

          {ORDER.map((k) => {
            const c = CAPTURES.find((x) => x.key === k)!;
            const title = l.t.captures.title[k];
            const needs = l.t.captures.needs[k];
            const st = s.steps[k];
            if (st?.status === "done") {
              return (
                <div key={k} className="rounded-2xl border border-fairway/25 bg-fairway-soft px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-fairway">✓ {title}</span>
                    <button type="button" className="text-[13px] text-fairway/80 hover:underline" onClick={() => reopen(k)}>{l.t.session.redo}</button>
                  </div>
                  {st.note && <p className="mt-1 text-[14px] text-ink/80">{st.note}</p>}
                </div>
              );
            }
            if (st?.status === "skipped") {
              return (
                <div key={k} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-muted">
                  <span>{l.t.captures.skipped(title)}</span>
                  <button type="button" className="text-[13px] text-ink hover:underline" onClick={() => reopen(k)}>{l.t.session.doNow}</button>
                </div>
              );
            }
            if (k !== current) {
              return (
                <div key={k} className="flex items-center justify-between rounded-2xl border border-dashed border-line px-4 py-3 text-[14px] text-muted">
                  <span>{title}</span><span>{l.t.common.minutes(c.minutes)}</span>
                </div>
              );
            }
            const gain = fit?.next_tests.find((t) => captureForTest(t.test)?.key === k);
            const [gPart, [gFrom, gTo]] = gain ? Object.entries(gain.improves)[0] : ["", [0, 0]];
            return (
              <div key={k} className="space-y-3">
                <FitterSays>
                  {captureIntro(k, s.ctx.x, l)}
                  {gain && (
                    <span className="mt-1 block text-[13px] text-fairway">
                      {l.t.session.expect(l.t.spec.improves[gPart] ?? gPart, l.f.pct(gFrom), l.f.pct(gTo))}
                    </span>
                  )}
                </FitterSays>
                <div className="rounded-2xl border border-ink/15 bg-white p-4">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <span className="text-[13px] text-muted">{l.t.common.minutes(c.minutes)} · {needs}</span>
                  </div>
                  <div className="mt-3">
                    {capturing === k ? (
                      busy ? <Spinner label={l.t.session.updating} /> : (
                        <>
                          <Capture k={k} heightCm={s.ctx.q.height_cm ?? 175} onEvidence={(ev) => void addEvidence(k, ev)} />
                          <Button variant="ghost" className="mt-2" onClick={() => setCapturing(undefined)}>{l.t.common.cancel}</Button>
                        </>
                      )
                    ) : (
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => setCapturing(k)}>{l.t.session.start}</Button>
                        <Button variant="secondary" onClick={() => skip(k)}>{l.t.session.skipForNow}</Button>
                      </div>
                    )}
                  </div>
                  {err && capturing === k && <div className="mt-3"><ErrorNote>{err}</ErrorNote></div>}
                </div>
              </div>
            );
          })}

          {!current && fit && (
            <FitterSays>
              {l.t.session.allDone(doneCount > 0)}
              {certaintySummary(fit, l)}
            </FitterSays>
          )}

          <div className={cx("sticky bottom-0 bg-paper pt-3", !fit && "hidden")}>
            <Button className="w-full" variant={current ? "secondary" : "primary"} onClick={finish} disabled={!fit || busy}>
              {current ? l.t.session.skipRest : l.t.session.seeFull}
            </Button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
