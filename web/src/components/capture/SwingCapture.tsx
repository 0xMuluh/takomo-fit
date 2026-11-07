"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import type { SwingVideo } from "@/lib/api";
import type { Point } from "@/lib/vision/body";
import { clubheadSpeedMph, tempoFromVideo, TempoError, type Tempo } from "@/lib/vision/tempo";
import { Button, Choice, ErrorNote, Spinner } from "../ui";
import { MediaPicker } from "./MediaPicker";
import { Stage, strokeFor } from "./Stage";

type Mode = "normal" | "120" | "240";

function seek(v: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    if (Math.abs(v.currentTime - t) < 1e-4) return resolve();
    v.addEventListener("seeked", () => resolve(), { once: true });
    v.currentTime = Math.max(0, Math.min(v.duration, t));
  });
}

export function SwingCapture({ onDone }: { onDone: (s: SwingVideo) => void }) {
  const l = useI18n();
  const [mode, setMode] = useState<Mode>("normal");
  const [src, setSrc] = useState<string>();
  const [progress, setProgress] = useState<number>();
  const [tempo, setTempo] = useState<Tempo>();
  const [err, setErr] = useState<string>();
  const [measuringSpeed, setMeasuringSpeed] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number }>();
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const pick = (f: File) => {
    setTempo(undefined);
    setErr(undefined);
    setMeasuringSpeed(false);
    setSrc(URL.createObjectURL(f));
  };

  const analyse = async () => {
    const v = video.current;
    if (!v) return;
    setDims({ w: v.videoWidth, h: v.videoHeight });
    setProgress(0);
    try {
      const captureFps = mode === "normal" ? undefined : Number(mode);
      setTempo(await tempoFromVideo(v, captureFps, setProgress, l.t.vision));
    } catch (e) {
      setErr(e instanceof TempoError ? e.message : l.t.swing.readFailed);
    } finally {
      setProgress(undefined);
    }
  };

  const finish = (speed?: number) =>
    tempo && onDone({ fps: tempo.fps, backswing_s: round(tempo.backswingS), downswing_s: round(tempo.downswingS),
                      clubhead_speed_mph: speed });

  return (
    <div className="space-y-4">
      {!src && (
        <>
          <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink/80">
            {l.t.swing.steps(l.f.room(3)).map((s) => <li key={s}>{s}</li>)}
          </ol>
          <div>
            <div className="mb-2 text-[13px] font-medium text-muted">{l.t.swing.howFilm}</div>
            <Choice<Mode> columns={3} value={mode} onChange={setMode} options={[
              { value: "normal", label: l.t.swing.normal },
              { value: "120", label: l.t.swing.slow120 },
              { value: "240", label: l.t.swing.slow240 },
            ]} />
          </div>
          <MediaPicker kind="video" onPick={pick} />
        </>
      )}

      {src && !measuringSpeed && (
        <video ref={video} src={src} playsInline muted preload="auto"
               onLoadedMetadata={() => { if (!tempo && !err) void analyse(); }}
               className="mx-auto max-h-[50vh] w-full rounded-2xl bg-black object-contain" />
      )}

      {progress !== undefined && (
        <div className="space-y-2">
          <Spinner label={l.t.swing.tracking} />
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-ink transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      )}
      {err && (
        <>
          <ErrorNote>{err}</ErrorNote>
          <Button variant="secondary" onClick={() => { setSrc(undefined); setErr(undefined); }}>{l.t.swing.tryAnother}</Button>
        </>
      )}

      {tempo && !measuringSpeed && (
        <>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-4 text-center">
            <Stat label={l.t.swing.backswing} value={l.f.sec(tempo.backswingS)} />
            <Stat label={l.t.swing.downswing} value={l.f.sec(tempo.downswingS)} />
            <Stat label={l.t.swing.ratio} value={l.f.ratio(tempo.ratio)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {tempo.fps >= 200 && (
              <Button className="flex-1" onClick={() => setMeasuringSpeed(true)}>{l.t.swing.alsoSpeed}</Button>
            )}
            <Button variant={tempo.fps >= 200 ? "secondary" : "primary"} className="flex-1" onClick={() => finish()}>
              {l.t.swing.useTempo}
            </Button>
            <Button variant="ghost" onClick={() => { setSrc(undefined); setTempo(undefined); }}>{l.t.swing.newVideo}</Button>
          </div>
        </>
      )}

      {tempo && measuringSpeed && src && dims && (
        <SpeedMarker src={src} dims={dims} tempo={tempo} onCancel={() => setMeasuringSpeed(false)}
                     onDone={(mph) => finish(mph)} />
      )}
    </div>
  );
}

