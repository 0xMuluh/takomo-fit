"use client";

import type { L } from "@/i18n";
import type { Evidence } from "@/lib/api";
import type { CaptureKey, Extras } from "@/lib/session";
import { BallLineCapture } from "./BallLineCapture";
import { BodyCapture } from "./BodyCapture";
import { HandCapture } from "./HandCapture";
import { LaunchMonitorImport } from "./LaunchMonitorImport";
import { SwingCapture } from "./SwingCapture";

export type { CaptureKey };

export const CAPTURES: { key: CaptureKey; minutes: number; test?: string }[] = [
  { key: "body", minutes: 1 },
  { key: "hand", minutes: 1, test: "hand photo with a bank card" },
  { key: "swing", minutes: 3, test: "slow-motion swing video" },
  { key: "ballLine", minutes: 10, test: "ball-line test" },
  { key: "radar", minutes: 10, test: "launch monitor upload" },
];

/** Why this measurement matters for this golfer, the way a fitter would introduce it. */
export function captureIntro(k: CaptureKey, x: Extras, l: L): string {
  const misses = new Set(x.misses);
  const intro = l.t.captures.intro;
  switch (k) {
    case "body":
      return intro.body(misses.has("toe") || misses.has("heel"));
    case "hand":
      return intro.hand(!!x.gloveUnsure);
    case "swing":
      return intro.swing(!!x.carryUnsure, !!x.tempoUnsure);
    case "ballLine":
      return intro.ballLine(
        misses.has("left") && misses.has("right") ? "both"
          : misses.has("left") ? "left"
          : misses.has("right") ? "right" : undefined,
      );
    case "radar":
      return intro.radar;
  }
}

export const captureForTest = (test: string) => CAPTURES.find((c) => c.test === test);

export { measuredNote } from "@/lib/fitter/notes";

export function Capture({ k, heightCm, onEvidence }: {
  k: CaptureKey;
  heightCm: number;
  onEvidence: (ev: Evidence) => void;
}) {
  switch (k) {
    case "body":
      return <BodyCapture heightCm={heightCm} onDone={(b) => onEvidence({ body_photo: b })} />;
    case "hand":
      return <HandCapture onDone={(h) => onEvidence({ hand_photo: h })} />;
    case "swing":
      return <SwingCapture onDone={(s) => onEvidence({ swing_video: s })} />;
    case "ballLine":
      return <BallLineCapture onDone={(t) => onEvidence({ ball_line_tilts_deg: t })} />;
    case "radar":
      return <LaunchMonitorImport onDone={(lm) => onEvidence({ launch_monitor: lm })} />;
  }
}

export { capturedIn, evidenceKeys } from "@/lib/fitter/evidence";
