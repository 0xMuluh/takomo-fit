import type { Evidence, FitResponse } from "../api";
import type { CaptureKey } from "../session";

export function evidenceKeys(ev: Evidence): CaptureKey[] {
  const out: CaptureKey[] = [];
  if (ev.body_photo) out.push("body");
  if (ev.hand_photo) out.push("hand");
  if (ev.swing_video) out.push("swing");
  if (ev.ball_line_tilts_deg?.length) out.push("ballLine");
  if (ev.launch_monitor) out.push("radar");
  return out;
}

/** Which captures a fit already includes, read from the sources behind each estimate. */
export function capturedIn(fit: FitResponse): Set<CaptureKey> {
  const src = (k: string) => fit.estimates[k]?.sources ?? "";
  const done = new Set<CaptureKey>();
  if (/body photo/.test(src("wtf") + src("height"))) done.add("body");
  if (/hand photo/.test(src("hand"))) done.add("hand");
  if (/slow-motion video/.test(src("speed"))) done.add("swing");
  if (/ball-line/.test(src("lie"))) done.add("ballLine");
  if (/home radar|TrackMan/.test(src("speed"))) done.add("radar");
  return done;
}

export function evidenceKeysOf(ev: Evidence, fit?: FitResponse): Set<CaptureKey> {
  return new Set([...evidenceKeys(ev), ...(fit ? capturedIn(fit) : [])]);
}
