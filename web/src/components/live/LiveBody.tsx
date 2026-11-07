"use client";

import { useRef, useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { agentL, type L } from "@/i18n";
import { useI18n } from "@/i18n/context";
import type { BodyPhoto } from "@/lib/api";
import { playChime } from "@/lib/audio";
import { measureBody, MeasurementError } from "@/lib/vision/body";
import { cx } from "../ui";
import { CameraView, drawSkeleton, Hint, Tips, useCamera, usePoseLoop } from "./camera";

const SHOTS = 3;
const MAX_TRIES = 6;
const STEADY_FRAMES = 14;
// Landmarks of a golfer 3-4 m away jitter by several pixels a frame, so framing is judged on smoothed points and a
// problem only counts once it lasts a few frames.
const SMOOTH = 0.35;
const BAD_FRAMES = 5;
const STILL_MS = 700;
const TRACKED = [0, 15, 16, 27, 28];
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

type Track = { t: number; pts: { x: number; y: number }[] };

function smooth(prev: NormalizedLandmark[] | undefined, lm: NormalizedLandmark[]): NormalizedLandmark[] {
  if (!prev) return lm;
  return lm.map((p, i) => ({
    ...p,
    x: prev[i].x + SMOOTH * (p.x - prev[i].x),
    y: prev[i].y + SMOOTH * (p.y - prev[i].y),
    visibility: (prev[i].visibility ?? 1) + SMOOTH * ((p.visibility ?? 1) - (prev[i].visibility ?? 1)),
  }));
}

function check(lm: NormalizedLandmark[] | undefined, recent: Track[], l: L): string | null {
  if (!lm) return l.t.liveBody.notVisible;
  const vis = (i: number, min = 0.5) => (lm[i].visibility ?? 1) > min;
  if (![0, 15, 16].every((i) => vis(i))) return l.t.liveBody.headHands;
  if (!vis(27) || !vis(28) || !(vis(29, 0.4) || vis(31, 0.4)) || !(vis(30, 0.4) || vis(32, 0.4))) return l.t.liveBody.feet;
  const foot = Math.max(...[27, 28, 29, 30, 31, 32].filter((i) => vis(i, 0.4)).map((i) => lm[i].y));
  const bodyH = foot - lm[0].y;
  if (lm[0].y < 0.05) return l.t.liveBody.spaceAbove;
  if (foot > 0.99) return l.t.liveBody.feetEdge;
  if (bodyH < 0.4) return l.t.liveBody.closer;
  if (Math.min(lm[15].y, lm[16].y) < (lm[23].y + lm[24].y) / 2 - 0.04 * bodyH) return l.t.vision.armsDown;
  const moved = TRACKED.some((_, k) => {
    const xs = recent.map((r) => r.pts[k].x);
    const ys = recent.map((r) => r.pts[k].y);
    return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) > 0.025 * bodyH;
  });
  if (moved) return l.t.liveBody.holdStill;
  return null;
}

