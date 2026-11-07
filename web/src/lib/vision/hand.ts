import en, { type Messages } from "@/i18n/messages/en";
import { fitCard, type Box, type CardFit } from "./card";
import { MeasurementError, type Point } from "./body";
import { photoHand } from "./mediapipe";

export type HandMeasurement = {
  handLengthCm: number;
  card: CardFit;
  issues: string[];
  points: { wrist: Point; tip: Point };
};

/** Offset from MediaPipe's wrist landmark to the wrist crease, set from tape-measured golfers. */
export const WRIST_CREASE_OFFSET_CM = 0;
const MAX_SKEW = 0.03;

export async function measureHand(
  canvas: HTMLCanvasElement,
  cardGuess: Box,
  v: Messages["vision"] = en.vision,
): Promise<HandMeasurement> {
  const hand = await photoHand();
  const res = hand.detect(canvas);
  const lm = res.landmarks[0];
  if (!lm) throw new MeasurementError(v.noHand);
  const W = canvas.width;
  const H = canvas.height;
  const p = (i: number): Point => ({ x: lm[i].x * W, y: lm[i].y * H });
  const wrist = p(0);
  const tip = p(12);

  const card = fitCard(canvas, cardGuess);
  if (card.skew > MAX_SKEW * 2) {
    throw new MeasurementError(v.cardEdges);
  }
  const issues: string[] = [];
  if (card.skew > MAX_SKEW) issues.push(v.cardSkew);

  const fingers = [8, 12, 16].map((i) => p(i));
  const spread = Math.hypot(fingers[0].x - fingers[2].x, fingers[0].y - fingers[2].y);
  const lenPx = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
  if (spread > 0.3 * lenPx) issues.push(v.fingersTogether);

  const cm = (lenPx * card.mmPerPx) / 10 + WRIST_CREASE_OFFSET_CM;
  if (cm < 13 || cm > 25) throw new MeasurementError(v.handImplausible);
  return { handLengthCm: Math.round(cm * 100) / 100, card, issues, points: { wrist, tip } };
}
