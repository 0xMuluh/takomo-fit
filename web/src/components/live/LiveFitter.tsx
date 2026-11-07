"use client";

import Link from "next/link";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SiteHeader } from "@/components/SiteHeader";
import { TakomoLogo } from "@/components/TakomoLogo";
import { agentL, type Locale } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { api, ApiError, type Component, type Evidence, type FitResponse } from "@/lib/api";
import { certainty, certaintyLabel, certaintySummary, partValue, type Change } from "@/lib/format";
import { headImage, headPage } from "@/lib/products";
import { emptyAnswers, needList, type Answers } from "@/lib/fitter/answers";
import { fitBrief, KIND_LABEL, type Kind } from "@/lib/fitter/describe";
import { evidenceKeysOf } from "@/lib/fitter/evidence";
import { FitterSession } from "@/lib/fitter/session";
import type { ToolState } from "@/lib/fitter/tools";
import { BallLineCapture } from "../capture/BallLineCapture";
import { HandCapture } from "../capture/HandCapture";
import { LaunchMonitorImport } from "../capture/LaunchMonitorImport";
import { cx, ExternalIcon, GolferStickman, StickmanLoader } from "../ui";
import { LiveBody } from "./LiveBody";
import { LiveSwing } from "./LiveSwing";

type Line = { role: "fitter" | "you" | "app"; text: string };
type Attached = { file?: File; url?: string };
const TRACKMAN_LINK = /https:\/\/web-dynamic-reports\.trackmangolf\.com\/\S+/i;
const ATTACH: Kind[] = ["launch_monitor", "swing", "body", "hand", "ball_line"];
type Saved = { answers: Answers; evidence: Evidence; lines: Line[] };
type Phase = "intro" | "connecting" | "live" | "ended";

const KEY = "pf:live";
const PARTS: Component["part"][] = ["head", "shaft", "length", "lie", "grip"];
const hasAnswers = (a: Answers) => Object.keys(a.q).length > 1 || !!a.x.name;

export function LiveFitter() {
  return (
    <ConversationProvider>
      <Session />
    </ConversationProvider>
  );
}

