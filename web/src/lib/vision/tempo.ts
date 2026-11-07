import en, { type Messages } from "@/i18n/messages/en";
import { videoPose, videoTimestamp } from "./mediapipe";

export type Tempo = {
  backswingS: number;
  downswingS: number;
  ratio: number;
  /** Frame rate the swing was captured at. */
  fps: number;
  /** Frame rate the file plays back at; lower than `fps` when slow motion is baked into the file. */
  playbackFps?: number;
  /** Indices into the analysed samples, or (after tempoFromVideo) media times in seconds. */
  frames: { takeaway: number; top: number; impact: number };
};

export class TempoError extends Error {}

function smooth(y: number[], k: number): number[] {
  if (k <= 1) return y;
  const out = new Array(y.length);
  const h = Math.floor(k / 2);
  for (let i = 0; i < y.length; i++) {
    let s = 0;
    for (let j = i - h; j < i - h + k; j++) s += y[Math.min(y.length - 1, Math.max(0, j))];
    out[i] = s / k;
  }
  return out;
}

/** Takeaway, top and impact from the hands' image height (y down). Same rules as the lab's camera/tempo.py. */
export function tempoFromWristY(y: number[], fps: number, vis: Messages["vision"] = en.vision): Tempo {
  const ys = smooth(y, Math.max(1, Math.round(fps / 60)));
  const n0 = Math.max(3, Math.floor(0.15 * fps));
  const head = [...ys.slice(0, n0)].sort((a, b) => a - b);
  const address = head[Math.floor(head.length / 2)];
  const span = address - Math.min(...ys);
  if (span <= 0) throw new TempoError(vis.noBackswing);
  const thr = 0.04 * span;
  let takeaway = ys.findIndex((v) => address - v > thr);
  if (takeaway < 0) throw new TempoError(vis.noBackswing);
  while (takeaway > 0 && address - ys[takeaway - 1] > 0.005 * span) takeaway--;
  const w = Math.max(2, Math.floor(0.15 * fps));
  let top = -1;
  for (let i = takeaway + 1; i < ys.length - 1; i++) {
    const lo = Math.max(takeaway, i - w);
    const hi = Math.min(ys.length, i + w + 1);
    if (ys[i] <= Math.min(...ys.slice(lo, hi)) && address - ys[i] > 0.5 * span) {
      top = i;
      break;
    }
  }
  if (top < 0) top = ys.indexOf(Math.min(...ys));
  const win = ys.slice(top, Math.min(ys.length, top + Math.floor(0.6 * fps) + 1));
  const impact = top + win.indexOf(Math.max(...win));
  const backswingS = (top - takeaway) / fps;
  const downswingS = (impact - top) / fps;
  if (downswingS <= 0) throw new TempoError(vis.noImpact);
  return { backswingS, downswingS, ratio: backswingS / downswingS, fps, frames: { takeaway, top, impact } };
}

function seek(v: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    v.addEventListener("seeked", () => resolve(), { once: true });
    v.currentTime = t;
  });
}

/** Native frame rate, measured from presented-frame timestamps during a short muted playback. */
async function measureFps(v: HTMLVideoElement): Promise<number> {
  const rvfc = (v as HTMLVideoElement & {
    requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
  }).requestVideoFrameCallback?.bind(v);
  if (!rvfc) return 30;
  const times: number[] = [];
  v.muted = true;
  v.playbackRate = 0.25;
  await seek(v, 0);
  await new Promise<void>((resolve) => {
    const tick = (_: number, meta: { mediaTime: number }) => {
      times.push(meta.mediaTime);
      if (times.length < 25 && !v.ended) rvfc(tick);
      else resolve();
    };
    rvfc(tick);
    void v.play();
  });
  v.pause();
  const dts = times.slice(1).map((t, i) => t - times[i]).filter((d) => d > 0).sort((a, b) => a - b);
  if (!dts.length) return 30;
  return Math.round(1 / dts[Math.floor(dts.length / 2)]);
}

/**
 * Face-on swing video -> tempo. Runs entirely on the device.
 * `captureFps` is the slow-motion rate the golfer filmed at; phones often store slow motion as a
 * normal-speed file, so real time = media time * playback fps / capture fps.
 */
export async function tempoFromVideo(
  v: HTMLVideoElement,
  captureFps?: number,
  onProgress?: (p: number) => void,
  vis: Messages["vision"] = en.vision,
): Promise<Tempo> {
  const pose = await videoPose();
  const fps = await measureFps(v);
  const slowed = captureFps !== undefined && captureFps > fps * 1.5;
  const timeScale = slowed ? fps / captureFps : 1;
  const step = 1 / Math.min(fps, 120);
  const sampleFps = 1 / step;
  const end = Math.min(v.duration, slowed ? 10 / timeScale : 10);
  const ys: number[] = [];
  for (let t = 0; t < end; t += step) {
    await seek(v, t);
    const r = pose.detectForVideo(v, videoTimestamp(1000 / sampleFps));
    const lm = r.landmarks[0];
    if (lm) {
      const visLm = [15, 16].filter((i) => (lm[i].visibility ?? 1) > 0.3);
      ys.push(visLm.length ? visLm.reduce((s, i) => s + lm[i].y, 0) / visLm.length : ys[ys.length - 1] ?? Number.NaN);
    } else {
      ys.push(ys[ys.length - 1] ?? Number.NaN);
    }
    onProgress?.(t / end);
  }
  const first = ys.findIndex((y) => Number.isFinite(y));
  if (first < 0) throw new TempoError(vis.notInVideo);
  const track = ys.slice(first).map((y, i, a) => (Number.isFinite(y) ? y : a[i - 1]));
  const raw = tempoFromWristY(track, sampleFps, vis);
  const backswingS = raw.backswingS * timeScale;
  const downswingS = raw.downswingS * timeScale;
  if (backswingS < 0.4 || backswingS > 1.8 || downswingS < 0.12 || downswingS > 0.7) {
    throw new TempoError(vis.notASwing);
  }
  const at = (i: number) => (first + i) * step;
  return {
    backswingS,
    downswingS,
    ratio: raw.ratio,
    fps: slowed ? captureFps : fps,
    playbackFps: fps,
    frames: { takeaway: at(raw.frames.takeaway), top: at(raw.frames.top), impact: at(raw.frames.impact) },
  };
}

export const BALL_DIAMETER_MM = 42.67;

/**
 * Clubhead speed from two marked clubhead positions shortly before impact, scaled by the ball's
 * width in the same face-on view. `frames` is how many captured frames separate the two marks.
 */
export function clubheadSpeedMph(
  ballLeft: { x: number; y: number }, ballRight: { x: number; y: number },
  headA: { x: number; y: number }, headB: { x: number; y: number }, frames: number, captureFps: number,
): number {
  const mmPerPx = BALL_DIAMETER_MM / Math.hypot(ballRight.x - ballLeft.x, ballRight.y - ballLeft.y);
  const metres = (Math.hypot(headB.x - headA.x, headB.y - headA.y) * mmPerPx) / 1000;
  return (metres / (frames / captureFps)) * 2.236936;
}
