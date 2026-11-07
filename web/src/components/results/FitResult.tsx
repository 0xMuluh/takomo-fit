"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/i18n/context";
import { api, type Catalog, type Component, type Evidence, type FitResponse } from "@/lib/api";
import { certainty, certaintyLabel, diffFits, joinList, partValue, type Change } from "@/lib/format";
import { headImage, headPage } from "@/lib/products";
import { loadFitContext, saveFitContext, type FitContext } from "@/lib/session";
import { Capture, captureForTest, CAPTURES, capturedIn, evidenceKeys, measuredNote, type CaptureKey } from "../capture/captures";
import { Badge, Button, Card, cx, ErrorNote, ExternalIcon, Meter, Spinner } from "../ui";
import { AskFitter } from "./AskFitter";
import { Compare } from "./Compare";
import { SaidVsMeasured } from "./SaidVsMeasured";
import { WhatIf } from "./WhatIf";

export function FitResult({ id }: { id: string }) {
  const l = useI18n();
  const [fit, setFit] = useState<FitResponse>();
  const [catalog, setCatalog] = useState<Catalog>();
  const [ctx, setCtx] = useState<FitContext>();
  const [err, setErr] = useState<string>();
  const [capturing, setCapturing] = useState<CaptureKey>();
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<{ title: string; note: string; list: Change[] }>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loc = { lang: l.lang, units: l.units };
    api.getFit(id, loc).then(setFit).catch(() => setErr(l.t.result.notFound));
    api.catalog(l.lang).then(setCatalog).catch(() => {});
    setCtx(loadFitContext(id));
  }, [id, l.lang, l.units, l.t.result.notFound]);

  const done = useMemo(() => new Set([...(fit ? capturedIn(fit) : []), ...(ctx?.captured ?? [])]), [fit, ctx]);

  const addEvidence = async (k: CaptureKey, ev: Evidence) => {
    if (!fit) return;
    setSaving(true);
    setErr(undefined);
    try {
      const next = await api.addEvidence(fit.fit_id, ev, { lang: l.lang, units: l.units });
      if (ctx) {
        const updated = { ...ctx, captured: [...new Set([...ctx.captured, ...evidenceKeys(ev)])] };
        saveFitContext(id, updated);
        setCtx(updated);
      }
      setChanges({
        title: l.t.captures.title[k],
        note: measuredNote(ev, ctx?.q.height_cm ?? undefined, l),
        list: diffFits(fit, next, l),
      });
      setFit(next);
      setCapturing(undefined);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : l.t.result.addFailed);
    } finally {
      setSaving(false);
    }
  };

  if (err && !fit) {
    return (
      <Shell>
        <ErrorNote>{err}</ErrorNote>
        <Link href="/fit" className="underline">{l.t.result.startNew}</Link>
      </Shell>
    );
  }
  if (!fit) return <Shell><Spinner label={l.t.result.loading} /></Shell>;

  if (capturing) {
    return (
      <Shell>
        <h1 className="text-[24px] font-semibold tracking-tight sm:text-[26px]">{l.t.captures.title[capturing]}</h1>
        {saving ? <Spinner label={l.t.session.updating} /> : (
          <Capture k={capturing} heightCm={ctx?.q.height_cm ?? Math.round(fit.estimates.height?.mean ?? 175)}
                   onEvidence={(ev) => void addEvidence(capturing, ev)} />
        )}
        {err && <ErrorNote>{err}</ErrorNote>}
        <Button variant="ghost" onClick={() => setCapturing(undefined)}>{l.t.result.backToFit}</Button>
      </Shell>
    );
  }

  const s = fit.spec;
  const more = CAPTURES.filter((c) => !done.has(c.key) && !fit.next_tests.some((t) => captureForTest(t.test)?.key === c.key));
  const img = headImage(s.head, 640);
  const storeUrl = headPage(s.head);
  const copySpecText = () => {
    const text = [
      `${s.head_name} (${s.purchase === "stock" ? l.t.spec.stock : l.t.spec.custom})`,
      `${l.t.part.shaft}: ${partValue("shaft", s.shaft.slug, fit, l)}`,
      `${l.t.part.length}: ${partValue("length", String(s.length_in), fit, l)}`,
      `${l.t.part.lie}: ${partValue("lie", String(s.lie_deg), fit, l)}`,
      `${l.t.part.grip}: ${partValue("grip", s.grip, fit, l)}`,
      `${l.t.spec.hand}: ${s.handedness === "left" ? l.t.spec.left : l.t.spec.right}`,
      storeUrl,
    ].join("\n");
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const parts = fit.components.filter((c) => c.part !== "purchase");
  const toCheck = parts.filter((c) => certainty(c).key === "check");
  const stock = fit.stock_advice.recommendation === "stock";
  const nextStep = (part: Component["part"]): CaptureKey | undefined => {
    const t = fit.next_tests.find((x) => Object.keys(x.improves).some((k) => k === part || (part === "shaft" && k === "flex")));
    if (t) return captureForTest(t.test)?.key;
    return part === "length" && !done.has("body") ? "body" : undefined;
  };

  return (
    <Shell wide>
      {changes && <ChangeNote {...changes} onClose={() => setChanges(undefined)} />}

      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12 lg:space-y-0">
      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium uppercase tracking-wider text-muted">{l.t.result.kicker}</div>
            <h1 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight sm:text-[36px] lg:text-[40px]">{s.head_name}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
              {toCheck.length
                ? l.t.result.toCheck(toCheck.length, joinList(toCheck.map((c) => l.lower(l.t.part[c.part])), l))
                : l.t.result.allConfirmed}
            </p>
          </div>
          {img && (
            <img src={img} alt={s.head_name} width={112} height={112}
                 className="size-24 shrink-0 rounded-2xl border border-line bg-white object-contain p-2 sm:size-28 lg:hidden" />
          )}
        </div>
        {img && (
          <div className="hidden rounded-3xl border border-line bg-white p-6 lg:block">
            <img src={img} alt={s.head_name} width={640} height={640} className="mx-auto h-64 w-auto object-contain xl:h-72" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-2xl bg-ink p-4 text-paper sm:grid-cols-3 sm:p-5">
          <Spec label={l.t.part.shaft} value={partValue("shaft", s.shaft.slug, fit, l)} />
          <Spec label={l.t.part.length} value={partValue("length", String(s.length_in), fit, l)} />
          <Spec label={l.t.part.lie} value={partValue("lie", String(s.lie_deg), fit, l)} />
          <Spec label={l.t.part.grip} value={partValue("grip", s.grip, fit, l)} />
          <Spec label={l.t.spec.hand} value={s.handedness === "left" ? l.t.spec.left : l.t.spec.right} />
          <Spec label={l.t.part.purchase} value={s.purchase === "stock" ? l.t.spec.stock : l.t.spec.custom} />
        </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">{stock ? l.t.result.stockTitle : l.t.result.customTitle}</div>
            <p className="mt-1 text-[14px] text-muted">{fit.stock_advice.message}</p>
          </div>
          <Badge tone={stock ? "good" : "neutral"}>{stock ? l.t.result.returns : l.t.result.madeToOrder}</Badge>
        </div>
        {stock && (
          <div className="mt-3 text-[13px] text-muted">
            {l.t.result.stockChance(l.f.pct(fit.stock_advice.probability_stock_is_right))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
             className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[4px] bg-accent px-5 text-center font-display text-[16px] font-bold uppercase tracking-wide text-ink transition hover:bg-accent-strong">
            <span>{l.t.result.orderOnTakomo(s.head_name)}</span>
            <ExternalIcon />
          </a>
          <button type="button" onClick={copySpecText}
                  className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-ink bg-white px-4 font-display text-[15px] font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper">
            {copied ? `✓ ${l.t.result.copiedSpec}` : l.t.result.copySpec}
          </button>
        </div>
      </Card>
      </aside>

      <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{l.t.result.whyEach}</h2>
        {parts.map((c) => {
          const step = certainty(c).key === "check" ? nextStep(c.part) : undefined;
          return <PartCard key={c.part} c={c} fit={fit} step={step} onStep={() => step && setCapturing(step)} />;
        })}
      </section>

      <SaidVsMeasured fit={fit} ctx={ctx} catalog={catalog} />

      {catalog && <Compare fit={fit} catalog={catalog} ctx={ctx} />}

      {fit.next_tests.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{l.t.result.settle}</h2>
          <p className="text-[14px] text-muted">{l.t.result.settleIntro}</p>
          {fit.next_tests.map((t) => {
            const [part, [before, after]] = Object.entries(t.improves)[0];
            const cap = captureForTest(t.test);
            return (
              <Card key={t.test}>
                <div className="font-medium">{l.t.testTitle[t.test] ?? t.test}</div>
                <p className="mt-1 text-[14px] text-ink/75">{t.how}</p>
                <div className="mt-3 flex items-center gap-3 text-[13px]">
                  <span className="text-muted">{l.t.part[part as Component["part"]] ?? l.t.spec.improves[part] ?? part}</span>
                  <span className="tabular-nums">{l.f.pct(before)}</span>
                  <span className="text-muted">→</span>
                  <span className="font-semibold tabular-nums text-fairway">{l.f.pct(after)}</span>
                  <span className="ml-auto text-muted">{l.t.result.expected}</span>
                </div>
                {cap && <Button className="mt-4 w-full" onClick={() => setCapturing(cap.key)}>{l.t.session.doNow}</Button>}
              </Card>
            );
          })}
        </section>
      )}

      {more.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{l.t.result.more}</h2>
          {more.map((c) => (
            <button key={c.key} type="button" onClick={() => setCapturing(c.key)}
                    className="flex w-full items-center rounded-xl border border-line bg-white px-4 py-3 text-left hover:border-ink/40">
              <div className="flex-1">
                <div className="font-medium">{l.t.captures.title[c.key]}</div>
                <div className="text-[13px] text-muted">{l.t.captures.setsYour(l.t.captures.sets[c.key], l.t.common.minutes(c.minutes))}</div>
              </div>
              <span className="text-muted">›</span>
            </button>
          ))}
        </section>
      )}

      <AskFitter fit={fit} ctx={ctx} />

      <WhatIf fit={fit} />

      {fit.warnings && fit.warnings.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">{fit.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
      <footer className="flex items-center justify-between pt-4 text-[12px] text-muted">
        <span>{l.t.result.footer(fit.fit_id, fit.model_version)}</span>
        <Link href="/fit" className="underline">{l.t.result.back}</Link>
      </footer>
      </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
             className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[4px] bg-accent px-4 text-center font-display text-[15px] font-bold uppercase tracking-wide text-ink transition hover:bg-accent-strong">
            <span className="truncate">{l.t.result.orderOnTakomo(s.head_name)}</span>
            <ExternalIcon />
          </a>
          <button type="button" onClick={copySpecText}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[4px] border border-ink bg-white px-3.5 font-display text-[14px] font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper">
            {copied ? `✓ ${l.t.result.copiedSpec}` : l.t.result.copySpec}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <SiteHeader />
      <div className={cx("mx-auto max-w-xl space-y-6 px-4 pb-[max(env(safe-area-inset-bottom),6rem)] pt-5 sm:px-6 sm:pt-6 lg:pb-12",
                         wide && "lg:max-w-6xl lg:px-10 lg:pt-8")}>
        {children}
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] text-paper/60">{label}</div>
      <div className="text-[15px] font-medium leading-snug capitalize sm:text-[16px]">{value}</div>
    </div>
  );
}

function PartCard({ c, fit, step, onStep }: { c: Component; fit: FitResponse; step?: CaptureKey; onStep: () => void }) {
  const l = useI18n();
  const [open, setOpen] = useState(false);
  const ce = certainty(c);
  return (
    <div className="rounded-2xl border border-line bg-white">
      <button type="button" className="w-full px-4 py-3.5 text-left sm:px-5 sm:py-4" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="w-16 shrink-0 text-[13px] text-muted sm:w-20">{l.t.part[c.part]}</div>
          <div className="min-w-0 flex-1 font-medium leading-snug">{partValue(c.part, c.value, fit, l)}</div>
          <Badge tone={ce.tone}>{certaintyLabel(c, l)}</Badge>
        </div>
        <div className="mt-2.5 flex items-center gap-3 sm:pl-23">
          <Meter value={c.confidence} tone={ce.tone === "close" ? "close" : "good"} />
          <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-muted">{l.f.pct(c.confidence)}</span>
        </div>
      </button>
      {step && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[13px] sm:px-5 sm:pl-28">
          <span className="text-ink/75">{l.t.result.nextStep(l.t.captures.title[step])}</span>
          <button type="button" onClick={onStep} className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper hover:bg-black">
            {l.t.session.doNow}
          </button>
        </div>
      )}
      {open && (
        <div className="space-y-3 border-t border-line px-4 py-4 text-[14px] sm:px-5">
          <p className="font-medium leading-snug">{c.summary}</p>
          <ul className="list-disc space-y-1 pl-5 text-ink/80">{c.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          {c.alternative && c.alternative_probability != null && (
            <div className="rounded-lg bg-paper px-3 py-2 text-[13px]">
              {l.t.result.runnerUp} <b>{partValue(c.part, c.alternative, fit, l)}</b> ({l.f.pct(c.alternative_probability)})
            </div>
          )}
          {c.effect && <p className="text-[13px] text-muted">{c.effect}</p>}
          {c.evidence && c.evidence.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {c.evidence.map((e) => (
                <span key={e.source + e.reading} className="rounded-full bg-paper px-2.5 py-1 text-[12px]">
                  <span className="text-muted">{e.source}:</span> {e.reading}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChangeNote({ title, note, list, onClose }: { title: string; note: string; list: Change[]; onClose: () => void }) {
  const l = useI18n();
  const real = list.filter((c) => c.part !== "purchase");
  return (
    <div className="rounded-2xl border border-fairway/30 bg-fairway-soft p-4 text-[14px]" role="status">
      <div className="flex items-start justify-between">
        <div className="font-medium text-fairway">{l.t.result.added(title)}</div>
        <button type="button" onClick={onClose} className="text-fairway/70" aria-label={l.t.common.dismiss}>✕</button>
      </div>
      <p className="mt-1">{note}</p>
      {real.length === 0 ? (
        <p className="mt-1 text-ink/70">{l.t.result.agrees}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {real.map((c) => (
            <li key={c.part} className="flex flex-wrap gap-x-2">
              <span className="w-20 text-muted">{l.t.part[c.part]}</span>
              {c.from !== c.to ? <span><s className="text-muted">{c.from}</s> → <b>{c.to}</b></span> : <span>{c.to}</span>}
              <span className={cx("tabular-nums", c.confTo >= c.confFrom ? "text-fairway" : "text-flag")}>
                {l.f.pct(c.confFrom)} → {l.f.pct(c.confTo)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