function Session() {
  const l = useI18n();
  const localeRef = useRef<Locale>({ lang: l.lang, units: l.units });
  localeRef.current = { lang: l.lang, units: l.units };
  const lRef = useRef(l);
  lRef.current = l;

  const [state, setState] = useState<ToolState>({ answers: emptyAnswers(), evidence: {} });
  const [lines, setLines] = useState<Line[]>([]);
  const [measuring, setMeasuring] = useState<Kind>();
  const [attached, setAttached] = useState<Attached>();
  const [phase, setPhase] = useState<Phase>("intro");
  const [textMode, setTextMode] = useState(false);
  const [err, setErr] = useState<string>();
  const [unavailable, setUnavailable] = useState(false);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [resultsOpen, setResultsOpen] = useState(false);
  const [saved, setSaved] = useState<Saved>();
  const [loaded, setLoaded] = useState(false);
  const { answers, evidence, fit } = state;

  const sent = useRef(new Set<string>());
  const resuming = useRef(false);
  const measureOpenedAt = useRef(0);
  const lastCueAt = useRef(0);
  const lastCueText = useRef("");

  const addLine = (ln: Line) => setLines((ls) => [...ls, ln]);
  const flash = (cs: Change[]) => {
    setChanged(new Set(cs.map((c) => c.part)));
    setTimeout(() => setChanged(new Set()), 2500);
  };
  const newSession = (initial?: Partial<ToolState>) => new FitterSession({
    onState: setState,
    onChanges: flash,
    onMeasure: (k) => {
      setAttached(undefined);
      setMeasuring(k);
      measureOpenedAt.current = Date.now();
      lastCueAt.current = 0;
      lastCueText.current = "";
      if (k) addLine({ role: "app", text: lRef.current.t.live.opened(lRef.current.t.live.kind[k]) });
    },
    onResults: () => setResultsOpen(true),
  }, () => localeRef.current, initial);
  const session = useRef<FitterSession>(null);

  const conv = useConversation({
    onMessage: ({ message, role }) => {
      if (!message?.trim()) return;
      if (role === "user") {
        if (sent.current.has(message.trim())) return;
        addLine({ role: "you", text: message });
      } else addLine({ role: "fitter", text: message });
    },
    onConnect: () => setPhase("live"),
    onDisconnect: () => setPhase((p) => (p === "connecting" ? "intro" : "ended")),
    onError: (m) => setErr(m || lRef.current.t.live.dropped),
  });

  const send = (text: string) => {
    sent.current.add(text.trim());
    conv.sendUserMessage(text);
  };

  const onCoach = (cue: string, immediate = false) => {
    if (phase !== "live") return;
    const now = Date.now();
    if (immediate) {
      if (now - lastCueAt.current < 1500) return;
      lastCueAt.current = now;
      lastCueText.current = cue;
      send(cue);
      return;
    }
    if (conv.isSpeaking) return;
    if (now - measureOpenedAt.current < 7500) return;
    if (now - lastCueAt.current < 9000 || cue === lastCueText.current) return;
    lastCueAt.current = now;
    lastCueText.current = cue;
    send(cue);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s: Saved = JSON.parse(raw);
        if (hasAnswers(s.answers)) setSaved(s);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || phase === "intro") return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ answers, evidence, lines: lines.slice(-80) }));
    } catch {}
  }, [answers, evidence, lines, phase, loaded]);

  useEffect(() => {
    if (session.current?.s.fit) void session.current.refit().catch(() => {});
  }, [l.lang, l.units]);

  const onEvidence = async (kind: Kind, ev: Evidence) => {
    setTimeout(() => setMeasuring(undefined), 1400);
    try {
      const r = await session.current?.addEvidence(kind, ev);
      if (!r) return;
      addLine({ role: "app", text: r.note });
      send(r.message);
    } catch {
      setErr(l.t.live.measuredNoUpdate);
    }
  };

  const closeMeasurement = () => {
    if (measuring) send(`[app] The golfer closed the ${KIND_LABEL[measuring]} without finishing it.`);
    setMeasuring(undefined);
    setAttached(undefined);
  };

  const openYourself = (kind: Kind, with_?: Attached) => {
    setAttached(with_);
    setMeasuring(kind);
    measureOpenedAt.current = Date.now();
    lastCueAt.current = 0;
    lastCueText.current = "";
    addLine({ role: "app", text: l.t.live.opened(l.t.live.kind[kind]) });
    conv.sendContextualUpdate(`[app] The golfer opened the ${KIND_LABEL[kind]} themselves`
      + (with_?.file ? ` with a ${with_.file.type.startsWith("video/") ? "video" : "photo"} of their screen`
        : with_?.url ? " with a TrackMan report link" : "")
      + ". At most one short sentence of guidance, then wait for the [measurement] result.");
  };

  const start = async (text: boolean, resume: boolean) => {
    setErr(undefined);
    setTextMode(text);
    const from = resume ? saved : undefined;
    session.current = newSession(from && { answers: from.answers, evidence: from.evidence });
    setState(session.current.s);
    setLines(from?.lines ?? []);
    resuming.current = !!from;
    if (from) void session.current.refit().catch(() => {});
    else localStorage.removeItem(KEY);
    setPhase("connecting");
    try {
      if (!text) await navigator.mediaDevices.getUserMedia({ audio: true });
      const { signed_url } = await api.voiceSession();
      const name = from?.answers.x.name;
      conv.startSession({
        signedUrl: signed_url,
        connectionType: "websocket",
        textOnly: text,
        clientTools: session.current.tools(),
        overrides: {
          agent: {
            language: l.lang,
            firstMessage: from ? l.t.agent.welcomeBack(name) : l.t.agent.hello,
          },
        },
      });
    } catch (e) {
      setPhase("intro");
      if (e instanceof ApiError && e.status === 503) setUnavailable(true);
      else if (e instanceof ApiError && e.status === 429) setErr(l.t.live.busy);
      else if (e instanceof DOMException) setErr(l.t.live.micNeeded);
      else setErr(l.t.live.unreachable);
    }
  };

  useEffect(() => {
    if (phase !== "live" || !resuming.current || !session.current) return;
    resuming.current = false;
    const s = session.current.s;
    const al = agentL(l.units);
    const known = Object.entries({ ...s.answers.q, ...s.answers.x })
      .filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ");
    const need = needList(s.answers, al);
    conv.sendContextualUpdate(`[app] Returning golfer (language: ${l.lang}, units: ${l.units}). What they told you before: ${known}. `
      + (need.length ? `Still needed before a fit: ${need.join(", ")}. ` : "")
      + (s.fit ? `Current fit:\n${fitBrief(s.fit, evidenceKeysOf(s.evidence, s.fit), al)}` : ""));
  }, [phase, conv, l.lang, l.units]);

  const end = () => {
    conv.endSession();
    setPhase("ended");
  };

  if (phase === "intro" || phase === "connecting") {
    return <Intro phase={phase} saved={saved} unavailable={unavailable} err={err} onStart={start} />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink text-paper">
      <header className="relative z-20 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] text-[13px] sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <TakomoLogo tone="dark" href="/" />
            <span className="hidden items-center gap-1.5 text-white/55 md:flex">
              <span className={cx("size-1.5 shrink-0 rounded-full", phase === "live" ? "bg-accent" : "bg-white/30")} />
              {phase === "live" ? l.t.live.liveFitting : l.t.live.ended}
            </span>
          </div>
          <div className="hidden sm:block">
            <SpecPill fit={fit} answers={answers} changed={changed} />
          </div>
          <div className="flex flex-1 items-center justify-end gap-1.5">
            <LocaleSwitch tone="dark" label={false} />
            {fit && (
              <HeaderButton tone="accent" onClick={() => setResultsOpen(true)}>
                <SpecIcon />
                <span>{l.t.live.results}</span>
              </HeaderButton>
            )}
            {phase === "live" && (
              <HeaderButton tone="subtle" onClick={end}>
                <EndIcon />
                <span>{l.t.live.end}</span>
              </HeaderButton>
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-center sm:hidden">
          <SpecPill fit={fit} answers={answers} changed={changed} />
        </div>
      </header>

      <Transcript lines={lines} speaking={conv.isSpeaking} />

      {err && (
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="mb-2 rounded-2xl bg-accent/15 px-4 py-2.5 text-[14px] text-paper">{err}</div>
        </div>
      )}

      {phase === "live" ? (
        <Composer textMode={textMode} speaking={conv.isSpeaking} muted={conv.isMuted} onMute={() => conv.setMuted(!conv.isMuted)}
                  onAttach={openYourself}
                  onSend={(t) => {
                    const link = t.match(TRACKMAN_LINK)?.[0];
                    if (link) openYourself("launch_monitor", { url: link });
                    else { addLine({ role: "you", text: t }); send(t); }
                  }} />
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-2 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2">
          {fit && (
            <Link href={`/fit/${fit.fit_id}`}
                  className="block rounded-full bg-accent py-3 text-center font-display text-[17px] font-bold uppercase tracking-wide text-ink hover:bg-accent-strong">
              {l.t.live.seeFull}
            </Link>
          )}
          <button type="button" className="block w-full rounded-full py-3 text-center text-white/75 hover:bg-white/[0.06] hover:text-paper"
                  onClick={() => { setSaved({ answers, evidence, lines }); setPhase("intro"); }}>
            {l.t.live.again}
          </button>
        </div>
      )}

      {measuring && (
        <Sheet title={l.t.live.kind[measuring]} caption={lastFitterLine(lines)} speaking={conv.isSpeaking}
               textMode={textMode} muted={conv.isMuted} onMute={() => conv.setMuted(!conv.isMuted)} onClose={closeMeasurement}>
          <Measurement kind={measuring} heightCm={answers.q.height_cm ?? 175} onCoach={onCoach} attached={attached}
                       onEvidence={(ev) => { setAttached(undefined); void onEvidence(measuring, ev); }} />
        </Sheet>
      )}

      {resultsOpen && fit && (
        <Sheet title={l.t.live.resultsTitle} caption={lastFitterLine(lines)} speaking={conv.isSpeaking}
               textMode={textMode} muted={conv.isMuted} onMute={() => conv.setMuted(!conv.isMuted)} onClose={() => setResultsOpen(false)}>
          <ResultsPreview fit={fit} />
        </Sheet>
      )}
    </div>
  );
}

// The voice model's delivery tags ("[happy]", "[laughs]") steer speech and are never shown.
const spoken = (text: string) => text.replace(/\[[a-z][a-z ,'-]{0,30}\]\s*/gi, "").trim();
const lastFitterLine = (lines: Line[]) => {
  const t = [...lines].reverse().find((l) => l.role === "fitter")?.text;
  return t && spoken(t);
};

function HeaderButton({ onClick, tone = "default", children }: {
  onClick: () => void;
  tone?: "default" | "accent" | "subtle";
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
            className={cx(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition",
              tone === "accent" && "bg-accent/15 text-accent ring-1 ring-accent/30 hover:bg-accent/25",
              tone === "subtle" && "border border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/10 hover:text-paper",
              tone === "default" && "text-white/80 hover:bg-white/[0.08] hover:text-paper",
            )}>
      {children}
    </button>
  );
}

function SpecIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2" width="11" height="12" rx="2" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </svg>
  );
}

function EndIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="4" y="4" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Intro({ phase, saved, unavailable, err, onStart }: {
  phase: Phase; saved?: Saved; unavailable: boolean; err?: string; onStart: (text: boolean, resume: boolean) => void;
}) {
  const l = useI18n();
  const intro = l.t.live.intro;
  const busy = phase === "connecting";
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-paper">
    <SiteHeader tone="dark" />
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),2rem)] pt-2 sm:px-6 sm:pt-6">
      <h1 className="mt-6 text-[38px] italic leading-none sm:mt-8 sm:text-[48px]">{intro.title}</h1>
      <p className="mt-3.5 text-[16px] leading-relaxed text-white/75 sm:text-[17px]">{intro.body}</p>
      <ul className="mt-6 flex flex-wrap gap-2 text-[14px] text-white/80">
        {intro.bullets.map((b) => (
          <li key={b} className="rounded-full bg-white/[0.07] px-3.5 py-1.5">{b}</li>
        ))}
      </ul>

      {saved && !unavailable && (
        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <div className="font-medium">{intro.welcomeBack(saved.answers.x.name)}</div>
          <p className="mt-1 text-[14px] text-white/70">{intro.remembers}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => onStart(false, true)}
                    className="min-h-11 flex-1 rounded-full bg-paper px-4 py-2.5 font-semibold text-ink disabled:opacity-50">{l.t.common.continue}</button>
            <button type="button" disabled={busy} onClick={() => onStart(true, true)}
                    className="min-h-11 rounded-full border border-white/25 px-4 py-2.5 disabled:opacity-50">{intro.continueText}</button>
          </div>
        </div>
      )}

      <div className="mt-auto space-y-3 pt-8 sm:mt-10">
        {unavailable ? (
          <div className="rounded-2xl bg-white/10 p-4 text-[15px]">
            {intro.unavailable}{" "}
            <Link href="/fit/guided" className="underline">{intro.unavailableLink}</Link>{intro.unavailableTail}
          </div>
        ) : (
          <>
            {err && <div className="rounded-xl bg-flag/25 px-4 py-3 text-[14px]">{err}</div>}
            {busy ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-8">
                <StickmanLoader label={intro.connecting} />
              </div>
            ) : (
              <>
                <button type="button" onClick={() => onStart(false, false)}
                        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-[4px] bg-accent px-6 font-display text-[18px] font-bold uppercase tracking-wide text-ink hover:bg-accent-strong">
                  {saved ? intro.startNew : intro.start}
                </button>
                <button type="button" onClick={() => onStart(true, false)}
                        className="min-h-12 w-full rounded-[4px] border border-white/40 px-6 py-3 font-display text-[16px] font-bold uppercase tracking-wide hover:bg-white hover:text-ink">
                  {intro.type}
                </button>
                <Link href="/fit/guided" className="block py-1 text-center text-[13px] text-white/60 underline-offset-4 hover:underline">
                  {intro.guided}
                </Link>
              </>
            )}
          </>
        )}
        <p className="pt-1 text-center text-[12px] text-white/45">
          {intro.privacy} {l.t.fitter.aiNotice}
        </p>
      </div>
    </main>
    </div>
  );
}

