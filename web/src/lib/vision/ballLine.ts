import type { Point } from "./body";

/**
 * Tilt of the line a marked ball leaves on the face, + when its top leans toward the toe
 * (club toe-up at impact, too upright). Same geometry as the lab's camera/ball_line.py.
 */
export function tiltDeg(lineBottom: Point, lineTop: Point, heel: Point, toe: Point): number {
  const ex = toe.x - heel.x;
  const ey = toe.y - heel.y;
  const len = Math.hypot(ex, ey);
  const ux = ex / len;
  const uy = ey / len;
  let nx = uy;
  let ny = -ux;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const lx = lineTop.x - lineBottom.x;
  const ly = lineTop.y - lineBottom.y;
  let alongToe = lx * ux + ly * uy;
  let alongUp = lx * nx + ly * ny;
  if (alongUp < 0) {
    alongToe = -alongToe;
    alongUp = -alongUp;
  }
  return Math.round(((Math.atan2(alongToe, alongUp) * 180) / Math.PI) * 10) / 10;
}
