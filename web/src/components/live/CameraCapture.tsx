"use client";

import type { ReactNode } from "react";
import type { Evidence } from "@/lib/api";
import { BallLineCapture } from "../capture/BallLineCapture";
import { HandCapture } from "../capture/HandCapture";
import { LiveBody } from "./LiveBody";
import { LiveSwing } from "./LiveSwing";

export type CameraKind = "body" | "swing" | "hand" | "ball_line";

export function CameraCapture({ kind, heightCm, onCoach, onEvidence }: {
  kind: CameraKind; heightCm: number; onCoach?: (cue: string, immediate?: boolean) => void; onEvidence: (ev: Evidence) => void;
}) {
  const light = (c: ReactNode) => <div className="rounded-2xl bg-paper p-4 text-ink">{c}</div>;
  switch (kind) {
    case "body":
      return <LiveBody heightCm={heightCm} onCoach={onCoach} onDone={(b) => onEvidence({ body_photo: b })} />;
    case "swing":
      return <LiveSwing onCoach={onCoach} onDone={(s) => onEvidence({ swing_video: s })} />;
    case "hand":
      return light(<HandCapture onDone={(h) => onEvidence({ hand_photo: h })} />);
    case "ball_line":
      return light(<BallLineCapture onDone={(t) => onEvidence({ ball_line_tilts_deg: t })} />);
  }
}