const TONE = { good: "text-paper/90", neutral: "text-white/55", close: "text-accent" };

function SpecPill({ fit, answers, changed }: { fit?: FitResponse; answers: Answers; changed: Set<string> }) {
  const l = useI18n();
  const [open, setOpen] = useState(false);
  const comps = fit ? PARTS.map((p) => fit.components.find((c) => c.part === p)!).filter(Boolean) : [];
  const need = needList(answers, l);
  const answered = Math.max(0, 7 - need.length);
  const confirmed = comps.filter((c) => certainty(c).key === "confirmed").length;
  const progressBadge = fit ? `${confirmed}/${PARTS.length}` : `${answered}/7`;
  const img = fit ? headImage(fit.spec.head, 240) : undefined;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
              className={cx("flex max-w-[78vw] items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] transition sm:max-w-sm",
                            "bg-white/[0.07] hover:bg-white/[0.11]", changed.size > 0 && "ring-2 ring-accent")}>
        {img
          ? <img src={img} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full bg-white object-contain p-0.5" />
          : <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10"><GolferStickman className="size-3.5" /></span>}
        <span className="truncate font-medium text-paper/90">
          {fit ? `${fit.spec.head_name} · ${fit.spec.purchase === "stock" ? l.t.spec.stock : l.t.spec.custom}` : l.t.live.hud.yourSpec}
        </span>
        <span className={cx("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                            fit && confirmed === PARTS.length ? "bg-[#132a1c] text-[#9fd3b0]" : "bg-white/10 text-white/75")}>
          {progressBadge}
        </span>
        <svg aria-hidden viewBox="0 0 12 12" className={cx("size-3 shrink-0 text-white/50 transition", open && "rotate-180")}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(92vw,30rem)] -translate-x-1/2 rounded-3xl bg-[#1a1a1a] p-2 shadow-2xl shadow-black/60 ring-1 ring-white/[0.08]">
            {fit ? comps.map((c) => {
              const ce = certainty(c);
              return (
                <div key={c.part} className={cx("flex items-baseline gap-3 rounded-2xl px-3 py-2 transition-colors duration-700",
                                                 changed.has(c.part) && "bg-accent/15")}>
                  <span className="w-20 shrink-0 text-[12px] text-white/45">{l.t.part[c.part]}</span>
                  <span className="flex-1 truncate text-[14px] font-medium text-paper">{partValue(c.part, c.value, fit, l)}</span>
                  <span className={cx("shrink-0 text-[12px] font-medium", TONE[ce.tone])}>{certaintyLabel(c, l)}</span>
                </div>
              );
            }) : (
              <div className="space-y-2 px-3 py-2 text-[14px] text-white/60">
                <div className="flex items-center justify-between text-[12px] text-white/50">
                  <span>{l.t.live.hud.buildsHere}</span>
                  <span className="tabular-nums font-medium text-paper/80">{answered} / 7</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${Math.round((answered / 7) * 100)}%` }} />
                </div>
                {need.length > 0 && <p className="text-[13px]">{l.t.live.hud.stillNeeds(need.join(", "))}</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Transcript({ lines, speaking }: { lines: Line[]; speaking: boolean }) {
  const l = useI18n();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines.length]);
  const lastFitter = lines.map((ln) => ln.role).lastIndexOf("fitter");
  return (
    <div className="chat-scroll min-h-0 flex-1 overflow-y-auto" aria-live="polite">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-6 pt-6 sm:px-6">
        {lines.length === 0 && (
          <div className="pt-14">
            <StickmanLoader label={l.t.live.joining} />
          </div>
        )}
        {lines.map((ln, i) => ln.role === "app" ? (
          <div key={i} className="flex items-center gap-3 text-[12px] text-white/40">
            <span className="h-px flex-1 bg-white/[0.07]" />
            <span className="max-w-[80%] text-center">{ln.text}</span>
            <span className="h-px flex-1 bg-white/[0.07]" />
          </div>
        ) : ln.role === "you" ? (
          <div key={i} className="flex justify-end">
            <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-white/[0.08] px-4 py-2.5 text-[16px] leading-relaxed sm:max-w-[70%]">
              {ln.text}
            </div>
          </div>
        ) : (
          <div key={i} className="flex gap-3.5">
            <Avatar speaking={speaking && i === lastFitter} />
            <div className="min-w-0 flex-1 whitespace-pre-wrap pt-0.5 text-[16px] leading-7 text-paper/90">{spoken(ln.text)}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
    </div>
  );
}

function Avatar({ speaking }: { speaking: boolean }) {
  const l = useI18n();
  return (
    <div className="relative grid size-8 shrink-0 place-items-center rounded-full bg-accent text-ink" title={l.t.fitter.role}>
      {speaking && <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" />}
      <GolferStickman className="relative size-4.5" />
    </div>
  );
}

function MicIcon({ off }: { off: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

function Composer({ textMode, speaking, muted, onMute, onSend, onAttach }: {
  textMode: boolean; speaking: boolean; muted: boolean; onMute: () => void; onSend: (t: string) => void;
  onAttach: (kind: Kind, with_?: Attached) => void;
}) {
  const l = useI18n();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const status = muted ? l.t.live.micOff : speaking ? l.t.live.talking : l.t.live.listening;
  const mediaIn = (files?: FileList | null) => [...(files ?? [])].find((f) => /^(image|video)\//.test(f.type));
  return (
    <div className="px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:px-6">
      <div className="relative mx-auto w-full max-w-3xl">
        {menu && (
          <>
            <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
            <div role="menu" className="absolute bottom-full left-0 z-20 mb-2 w-[min(92vw,16rem)] rounded-3xl bg-[#1a1a1a] p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/[0.08]">
              {ATTACH.map((k) => (
                <button key={k} type="button" role="menuitem" title={l.t.live.kindHint[k]}
                        onClick={() => { setMenu(false); onAttach(k); }}
                        className="flex w-full items-start rounded-2xl px-3.5 py-2.5 text-left hover:bg-white/[0.07]">
                  <span className="text-[15px] font-medium text-paper">{l.t.live.kind[k]}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text.trim()); setText(""); } }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = mediaIn(e.dataTransfer.files);
                if (f) onAttach("launch_monitor", { file: f });
              }}
              className={cx("flex items-center gap-1.5 rounded-[28px] bg-white/[0.07] p-2 ring-1 transition",
                            "focus-within:bg-white/[0.09] focus-within:ring-white/[0.14]",
                            dragging ? "ring-2 ring-accent" : "ring-white/[0.06]")}>
          <button type="button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-haspopup="menu"
                  aria-label={l.t.live.attach} title={l.t.live.attach}
                  className={cx("grid size-10 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-paper",
                                menu && "bg-white/10 text-paper")}>
            <svg aria-hidden viewBox="0 0 24 24" className={cx("size-5 transition", menu && "rotate-45")} fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {!textMode && (
            <button type="button" onClick={onMute} aria-pressed={muted} aria-label={muted ? l.t.live.unmute : l.t.live.mute}
                    title={muted ? l.t.live.unmute : l.t.live.mute}
                    className={cx("relative grid size-10 shrink-0 place-items-center rounded-full transition",
                                  muted ? "bg-white/10 text-white/50 hover:text-paper" : "bg-accent/15 text-accent hover:bg-accent/25")}>
              {!muted && !speaking && <span className="absolute inset-1 animate-ping rounded-full bg-accent/20" />}
              <MicIcon off={muted} />
            </button>
          )}
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={textMode ? l.t.live.typeAnswer : l.t.live.orType}
                 aria-label={l.t.live.messageLabel}
                 onPaste={(e) => {
                   const f = mediaIn(e.clipboardData.files);
                   if (f) { e.preventDefault(); onAttach("launch_monitor", { file: f }); }
                 }}
                 className={cx("min-w-0 flex-1 bg-transparent py-2 text-[16px] text-paper outline-none placeholder:text-white/40", textMode && "pl-3")} />
          <button type="submit" disabled={!text.trim()} aria-label={l.t.common.send}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-ink transition hover:bg-accent-strong disabled:bg-white/10 disabled:text-white/30">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-white/35">
          {!textMode && <>{status} · </>}{l.t.fitter.aiNotice}
        </p>
      </div>
    </div>
  );
}

function Sheet({ title, caption, speaking, textMode, muted, onMute, onClose, children }: {
  title: string; caption?: string; speaking: boolean; textMode: boolean; muted: boolean;
  onMute: () => void; onClose: () => void; children: ReactNode;
}) {
  const l = useI18n();
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-ink text-paper" role="dialog" aria-label={title}>
      <div className="px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TakomoLogo tone="dark" />
            <h2 className="truncate text-[17px] sm:text-[19px]">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[13px]">
            {!textMode && (
              <HeaderButton tone={muted ? "subtle" : "accent"} onClick={onMute}>
                <MicIcon off={muted} />
                <span>{muted ? l.t.live.unmute : l.t.live.mute}</span>
              </HeaderButton>
            )}
            <HeaderButton tone="subtle" onClick={onClose}>{l.t.live.notNow}</HeaderButton>
          </div>
        </div>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col pt-2">
        <div className="mx-4 mb-3 flex items-start gap-3.5 sm:mx-6">
          <Avatar speaking={speaking} />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className={cx("text-[11px] font-medium uppercase tracking-wider", speaking ? "text-accent" : "text-white/45")}>
              {speaking ? l.t.live.talking : muted ? l.t.live.micOff : l.t.live.listening}
            </div>
            {caption && <div className="mt-0.5 line-clamp-2 text-[15px] leading-snug text-paper/90">{caption}</div>}
          </div>
        </div>
        <div className="chat-scroll flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:px-6">{children}</div>
      </div>
    </div>
  );
}

function Measurement({ kind, heightCm, onCoach, onEvidence, attached }: {
  kind: Kind; heightCm: number; onCoach: (cue: string, immediate?: boolean) => void; onEvidence: (ev: Evidence) => void;
  attached?: Attached;
}) {
  const light = (c: ReactNode) => <div className="rounded-2xl bg-paper p-4 text-ink">{c}</div>;
  switch (kind) {
    case "body":
      return <LiveBody heightCm={heightCm} onCoach={onCoach} onDone={(b) => onEvidence({ body_photo: b })} />;
    case "swing":
      return <LiveSwing onCoach={onCoach} onDone={(s) => onEvidence({ swing_video: s })} />;
    case "hand":
      return light(<HandCapture onDone={(h) => onEvidence({ hand_photo: h })} />);
    case "ball_line":
      return light(<BallLineCapture onDone={(t) => onEvidence({ ball_line_tilts_deg: t })} />);
    case "launch_monitor":
      return light(<LaunchMonitorImport initial={attached} onDone={(lm) => onEvidence({ launch_monitor: lm })} />);
  }
}

function ResultsPreview({ fit }: { fit: FitResponse }) {
  const l = useI18n();
  const s = fit.spec;
  const img = headImage(s.head, 480);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[28px] font-semibold leading-tight">{s.head_name}</div>
          <p className="mt-2 text-[15px] text-white/75">{certaintySummary(fit, l)}</p>
        </div>
        {img && (
          <img src={img} alt={s.head_name} width={96} height={96}
               className="size-22 shrink-0 rounded-2xl bg-white object-contain p-2" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.07] p-4">
        {[
          [l.t.part.shaft, partValue("shaft", s.shaft.slug, fit, l)],
          [l.t.part.length, partValue("length", String(s.length_in), fit, l)],
          [l.t.spec.lie, partValue("lie", String(s.lie_deg), fit, l)],
          [l.t.part.grip, partValue("grip", s.grip, fit, l)],
          [l.t.spec.hand, s.handedness === "left" ? l.t.spec.left : l.t.spec.right],
          [l.t.part.purchase, s.purchase === "stock" ? l.t.spec.stock : l.t.spec.custom],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="text-[12px] text-white/50">{k}</div>
            <div className="font-medium capitalize">{v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/[0.07] p-4 text-[14px] text-white/80">{fit.stock_advice.message}</div>
      <a href={headPage(s.head)} target="_blank" rel="noopener noreferrer"
         className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-paper px-5 py-3 text-center font-semibold text-ink">
        <span>{l.t.result.orderOnTakomo(s.head_name)}</span>
        <ExternalIcon />
      </a>
      <Link href={`/fit/${fit.fit_id}`} target="_blank"
            className="block rounded-full border border-white/25 py-3 text-center font-medium text-paper hover:bg-white/10">
        {l.t.live.openFull}
      </Link>
      <p className="text-center text-[12px] text-white/45">{l.t.live.newTab}</p>
    </div>
  );
}
