"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useI18n } from "@/i18n/context";
import { videoPose, videoTimestamp } from "@/lib/vision/mediapipe";
import { cx } from "../ui";

export type Facing = "user" | "environment";
export type Camera = {
  video: RefObject<HTMLVideoElement | null>;
  ready: boolean;
  error?: string;
  facing: Facing;
  flip: () => void;
};

export function useCamera(initial: Facing = "user"): Camera {
  const l = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    setReady(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = video.current;
        if (!v) return;
        v.srcObject = s;
        await v.play();
        setError(undefined);
        setReady(true);
      })
      .catch((e: unknown) => setError(e instanceof DOMException && e.name === "NotAllowedError"
        ? l.t.camera.blocked
        : l.t.camera.unavailable));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, l.t.camera.blocked, l.t.camera.unavailable]);

  return { video, ready, error, facing, flip: () => setFacing((f) => (f === "user" ? "environment" : "user")) };
}

export type PoseFrame = {
  lm?: NormalizedLandmark[];
  /** Capture time of this camera frame, ms. */
  t: number;
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
};

type FrameMeta = { mediaTime: number; captureTime?: number };
type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: FrameMeta) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/** Runs pose tracking once per new camera frame and hands each result to `onFrame`. */
export function usePoseLoop(cam: Camera, onFrame: (f: PoseFrame) => void, active = true) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    if (!cam.ready || !active) return;
    const v = cam.video.current as FrameVideo | null;
    if (!v) return;
    let stop = false;
    let pose: PoseLandmarker | undefined;
    let last = -1;
    let handle = 0;
    void videoPose().then((p) => (pose = p));

    const process = (t: number) => {
      const c = canvas.current;
      if (!c || !pose || v.readyState < 2 || t <= last) return;
      if (c.width !== v.videoWidth) c.width = v.videoWidth;
      if (c.height !== v.videoHeight) c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      const r = pose.detectForVideo(v, videoTimestamp(last < 0 ? 33 : t - last));
      last = t;
      cb.current({ lm: r.landmarks[0], t, ctx, W: c.width, H: c.height });
    };

    if (v.requestVideoFrameCallback) {
      const tick = (now: number, meta: FrameMeta) => {
        if (stop) return;
        process(meta.captureTime ?? now);
        handle = v.requestVideoFrameCallback!(tick);
      };
      handle = v.requestVideoFrameCallback(tick);
      return () => {
        stop = true;
        v.cancelVideoFrameCallback?.(handle);
      };
    }
    const tick = () => {
      if (stop) return;
      process(performance.now());
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => {
      stop = true;
      cancelAnimationFrame(handle);
    };
  }, [cam.ready, cam.video, active]);

  return canvas;
}

export function CameraView({ cam, canvas, highlight, children }: {
  cam: Camera;
  canvas: RefObject<HTMLCanvasElement | null>;
  highlight?: boolean;
  children?: ReactNode;
}) {
  const l = useI18n();
  const mirror = cam.facing === "user" ? "-scale-x-100" : "";
  return (
    <div className={cx(
      "relative mx-auto aspect-[3/4] max-h-[64dvh] w-full overflow-hidden rounded-2xl bg-black transition-shadow duration-300 sm:aspect-video",
      highlight ? "ring-4 ring-[#9fd3b0] shadow-[0_0_28px_rgba(159,211,176,0.35)]" : "ring-1 ring-white/15",
    )}>
      <video ref={cam.video} playsInline muted autoPlay className={cx("absolute inset-0 size-full object-cover", mirror)} />
      <canvas ref={canvas} className={cx("pointer-events-none absolute inset-0 size-full object-cover", mirror)} />
      {!cam.ready && !cam.error && (
        <div className="absolute inset-0 grid place-items-center text-[15px] text-white/70">{l.t.camera.opening}</div>
      )}
      {cam.error && <div className="absolute inset-0 grid place-items-center p-6 text-center text-[15px] text-white">{cam.error}</div>}
      <button type="button" onClick={cam.flip} aria-label={l.t.camera.flipLabel}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur hover:bg-black/75">
        {l.t.camera.flip}
      </button>
      {children}
    </div>
  );
}

const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 29], [28, 30]];

export function drawSkeleton(ctx: CanvasRenderingContext2D, lm: NormalizedLandmark[], W: number, H: number, color: string) {
  ctx.lineWidth = Math.max(3, W / 240);
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  for (const [a, b] of BONES) {
    if ((lm[a].visibility ?? 1) < 0.4 || (lm[b].visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(lm[a].x * W, lm[a].y * H);
    ctx.lineTo(lm[b].x * W, lm[b].y * H);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffffff";
  for (const i of [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
    if ((lm[i].visibility ?? 1) < 0.4) continue;
    ctx.beginPath();
    ctx.arc(lm[i].x * W, lm[i].y * H, Math.max(4, W / 200), 0, Math.PI * 2);
    ctx.fill();
  }
}

export function Hint({ text, progress, tone = "neutral" }: { text: string; progress?: number; tone?: "neutral" | "good" }) {
  return (
    <div className={cx(
      "absolute inset-x-3 bottom-3 rounded-2xl px-4 py-3.5 text-white backdrop-blur-md transition-colors",
      tone === "good" ? "bg-[#132a1c]/90 ring-2 ring-[#9fd3b0]/70" : "bg-black/75 ring-1 ring-white/15",
    )} aria-live="polite">
      <div className="flex items-center gap-2.5">
        <span className={cx("size-3 shrink-0 rounded-full", tone === "good" ? "bg-[#9fd3b0]" : "bg-white/60")} />
        <div className={cx("text-[17px] font-semibold leading-snug sm:text-[19px]", tone === "good" && "text-[#9fd3b0]")}>
          {text}
        </div>
      </div>
      {progress !== undefined && progress > 0 && (
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-[#9fd3b0] transition-[width] duration-100" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
