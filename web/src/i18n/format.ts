import type { Locale } from "./config";

/** Same factors and rounding as the engine (pocketfit/i18n.py), so a number reads the same on screen and in prose. */
export const YD_TO_M = 0.9144;
export const MPH_TO_KMH = 1.609344;
const CM_PER_IN = 2.54;
const FT_PER_M = 3.28084;

export type Fmt = ReturnType<typeof formatter>;

export function formatter({ lang, units }: Locale) {
  const metric = units === "metric";
  const dec = (s: string) => (lang === "en" ? s : s.replace(".", ","));
  const num = (v: number, d = 0) => dec(v.toFixed(d));
  const signed = (v: number, d = 1) => dec(`${v >= 0 ? "+" : ""}${v.toFixed(d)}`);
  const distValue = (yd: number) => (metric ? yd * YD_TO_M : yd);
  const speedValue = (mph: number) => (metric ? mph * MPH_TO_KMH : mph);
  const distUnit = metric ? "m" : "yd";
  const speedUnit = metric ? "km/h" : "mph";
  return {
    metric,
    num,
    signed,
    pct: (p: number) => `${Math.round(p * 100)}${lang === "en" ? "" : "\u00a0"}%`,
    deg: (v: number, d = 1, sign = false) => `${sign ? signed(v, d) : num(v, d)}°`,
    cm: (v: number, d = 1) => `${num(v, d)} cm`,
    sec: (v: number, d = 2) => `${num(v, d)} s`,
    grams: (v: number) => `${num(v)} g`,
    mm: (v: number) => `${num(v)} mm`,
    ratio: (v: number) => `${num(v, 1)}:1`,
    distUnit,
    speedUnit,
    distValue,
    speedValue,
    dist: (yd: number, d = 0) => `${num(distValue(yd), d)} ${distUnit}`,
    speed: (mph: number, d = 0) => `${num(speedValue(mph), d)} ${speedUnit}`,
    /** A value typed in the golfer's units, back to the engine's. */
    toYd: (v: number) => (metric ? v / YD_TO_M : v),
    toMph: (v: number) => (metric ? v / MPH_TO_KMH : v),
    /** Room sizes in setup instructions: "3–4 m" or "10–13 ft". */
    room: (m: number, to?: number) => {
      const r = (x: number) => (metric ? num(x) : num(Math.round(x * FT_PER_M)));
      return `${r(m)}${to ? `–${r(to)}` : ""} ${metric ? "m" : "ft"}`;
    },
    height: (cm: number) => {
      if (metric) return `${num(cm, 0)} cm`;
      const inches = Math.round(cm / CM_PER_IN);
      return `${Math.floor(inches / 12)}′${inches % 12}″`;
    },
  };
}
