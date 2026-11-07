import en, { type Messages } from "@/i18n/messages/en";
import { photoPose } from "./mediapipe";

export type Point = { x: number; y: number };

export type BodyMeasurement = {
  ratio: number;
  quality: "good" | "poor";
  issues: string[];
  points: { top: Point; wrist: Point; floor: Point };
};

export class MeasurementError extends Error {}

const L = {
  nose: 0, leftEar: 7, rightEar: 8, leftShoulder: 11, rightShoulder: 12, leftWrist: 15, rightWrist: 16,
  leftHip: 23, rightHip: 24, leftAnkle: 27, rightAnkle: 28, leftHeel: 29, rightHeel: 30, leftToe: 31, rightToe: 32,
};
const REQUIRED = [L.nose, L.leftShoulder, L.rightShoulder, L.leftWrist, L.rightWrist, L.leftHip, L.rightHip,
  L.leftAnkle, L.rightAnkle, L.leftHeel, L.rightHeel];

const deg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/**
 * Wrist-to-floor as a share of height from one full-body photo, no reference object.
 * Golfer stands upright in golf shoes, arms hanging, phone at waist height 3-4 m away.
 */
export async function measureBody(
  img: HTMLImageElement | HTMLCanvasElement,
  v: Messages["vision"] = en.vision,
): Promise<BodyMeasurement> {
  const pose = await photoPose();
  const W = img.width;
  const H = img.height;
  const res = pose.detect(img);
  const lm = res.landmarks[0];
  if (!lm) throw new MeasurementError(v.noPerson);
  const missing = REQUIRED.filter((i) => (lm[i].visibility ?? 1) < 0.5);
  if (missing.length) {
    throw new MeasurementError(v.hidden);
  }
  const px = (i: number): Point => ({ x: lm[i].x * W, y: lm[i].y * H });
  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const mask = res.segmentationMasks?.[0];
  let topY = Number.NaN;
  let maskFloor = Number.NaN;
  if (mask) {
    const m = mask.getAsFloat32Array();
    const mw = mask.width;
    const mh = mask.height;
    const sx = mw / W;
    const sy = mh / H;
    const earL = px(L.leftEar);
    const earR = px(L.rightEar);
    const cx = (earL.x + earR.x) / 2;
    const half = Math.max(4, Math.abs(earL.x - earR.x) * 0.25);
    const x0 = Math.max(0, Math.round((cx - half) * sx));
    const x1 = Math.min(mw - 1, Math.round((cx + half) * sx));
    const noseY = Math.round(px(L.nose).y * sy);
    for (let y = 0; y < noseY; y++) {
      let on = 0;
      for (let x = x0; x <= x1; x++) if (m[y * mw + x] > 0.5) on++;
      if (on >= 0.5 * (x1 - x0 + 1)) {
        topY = y / sy;
        break;
      }
    }
    const feet = [px(L.leftHeel), px(L.rightHeel), px(L.leftToe), px(L.rightToe)];
    const fx0 = Math.max(0, Math.round((Math.min(...feet.map((p) => p.x)) - 10) * sx));
    const fx1 = Math.min(mw - 1, Math.round((Math.max(...feet.map((p) => p.x)) + 10) * sx));
    for (let y = mh - 1; y > 0; y--) {
      let on = 0;
      for (let x = fx0; x <= fx1; x++) if (m[y * mw + x] > 0.5) on++;
      if (on >= 3) {
        maskFloor = y / sy;
        break;
      }
    }
    mask.close();
  }
  if (!Number.isFinite(topY)) {
    const earSpan = Math.abs(px(L.leftEar).x - px(L.rightEar).x);
    topY = Math.max(0, px(L.nose).y - Math.max(earSpan * 1.15, 0.06 * H));
  }

  const lowestLandmark = Math.max(...[L.leftHeel, L.rightHeel, L.leftToe, L.rightToe].map((i) => px(i).y));
  const floorY = Number.isFinite(maskFloor) ? Math.max(maskFloor, lowestLandmark) : lowestLandmark;
  const wrist = mid(px(L.leftWrist), px(L.rightWrist));
  const hips = mid(px(L.leftHip), px(L.rightHip));
  const ankles = mid(px(L.leftAnkle), px(L.rightAnkle));
  const shoulders = [px(L.leftShoulder), px(L.rightShoulder)];
  const bodyPx = floorY - topY;
  const ratio = (floorY - wrist.y) / bodyPx;

  const issues: string[] = [];
  if (Math.min(px(L.leftWrist).y, px(L.rightWrist).y) < hips.y) issues.push(v.armsDown);
  const lean = Math.abs(90 - Math.abs(deg(ankles.x - hips.x, ankles.y - hips.y)));
  if (lean > 7) issues.push(v.standStraight);
  const roll = Math.abs(deg(shoulders[1].x - shoulders[0].x, shoulders[1].y - shoulders[0].y));
  if (Math.min(roll, 180 - roll) > 8) issues.push(v.phoneLevel);
  if (bodyPx < 0.44 * H) issues.push(v.stepCloser);
  if (topY < 0.005 * H || floorY > 0.998 * H) issues.push(v.margins);
  if (ratio < 0.42 || ratio > 0.56) {
    throw new MeasurementError(v.bodyImplausible);
  }
  return {
    ratio: Math.round(ratio * 10000) / 10000,
    quality: issues.length ? "poor" : "good",
    issues,
    points: { top: { x: px(L.nose).x, y: topY }, wrist, floor: { x: ankles.x, y: floorY } },
  };
}
