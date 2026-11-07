"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { fileToCanvas } from "@/lib/image";
import { tiltDeg } from "@/lib/vision/ballLine";
import type { Point } from "@/lib/vision/body";
import { Button, ErrorNote } from "../ui";
import { MediaPicker } from "./MediaPicker";
import { Stage, strokeFor } from "./Stage";

const MIN_SHOTS = 3;

export function BallLineCapture({ onDone }: { onDone: (tilts: number[]) => void }) {
  const l = useI18n();
  const [tilts, setTilts] = useState<number[]>([]);
  const [photo, setPhoto] = useState<{ url: string; w: number; h: number }>();
  const [pts, setPts] = useState<Point[]>([]);
  const [err, setErr] = useState<string>();

  const pick = async (f: File) => {
    const c = await fileToCanvas(f, 1600);
    setPhoto({ url: c.toDataURL("image/jpeg", 0.85), w: c.width, h: c.height });
    setPts([]);
    setErr(undefined);
  };

  const tap = (p: Point) => {
    const next = [...pts, p];
    if (next.length < 4) return setPts(next);
    const t = tiltDeg(next[0], next[1], next[2], next[3]);
    if (Math.abs(t) > 20) {
      setErr(l.t.ballLine.offLine);
      setPts([]);
      return;
    }
    setTilts([...tilts, t]);
    setPhoto(undefined);
    setPts([]);
  };

  const mean = tilts.length ? tilts.reduce((a, b) => a + b, 0) / tilts.length : 0;

  return (
    <div className="space-y-4">
      {!photo && (
        <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink/80">
          {l.t.ballLine.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      )}

      {tilts.length > 0 && (
        <div className="rounded-xl bg-white p-4">
          <div className="text-[13px] text-muted">{l.t.ballLine.shots(tilts.length)}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-[15px] tabular-nums">
            {tilts.map((t, i) => (
              <span key={i} className="rounded-full bg-paper px-3 py-1">{l.f.deg(t, 1, true)}</span>
            ))}
          </div>
          {tilts.length >= MIN_SHOTS && (
            <div className="mt-2 text-[13px] text-muted">
              {l.t.ballLine.average(l.f.deg(mean, 1, true))}
            </div>
          )}
        </div>
      )}

      {photo ? (
        <>
          <p className="text-[15px] font-medium">{l.t.ballLine.prompts[pts.length]}</p>
          <Stage src={photo.url} width={photo.w} height={photo.h} onTap={tap}>
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={strokeFor(photo.w) * 3} fill={i < 2 ? "#f2b33d" : "#ffffff"} />
            ))}
            {pts.length >= 2 && (
              <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke="#f2b33d" strokeWidth={strokeFor(photo.w)} />
            )}
          </Stage>
          {err && <ErrorNote>{err}</ErrorNote>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPts(pts.slice(0, -1))} disabled={!pts.length}>{l.t.common.undo}</Button>
            <Button variant="ghost" onClick={() => setPhoto(undefined)}>{l.t.common.cancel}</Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <MediaPicker kind="photo" onPick={pick} label={tilts.length ? l.t.ballLine.photoNext : l.t.ballLine.photoFirst} />
          {tilts.length >= MIN_SHOTS && (
            <Button className="w-full" onClick={() => onDone(tilts)}>{l.t.ballLine.use(tilts.length)}</Button>
          )}
          {tilts.length > 0 && (
            <Button variant="ghost" onClick={() => setTilts(tilts.slice(0, -1))}>{l.t.ballLine.removeLast}</Button>
          )}
        </div>
      )}
    </div>
  );
}
