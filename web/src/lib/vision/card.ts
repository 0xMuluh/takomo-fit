// ISO/IEC 7810 ID-1: every bank, ID and loyalty card.
export const CARD_W_MM = 85.6;
export const CARD_H_MM = 53.98;

export type Box = { x: number; y: number; w: number; h: number };

export type CardFit = {
  box: Box;
  mmPerPx: number;
  /** Disagreement between the scale from the card's width and from its height; large when the phone is tilted. */
  skew: number;
};

function grayscale(ctx: CanvasRenderingContext2D, W: number, H: number): Float32Array {
  const d = ctx.getImageData(0, 0, W, H).data;
  const g = new Float32Array(W * H);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
  return g;
}

/** Strongest straight edge near `guess`, searched along one axis and averaged over the middle of the other. */
function edge(g: Float32Array, W: number, H: number, vertical: boolean, guess: number, span: [number, number],
              reach: number): number {
  const lo = Math.max(1, Math.round(guess - reach));
  const hi = Math.min((vertical ? W : H) - 2, Math.round(guess + reach));
  const a = Math.max(0, Math.round(span[0]));
  const b = Math.min((vertical ? H : W) - 1, Math.round(span[1]));
  let best = guess;
  let bestScore = -1;
  for (let p = lo; p <= hi; p++) {
    let s = 0;
    for (let q = a; q <= b; q++) {
      s += vertical ? Math.abs(g[q * W + p + 1] - g[q * W + p - 1]) : Math.abs(g[(p + 1) * W + q] - g[(p - 1) * W + q]);
    }
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return best;
}

/** Snap a rough card rectangle (from the on-screen guide or the golfer's drag) to the card's real edges. */
export function fitCard(canvas: HTMLCanvasElement, guess: Box): CardFit {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas unavailable");
  const g = grayscale(ctx, W, H);
  const rx = guess.w * 0.12;
  const ry = guess.h * 0.12;
  const ys: [number, number] = [guess.y + guess.h * 0.2, guess.y + guess.h * 0.8];
  const xs: [number, number] = [guess.x + guess.w * 0.2, guess.x + guess.w * 0.8];
  const left = edge(g, W, H, true, guess.x, ys, rx);
  const right = edge(g, W, H, true, guess.x + guess.w, ys, rx);
  const top = edge(g, W, H, false, guess.y, xs, ry);
  const bottom = edge(g, W, H, false, guess.y + guess.h, xs, ry);
  const w = right - left;
  const h = bottom - top;
  const landscape = w >= h;
  const sw = (landscape ? CARD_W_MM : CARD_H_MM) / w;
  const sh = (landscape ? CARD_H_MM : CARD_W_MM) / h;
  return { box: { x: left, y: top, w, h }, mmPerPx: (sw + sh) / 2, skew: Math.abs(sw - sh) / ((sw + sh) / 2) };
}
