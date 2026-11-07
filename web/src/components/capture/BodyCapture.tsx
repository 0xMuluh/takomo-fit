"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import type { BodyPhoto } from "@/lib/api";
import { fileToCanvas } from "@/lib/image";
import { measureBody, MeasurementError, type BodyMeasurement } from "@/lib/vision/body";
import { Button, ErrorNote, Spinner } from "../ui";
import { MediaPicker } from "./MediaPicker";
import { Stage, strokeFor } from "./Stage";

type Shot = { url: string; w: number; h: number; m: BodyMeasurement };

export function BodyCapture({ heightCm, onDone }: { heightCm: number; onDone: (b: BodyPhoto) => void }) {
  const l = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [shot, setShot] = useState<Shot>();

  const pick = async (f: File) => {
    setBusy(true);
    setErr(undefined);
    setShot(undefined);
    try {
      const c = await fileToCanvas(f, 2048);
      const m = await measureBody(c, l.t.vision);
      setShot({ url: c.toDataURL("image/jpeg", 0.85), w: c.width, h: c.height, m });
    } catch (e) {
      setErr(e instanceof MeasurementError ? e.message : l.t.photoFailed);
    } finally {
      setBusy(false);
    }
  };

  if (busy) return <Spinner label={l.t.body.onDevice} />;

  if (shot) {
    const { m, w, h } = shot;
    const sw = strokeFor(w);
    const line = (y: number, color: string) => (
      <line x1={0} x2={w} y1={y} y2={y} stroke={color} strokeWidth={sw} strokeDasharray={`${sw * 4} ${sw * 3}`} />
    );
    const wtf = m.ratio * heightCm;
    return (
      <div className="space-y-4">
        <Stage src={shot.url} width={w} height={h}>
          {line(m.points.top.y, "#ffffff")}
          {line(m.points.wrist.y, "#f2b33d")}
          {line(m.points.floor.y, "#ffffff")}
          <line x1={m.points.wrist.x} x2={m.points.wrist.x} y1={m.points.wrist.y} y2={m.points.floor.y}
                stroke="#f2b33d" strokeWidth={sw * 1.5} />
        </Stage>
        <div className="rounded-xl bg-white p-4">
          <div className="text-[13px] text-muted">{l.t.body.wtf}</div>
          <div className="text-2xl font-semibold tabular-nums">{l.f.cm(wtf, 1)}</div>
          <div className="text-[13px] text-muted">
            {l.t.body.ofHeight(`${l.f.num(m.ratio * 100, 1)}%`, l.f.cm(heightCm, 0))}
          </div>
        </div>
        {m.issues.length > 0 && (
          <ErrorNote>
            {l.t.body.retakeAdvice(m.issues.join(" "))}
          </ErrorNote>
        )}
        <div className="flex gap-2">
          <Button className="flex-1"
                  onClick={() => onDone({ method: "ratio", wrist_to_floor_ratio: m.ratio, quality: m.quality })}>
            {l.t.common.useThis}
          </Button>
          <Button variant="secondary" onClick={() => setShot(undefined)}>{l.t.common.retake}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink/80">
        {l.t.body.steps(l.f.room(3, 4)).map((s) => <li key={s}>{s}</li>)}
      </ol>
      {err && <ErrorNote>{err}</ErrorNote>}
      <MediaPicker kind="photo" onPick={pick} />
    </div>
  );
}
