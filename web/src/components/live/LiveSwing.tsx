"use client";

import { useRef, useState } from "react";
import { agentL } from "@/i18n";
import { useI18n } from "@/i18n/context";
import type { SwingVideo } from "@/lib/api";
import { playChime } from "@/lib/audio";
import { tempoFromWristY, TempoError } from "@/lib/vision/tempo";
import { SwingCapture } from "../capture/SwingCapture";
import { cx } from "../ui";
import { CameraView, drawSkeleton, Hint, Tips, useCamera, usePoseLoop } from "./camera";

const SWINGS = 3;
const RATE = 60;
type Sample = { t: number; y: number };
type Result = { back: number; down: number; fps: number };
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/** Hands' height resampled to a steady rate, so the lab's swing-phase rules apply unchanged. */
function resample(s: Sample[], rate: number): number[] {
  const out: number[] = [];
  let j = 0;
  for (let t = s[0].t; t <= s[s.length - 1].t; t += 1000 / rate) {
    while (j < s.length - 2 && s[j + 1].t < t) j++;
    const a = s[j];
    const b = s[j + 1];
    const k = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
    out.push(a.y + (b.y - a.y) * Math.min(1, Math.max(0, k)));
  }
  return out;
}

export function LiveSwing({ onDone, onCoach }: {
  onDone: (s: SwingVideo) => void;
  onCoach?: (cue: string, immediate?: boolean) => void;
}) {
  const l = useI18n();
  const [upload, setUpload] = useState(false);
  if (upload) {
    return (
      <div className="space-y-3 rounded-2xl bg-paper p-4 text-ink">
        <SwingCapture onDone={onDone} />
        <button type="button" className="text-[13px] text-muted underline" onClick={() => setUpload(false)}>{l.t.liveSwing.useLive}</button>
      </div>
    );
  }
  return <Live onDone={onDone} onCoach={onCoach} onUpload={() => setUpload(true)} />;
}

