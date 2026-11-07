"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import type { HandPhoto } from "@/lib/api";
import { fileToCanvas } from "@/lib/image";
import { MeasurementError, type Point } from "@/lib/vision/body";
import { measureHand, type HandMeasurement } from "@/lib/vision/hand";
import { Button, ErrorNote, Spinner } from "../ui";
import { MediaPicker } from "./MediaPicker";
import { Stage, strokeFor } from "./Stage";

export function HandCapture({ onDone }: { onDone: (h: HandPhoto) => void }) {
  const l = useI18n();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [url, setUrl] = useState<string>();
  const [corners, setCorners] = useState<Point[]>([]);
  const [result, setResult] = useState<HandMeasurement>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  const reset = () => {
    setCanvas(undefined);
    setUrl(undefined);
    setCorners([]);
    setResult(undefined);
    setErr(undefined);
  };

  const pick = async (f: File) => {
    reset();
    const c = await fileToCanvas(f, 2400);
    setCanvas(c);
    setUrl(c.toDataURL("image/jpeg", 0.85));
  };

  const measure = async (pts: Point[]) => {
    if (!canvas) return;
    setBusy(true);
    setErr(undefined);
    try {
      const [a, b] = pts;
      const box = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
      if (box.w < 20 || box.h < 20) throw new MeasurementError(l.t.vision.tapCorners);
      setResult(await measureHand(canvas, box, l.t.vision));
    } catch (e) {
      setErr(e instanceof MeasurementError ? e.message : l.t.photoFailed);
      setCorners([]);
    } finally {
      setBusy(false);
    }
  };

  const tap = (p: Point) => {
    if (result || busy) return;
    const next = [...corners, p];
    setCorners(next);
    if (next.length === 2) void measure(next);
  };

  if (!canvas || !url) {
    return (
      <div className="space-y-4">
        <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink/80">
          {l.t.hand.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <MediaPicker kind="photo" onPick={pick} />
      </div>
    );
  }

  const sw = strokeFor(canvas.width);
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-ink/80">
        {result ? l.t.hand.measured : l.t.vision.tapCorners}
      </p>
      <Stage src={url} width={canvas.width} height={canvas.height} onTap={tap}>
        {corners.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={sw * 4} fill="none" stroke="#f2b33d" strokeWidth={sw} />
        ))}
        {result && (
          <>
            <rect {...result.card.box} fill="none" stroke="#f2b33d" strokeWidth={sw} />
            <line x1={result.points.wrist.x} y1={result.points.wrist.y} x2={result.points.tip.x} y2={result.points.tip.y}
                  stroke="#ffffff" strokeWidth={sw * 1.5} />
            <circle cx={result.points.wrist.x} cy={result.points.wrist.y} r={sw * 3} fill="#ffffff" />
            <circle cx={result.points.tip.x} cy={result.points.tip.y} r={sw * 3} fill="#ffffff" />
          </>
        )}
      </Stage>
      {busy && <Spinner label={l.t.common.measuring} />}
      {err && <ErrorNote>{err}</ErrorNote>}
      {result && (
        <>
          <div className="rounded-xl bg-white p-4">
            <div className="text-[13px] text-muted">{l.t.hand.length}</div>
            <div className="text-2xl font-semibold tabular-nums">{l.f.cm(result.handLengthCm, 1)}</div>
            <div className="text-[13px] text-muted">{l.t.hand.setsGrip}</div>
          </div>
          {result.issues.length > 0 && <ErrorNote>{l.t.hand.retakeAdvice(result.issues.join(" "))}</ErrorNote>}
        </>
      )}
      <div className="flex gap-2">
        {result && (
          <Button className="flex-1" onClick={() => onDone({ method: "card", hand_length_cm: result.handLengthCm })}>
            {l.t.common.useThis}
          </Button>
        )}
        {result || err ? (
          <Button variant="secondary" onClick={() => { setResult(undefined); setCorners([]); setErr(undefined); }}>
            {l.t.hand.markAgain}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={reset}>{l.t.hand.newPhoto}</Button>
      </div>
    </div>
  );
}