const round = (x: number) => Math.round(x * 1000) / 1000;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-muted">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

type Mark = { p: Point; t: number };

function SpeedMarker({ src, dims, tempo, onDone, onCancel }: {
  src: string;
  dims: { w: number; h: number };
  tempo: Tempo;
  onDone: (mph: number) => void;
  onCancel: () => void;
}) {
  const l = useI18n();
  const v = useRef<HTMLVideoElement>(null);
  const [ball, setBall] = useState<Point[]>([]);
  const [heads, setHeads] = useState<Mark[]>([]);
  const [err, setErr] = useState<string>();
  const frame = 1 / (tempo.playbackFps ?? tempo.fps);

  const step = ball.length < 2 ? "ball" : heads.length < 2 ? "head" : "done";

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const go = () => void seek(el, step === "ball" ? Math.max(0, tempo.frames.takeaway - 4 * frame)
                                                   : tempo.frames.impact - 3 * frame);
    if (el.readyState >= 1) go();
    else el.addEventListener("loadedmetadata", go, { once: true });
  }, [step === "ball", tempo, frame]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (p: Point) => {
    const el = v.current;
    if (!el) return;
    if (step === "ball") setBall([...ball, p]);
    else if (step === "head") {
      const next = [...heads, { p, t: el.currentTime }];
      setHeads(next);
      if (next.length === 1) void seek(el, el.currentTime + frame);
      else {
        const frames = Math.round((next[1].t - next[0].t) / frame);
        if (frames < 1) {
          setErr(l.t.swing.twoFrames);
          setHeads([]);
          return;
        }
        const mph = clubheadSpeedMph(ball[0], ball[1], next[0].p, next[1].p, frames, tempo.fps);
        if (mph < 35 || mph > 135) {
          setErr(l.t.swing.implausible(l.f.speed(mph)));
          setHeads([]);
        } else onDone(Math.round(mph * 10) / 10);
      }
    }
  };

  const nudge = (k: number) => v.current && void seek(v.current, v.current.currentTime + k * frame);
  const sw = strokeFor(dims.w);
  return (
    <div className="space-y-3">
      <p className="text-[15px] text-ink/80">
        {step === "ball"
          ? l.t.swing.tapBall(ball.length)
          : heads.length === 0
            ? l.t.swing.stepFrame
            : l.t.swing.movedFrame}
      </p>
      <Stage width={dims.w} height={dims.h} onTap={tap}
             media={<video ref={v} src={src} playsInline muted preload="auto"
                           className="absolute inset-0 size-full object-contain" />}>
        {ball.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={sw * 3} fill="#f2b33d" />)}
        {heads.map((m, i) => <circle key={i} cx={m.p.x} cy={m.p.y} r={sw * 4} fill="none" stroke="#fff" strokeWidth={sw} />)}
      </Stage>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => nudge(-1)} aria-label={l.t.swing.prevFrame}>{l.t.swing.frameBack}</Button>
        <Button variant="secondary" onClick={() => nudge(1)} aria-label={l.t.swing.nextFrame}>{l.t.swing.frameFwd}</Button>
        <Button variant="ghost" onClick={() => { setBall([]); setHeads([]); setErr(undefined); }}>{l.t.common.restart}</Button>
        <Button variant="ghost" onClick={onCancel}>{l.t.common.skip}</Button>
      </div>
    </div>
  );
}