export function LiveBody({ heightCm, onDone, onCoach }: {
  heightCm: number;
  onDone: (b: BodyPhoto) => void;
  onCoach?: (cue: string, immediate?: boolean) => void;
}) {
  const l = useI18n();
  const cam = useCamera("user");
  const [hint, setHint] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<number>();
  const [captured, setCaptured] = useState(0);
  const [seen, setSeen] = useState(false);
  const smoothed = useRef<NormalizedLandmark[]>(undefined);
  const recent = useRef<Track[]>([]);
  const steady = useRef(0);
  const bad = useRef(0);
  const busy = useRef(false);
  const ratios = useRef<{ r: number; good: boolean }[]>([]);
  const tries = useRef(0);
  const problemSince = useRef(0);
  const lastProblem = useRef<string>(undefined);

  const capture = async () => {
    const v = cam.video.current;
    if (!v) return;
    busy.current = true;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    tries.current++;
    try {
      const m = await measureBody(c, l.t.vision);
      ratios.current.push({ r: m.ratio, good: m.quality === "good" });
      setCaptured(ratios.current.length);
      playChime("ping");
      setHint(m.issues.length ? m.issues.join(" ") : l.t.liveBody.got(ratios.current.length, SHOTS));
    } catch (e) {
      setHint(e instanceof MeasurementError ? e.message : l.t.liveBody.frameFailed);
    }
    const good = ratios.current.filter((x) => x.good);
    if (ratios.current.length >= SHOTS || (tries.current >= MAX_TRIES && ratios.current.length)) {
      const use = good.length >= 2 ? good : ratios.current;
      const ratio = Math.round(median(use.map((x) => x.r)) * 10000) / 10000;
      playChime("lock");
      setDone(ratio);
      onDone({ method: "ratio", wrist_to_floor_ratio: ratio, quality: good.length >= 2 ? "good" : "poor" });
      return;
    }
    if (tries.current >= MAX_TRIES) {
      tries.current = 0;
      setHint(l.t.liveBody.noClean);
      onCoach?.(
        "[camera] Couldn't get a clean full-body measurement. In one short sentence, ask the golfer to step back so their whole body is in frame and hold still with arms relaxed at their sides.",
        true,
      );
    }
    steady.current = 0;
    busy.current = false;
  };

  const canvas = usePoseLoop(cam, ({ lm: raw, t, ctx, W, H }) => {
    if (done !== undefined) return;
    const lm = raw && smooth(smoothed.current, raw);
    smoothed.current = lm;
    if (lm && !seen) setSeen(true);
    if (lm) {
      recent.current.push({ t, pts: TRACKED.map((i) => ({ x: lm[i].x, y: lm[i].y })) });
      while (recent.current.length && t - recent.current[0].t > STILL_MS) recent.current.shift();
    } else recent.current = [];
    const problem = check(lm, recent.current, l);
    const enProblem = check(lm, recent.current, agentL(l.units));
    if (lm) drawSkeleton(ctx, lm, W, H, problem ? "rgba(255,255,255,0.6)" : "#9fd3b0");
    if (busy.current) return;
    if (problem && ++bad.current < BAD_FRAMES) return;
    if (problem) {
      steady.current = 0;
      setHint(problem);
      if (enProblem && enProblem !== "Hold still…") {
        if (lastProblem.current !== enProblem) {
          lastProblem.current = enProblem;
          problemSince.current = t;
        } else if (t - problemSince.current > 7000) {
          problemSince.current = t;
          onCoach?.(`[camera] The golfer is positioning for the full-body photo, but: ${enProblem} Tell them in one short sentence how to adjust.`);
        }
      }
    } else {
      bad.current = 0;
      lastProblem.current = undefined;
      steady.current++;
      if (steady.current === 1) setHint(l.t.liveBody.perfect);
    }
    setProgress(Math.min(1, steady.current / STEADY_FRAMES));
    if (steady.current >= STEADY_FRAMES) void capture();
  }, done === undefined);

  return (
    <div className="space-y-3">
      <CameraView cam={cam} canvas={canvas} highlight={progress > 0 || done !== undefined}>
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {Array.from({ length: SHOTS }, (_, i) => {
            const locked = i < captured || done !== undefined;
            return (
              <div key={i} className={cx(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold backdrop-blur",
                locked ? "bg-[#132a1c]/90 text-[#9fd3b0] ring-1 ring-[#9fd3b0]/60" : "bg-black/55 text-white/60",
              )}>
                <span>#{i + 1}</span>
                {locked && <span>✓</span>}
              </div>
            );
          })}
        </div>
        {done !== undefined ? (
          <Hint tone="good" text={l.t.liveBody.result(l.f.cm(done * heightCm, 1), `${l.f.num(done * 100, 1)}%`)} />
        ) : (
          <Hint text={hint ?? l.t.liveBody.start} progress={progress} tone={progress > 0 ? "good" : "neutral"} />
        )}
        <Tips tips={l.t.liveBody.tips(l.f.room(3, 4))} show={!seen && cam.ready} />
      </CameraView>
    </div>
  );
}
