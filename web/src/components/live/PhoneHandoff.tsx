"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import { api, ApiError, type Evidence } from "@/lib/api";
import { StickmanLoader } from "../ui";
import type { CameraKind } from "./CameraCapture";

type Status = "making" | "waiting" | "opened" | "expired" | "failed";
const POLL_MS = 1500;

/** Hands one camera measurement to the golfer's phone and relays its cues and result back to this session. */
export function PhoneHandoff({ kind, heightCm, onCoach, onEvidence, onOpened, onUseHere }: {
  kind: CameraKind; heightCm: number;
  onCoach: (cue: string, immediate?: boolean) => void; onEvidence: (ev: Evidence) => void;
  onOpened: () => void; onUseHere: () => void;
}) {
  const l = useI18n();
  const [status, setStatus] = useState<Status>("making");
  const [url, setUrl] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const latest = useRef({ onCoach, onEvidence, onOpened, lang: l.lang, units: l.units, heightCm });
  latest.current = { onCoach, onEvidence, onOpened, lang: l.lang, units: l.units, heightCm };

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setStatus("making");
    setUrl(undefined);
    (async () => {
      const { lang, units, heightCm: height_cm } = latest.current;
      let code: string;
      try {
        code = (await api.createHandoff({ kind, lang, units, height_cm })).code;
      } catch {
        if (!stop) setStatus("failed");
        return;
      }
      if (stop) return;
      setUrl(`${window.location.origin}/m/${code}`);
      setStatus("waiting");
      let after = 0;
      let opened = false;
      const poll = async () => {
        try {
          const ev = await api.handoffEvents(code, after);
          if (stop) return;
          if (ev.opened && !opened) {
            opened = true;
            setStatus("opened");
            latest.current.onOpened();
          }
          ev.cues.forEach((c) => latest.current.onCoach(c.text, c.immediate));
          after = ev.next;
          if (ev.evidence) return latest.current.onEvidence(ev.evidence);
        } catch (e) {
          if (stop) return;
          if (e instanceof ApiError && e.status === 404) return setStatus("expired");
        }
        timer = setTimeout(poll, POLL_MS);
      };
      void poll();
    })();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [kind, attempt]);

  const t = l.t.phone;
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/[0.05] px-6 py-8 text-center">
      {status === "making" && <div className="py-16"><StickmanLoader /></div>}
      {(status === "waiting" || status === "opened") && url && (
        <>
          <div className="rounded-2xl bg-white p-3" title={t.scanTip}>
            <QRCodeSVG value={url} size={196} marginSize={0} className={status === "opened" ? "opacity-25" : undefined} />
          </div>
          <div className="text-[17px] font-medium" title={t.scanTip}>{status === "opened" ? t.connected : t.scan}</div>
          {status === "waiting" && <div className="text-[13px] text-white/50">{t.waiting}</div>}
        </>
      )}
      {(status === "expired" || status === "failed") && (
        <div className="space-y-3 py-10">
          <p className="text-[15px] text-white/80">{status === "expired" ? t.expired : t.failed}</p>
          {status === "expired" && (
            <button type="button" onClick={() => setAttempt((a) => a + 1)}
                    className="rounded-full bg-paper px-5 py-2.5 font-semibold text-ink">{t.newCode}</button>
          )}
        </div>
      )}
      <button type="button" onClick={onUseHere} className="text-[13px] text-white/55 underline-offset-4 hover:text-paper hover:underline">
        {t.here}
      </button>
    </div>
  );
}