function Live({ onDone, onCoach, onUpload }: {
  onDone: (s: SwingVideo) => void;
  onCoach?: (cue: string, immediate?: boolean) => void;
  onUpload: () => void;
}) {
  const l = useI18n();
  const cam = useCamera("user");
  const [hint, setHint] = useState<string>();
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [seen, setSeen] = useState(false);
  const buf = useRef<Sample[]>([]);
  const phase = useRef<"position" | "address" | "swing" | "cooldown">("position");
  const address = useRef(0);
  const start = useRef(0);
  const topY = useRef(1);
  const impactAt = useRef(0);
  const positionSince = useRef(0);
  const finished = results.length >= SWINGS;

  const analyse = () => {
    const s = buf.current.filter((x) => x.t >= start.current - 800);
    phase.current = "cooldown";
    setReady(false);
    const al = agentL(l.units);
    try {
      if (s.length < 10) throw new TempoError(l.t.vision.lostHands);
      const dts = s.slice(1).map((x, i) => x.t - s[i].t).sort((a, b) => a - b);
      const fps = 1000 / dts[Math.floor(dts.length / 2)];
      if (fps < 15) throw new TempoError(l.t.vision.slowCamera);
      const r = tempoFromWristY(resample(s, RATE), RATE, l.t.vision);
      if (r.backswingS < 0.4 || r.backswingS > 1.8 || r.downswingS < 0.12 || r.downswingS > 0.7) {
        throw new TempoError(l.t.vision.notASwing);
      }
      const next = [...results, { back: r.backswingS, down: r.downswingS, fps }];
      setResults(next);
      playChime(next.length >= SWINGS ? "lock" : "ping");
      if (next.length >= SWINGS) {
        const back = median(next.map((x) => x.back));
        const down = median(next.map((x) => x.down));
        setHint(l.t.liveSwing.result(l.f.sec(back), l.f.sec(down), l.f.ratio(back / down)));
        onDone({ fps: Math.round(median(next.map((x) => x.fps))), backswing_s: Math.round(back * 1000) / 1000,
                 downswing_s: Math.round(down * 1000) / 1000 });
        return;
      }
      setHint(l.t.liveSwing.swingDone(next.length, l.f.sec(r.backswingS), l.f.sec(r.downswingS), SWINGS));
      onCoach?.(
        `[camera] Swing ${next.length} of ${SWINGS} recorded: backswing ${al.f.sec(r.backswingS)}, downswing ${al.f.sec(r.downswingS)} `
          + `(${al.f.ratio(r.backswingS / r.downswingS)} tempo). In one short sentence, call out that swing to the golfer and tell them to take address for swing ${next.length + 1}.`,
        true,
      );
    } catch (e) {
      const msg = e instanceof TempoError ? e.message : l.t.liveSwing.couldntTime;
      setHint(msg);
      onCoach?.(
        `[camera] Couldn't time that swing (${msg}). In one short sentence, tell the golfer and ask them to reset at address and swing again.`,
        true,
      );
    }
    setTimeout(() => {
      buf.current = [];
      phase.current = "position";
      positionSince.current = 0;
    }, 1200);
  };

  const canvas = usePoseLoop(cam, ({ lm, t, ctx, W, H }) => {
    if (finished || !lm) return;
    if (!seen) setSeen(true);
    const vis = (i: number) => (lm[i].visibility ?? 1) > 0.5;
    const body = [0, 11, 12, 23, 24, 27, 28].every(vis);
    drawSkeleton(ctx, lm, W, H, ready ? "#9fd3b0" : "rgba(255,255,255,0.6)");
    const hands = [15, 16].filter((i) => (lm[i].visibility ?? 1) > 0.3);
    const prevY = buf.current[buf.current.length - 1]?.y;
    const y = hands.length ? hands.reduce((a, i) => a + lm[i].y, 0) / hands.length : prevY;
    if (y === undefined) return;
    buf.current.push({ t, y });
    if (buf.current.length > 400) buf.current.shift();
    const bodyH = Math.max(0.2, (lm[27].y + lm[28].y) / 2 - lm[0].y);

    if (phase.current === "position") {
      if (!body) {
        if (!positionSince.current) positionSince.current = t;
        else if (t - positionSince.current > 6500) {
          positionSince.current = t;
          onCoach?.("[camera] The golfer is in front of the camera but not fully in frame head to toe. In one short sentence, ask them to step back so you can see their whole body and club.");
        }
        return setHint(l.t.liveSwing.headToToe);
      }
      positionSince.current = 0;
      phase.current = "address";
      setHint(l.t.liveSwing.address);
    } else if (phase.current === "address") {
      const recent = buf.current.filter((x) => x.t > t - 550);
      const ys = recent.map((x) => x.y);
      const still = recent.length >= 6 && Math.max(...ys) - Math.min(...ys) < 0.032 * bodyH;
      if (still && !ready) {
        address.current = median(ys);
        setReady(true);
        playChime("ready");
        setHint(l.t.liveSwing.ready);
      }
      if (ready && address.current - y > 0.12 * bodyH) {
        phase.current = "swing";
        start.current = t;
        topY.current = y;
        impactAt.current = 0;
        setHint(l.t.liveSwing.swinging);
      }
    } else if (phase.current === "swing") {
      topY.current = Math.min(topY.current, y);
      const pastTop = address.current - topY.current > 0.35 * bodyH;
      if (pastTop && !impactAt.current && y >= address.current - 0.06 * bodyH) impactAt.current = t;
      if ((impactAt.current && t - impactAt.current > 450) || t - start.current > 3800) analyse();
    }
  }, !finished);

  return (
    <div className="space-y-3">
      <CameraView cam={cam} canvas={canvas} highlight={ready || finished}>
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {Array.from({ length: SWINGS }, (_, i) => {
            const r = results[i];
            const active = i === results.length && !finished;
            return (
              <div key={i} className={cx(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold backdrop-blur",
                r ? "bg-[#132a1c]/90 text-[#9fd3b0] ring-1 ring-[#9fd3b0]/60"
                  : active && ready ? "bg-[#9fd3b0] text-ink"
                  : active ? "bg-black/70 text-white ring-1 ring-white/30"
                  : "bg-black/45 text-white/50",
              )}>
                <span>#{i + 1}</span>
                {r && <span>{l.f.ratio(r.back / r.down)} ✓</span>}
              </div>
            );
          })}
        </div>
        <Hint text={hint ?? l.t.liveSwing.start(l.f.room(3))} tone={finished || ready ? "good" : "neutral"} />
        <Tips tips={l.t.liveSwing.tips} show={!seen && cam.ready} />
        {!finished && (
          <button type="button" onClick={onUpload}
                  className="absolute right-3 top-14 z-10 rounded-full bg-black/60 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur hover:bg-black/75">
            {l.t.liveSwing.upload}
          </button>
        )}
      </CameraView>
    </div>
  );
}
