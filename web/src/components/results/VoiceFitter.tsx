"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { api, ApiError, type Catalog, type FitResponse } from "@/lib/api";
import { emptyAnswers } from "@/lib/fitter/answers";
import { fitBrief } from "@/lib/fitter/describe";
import { evidenceKeysOf } from "@/lib/fitter/evidence";
import { fitterTools, type ToolState } from "@/lib/fitter/tools";
import type { FitContext } from "@/lib/session";
import { Button, cx, ErrorNote } from "../ui";

type Line = { role: "user" | "agent"; text: string };

export function VoiceFitter(props: { fit: FitResponse; ctx?: FitContext }) {
  return (
    <ConversationProvider>
      <Voice {...props} />
    </ConversationProvider>
  );
}

function Voice({ fit, ctx }: { fit: FitResponse; ctx?: FitContext }) {
  const l = useI18n();
  const [lines, setLines] = useState<Line[]>([]);
  const [err, setErr] = useState<string>();
  const [starting, setStarting] = useState(false);
  const state = useRef<ToolState>({ answers: emptyAnswers(), evidence: {} });
  state.current = { ...state.current, fit, answers: ctx ? { q: ctx.q, x: ctx.x } : emptyAnswers() };
  const locRef = useRef<Locale>({ lang: l.lang, units: l.units });
  locRef.current = { lang: l.lang, units: l.units };
  const lRef = useRef(l);
  lRef.current = l;
  const brief = fitBrief(fit, evidenceKeysOf({}, fit), l, ctx ? { q: ctx.q, x: ctx.x } : undefined);
  const sentBrief = useRef<string>(undefined);

  const conv = useConversation({
    onMessage: (m) => setLines((xs) => [...xs, { role: m.role === "user" ? "user" : "agent", text: m.message }]),
    onError: (message) => setErr(message || lRef.current.t.voice.dropped),
  });
  const live = conv.status === "connected";

  const tools = useMemo(() => fitterTools({
    state: () => state.current,
    setCatalog: (c: Catalog) => (state.current.catalog = c),
    locale: () => locRef.current,
  }), []);

  useEffect(() => {
    if (!live || sentBrief.current === brief) return;
    conv.sendContextualUpdate(`[app] ${sentBrief.current ? "The fit was just recomputed." : "The golfer is looking at "
      + "their finished fit and wants to talk it through. Answer their questions."}\n${brief}`);
    sentBrief.current = brief;
  }, [brief, live, conv]);

  const start = async () => {
    setErr(undefined);
    setStarting(true);
    sentBrief.current = undefined;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { signed_url } = await api.voiceSession(fit.fit_id);
      conv.startSession({
        signedUrl: signed_url, connectionType: "websocket", clientTools: tools,
        overrides: {
          agent: {
            firstMessage: l.t.agent.onFit(ctx?.x.name),
            language: l.lang,
          },
        },
      });
    } catch (e) {
      setErr(
        e instanceof ApiError && e.status === 503
          ? l.t.voice.notOn
          : e instanceof DOMException
            ? l.t.voice.mic
            : l.t.voice.failed,
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className={cx("relative grid size-14 shrink-0 place-items-center rounded-full",
                           live ? "bg-fairway text-paper" : "bg-line text-ink")}>
          {live && conv.isSpeaking && <span className="absolute inset-0 animate-ping rounded-full bg-fairway/40" />}
          <MicIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {live ? (conv.isSpeaking ? l.t.voice.talking : l.t.voice.listening)
                  : conv.status === "connecting" || starting ? l.t.voice.connecting : l.t.voice.talkThrough}
          </div>
          <div className="text-[13px] text-muted">
            {l.t.voice.hint}
          </div>
        </div>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      {live ? (
        <Button variant="secondary" className="w-full" onClick={() => conv.endSession()}>{l.t.voice.end}</Button>
      ) : (
        <Button className="w-full" onClick={() => void start()} disabled={starting || conv.status === "connecting"}>
          {l.t.voice.talk}
        </Button>
      )}
      {lines.length > 0 && (
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl bg-paper p-3" aria-live="polite">
          {lines.map((line, i) => (
            <div key={i} className={cx("max-w-[85%] rounded-2xl px-3 py-2 text-[14px]",
                                       line.role === "user" ? "ml-auto bg-ink text-paper" : "bg-white")}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="relative size-6" fill="none" stroke="currentColor" strokeWidth={1.8}
         strokeLinecap="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
