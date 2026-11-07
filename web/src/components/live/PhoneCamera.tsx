"use client";

import { useEffect, useRef, useState } from "react";
import { TakomoLogo } from "@/components/TakomoLogo";
import { useI18n } from "@/i18n/context";
import { api, ApiError, type Evidence, type Handoff } from "@/lib/api";
import { StickmanLoader } from "../ui";
import { CameraCapture } from "./CameraCapture";

type State = "loading" | "ready" | "sending" | "sent" | "unsent" | "gone";

/** The phone side of a handoff: one camera measurement, sent back to the computer that showed the code. */
export function PhoneCamera({ code }: { code: string }) {
  const l = useI18n();
  const [task, setTask] = useState<Handoff>();
  const [state, setState] = useState<State>("loading");
  const pending = useRef<Evidence>(undefined);
  const setLocale = useRef(l.setLocale);

  useEffect(() => {
    api.openHandoff(code).then((h) => {
      setLocale.current({ lang: h.lang, units: h.units });
      setTask(h);
      setState("ready");
    }).catch(() => setState("gone"));
  }, [code]);

  const send = async () => {
    setState("sending");
    for (let i = 0; i < 3; i++) {
      try {
        await api.postHandoff(code, { evidence: pending.current });
        return setState("sent");
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return setState("gone");
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
    setState("unsent");
  };

  const t = l.t.phone;
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-paper">
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <TakomoLogo tone="dark" />
        {task && state !== "gone" && (
          <span className="flex items-center gap-1.5 text-[12px] text-white/55">
            <span className="size-1.5 rounded-full bg-accent" />{t.paired}
          </span>
        )}
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {state === "loading" && <div className="pt-24"><StickmanLoader /></div>}
        {state === "gone" && <p className="pt-24 text-center text-[16px] text-white/80">{t.gone}</p>}
        {task && (state === "ready" || state === "sending") && (
          <>
            <h1 className="mb-3 mt-2 text-[22px]">{l.t.live.kind[task.kind]}</h1>
            <CameraCapture kind={task.kind} heightCm={task.height_cm ?? 175}
                           onCoach={(cue, immediate) => void api.postHandoff(code, { cue, immediate }).catch(() => {})}
                           onEvidence={(ev) => { pending.current = ev; void send(); }} />
          </>
        )}
        {state === "sent" && (
          <div className="flex flex-col items-center gap-4 pt-24 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#132a1c] text-[26px] text-[#9fd3b0]">✓</span>
            <p className="text-[18px]">{t.sent}</p>
          </div>
        )}
        {state === "unsent" && (
          <div className="space-y-3 pt-24 text-center">
            <p className="text-[16px] text-white/80">{t.sendFailed}</p>
            <button type="button" onClick={() => void send()} className="rounded-full bg-paper px-5 py-2.5 font-semibold text-ink">{t.retry}</button>
          </div>
        )}
      </main>
    </div>
  );
}
