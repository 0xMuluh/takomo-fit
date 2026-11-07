import type { L } from "@/i18n";
import type { Component, FitResponse } from "./api";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function headName(slug: string): string {
  return "Iron " + slug.split("-").map((p) => (p === "mkii" ? "MKII" : p.toUpperCase())).join(" ");
}

function shaftName(slug: string): string {
  return slug.split("-").map((w) => (w.length <= 3 ? w.toUpperCase() : cap(w))).join(" ");
}

export const flexName = (flex: string, l: L) => l.t.spec.flex[flex] ?? cap(flex);

/** Human value for a part, used for both the pick and its alternative. Club specs stay in inches and degrees. */
export function partValue(part: Component["part"], value: string, fit: FitResponse | undefined, l: L): string {
  const { spec } = l.t;
  switch (part) {
    case "head":
      return fit && value === fit.spec.head ? fit.spec.head_name : headName(value);
    case "shaft":
      return fit && value === fit.spec.shaft.slug
        ? `${fit.spec.shaft.model} ${flexName(fit.spec.shaft.flex, l)}`
        : shaftName(value);
    case "length": {
      const n = Number(value);
      return n === 0 ? spec.standard : spec.inch(`${n > 0 ? "+" : "−"}${l.f.num(Math.abs(n), 1)}`);
    }
    case "lie": {
      const n = Number(value);
      return n === 0 ? spec.standard : (n > 0 ? spec.upright : spec.flat)(`${Math.abs(n)}°`);
    }
    case "grip":
      return spec.grip[value] ?? cap(value);
    case "purchase":
      return value === "stock" ? spec.stock : value === "custom" ? spec.custom : cap(value);
  }
}

export type Certainty = { key: "confirmed" | "likely" | "check"; tone: "good" | "neutral" | "close" };

/** On dev golfers, parts called at >=95% were right 98.8-99.7% of the time; at 80-95%, 83-91%. */
export function certainty(c: Component): Certainty {
  if (c.confidence >= 0.95) return c.close_call ? { key: "likely", tone: "neutral" } : { key: "confirmed", tone: "good" };
  if (c.close_call || c.confidence < 0.8) return { key: "check", tone: "close" };
  return { key: "likely", tone: "neutral" };
}

export const certaintyLabel = (c: Component, l: L) => l.t.certainty[certainty(c).key];

export const joinList = (xs: string[], l: L) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")}${l.t.common.and}${xs[xs.length - 1]}`;

/** The fit in a fitter's words: what's settled and what's still a close call. */
export function certaintySummary(fit: FitResponse, l: L): string {
  const parts = fit.components.filter((c) => c.part !== "purchase");
  const name = (c: Component) => l.lower(l.t.part[c.part]);
  const settled = parts.filter((c) => certainty(c).key !== "check").map(name);
  const close = parts.filter((c) => certainty(c).key === "check").map((c) =>
    c.alternative
      ? `${name(c)} (${l.t.common.or(partValue(c.part, c.value, fit, l), partValue(c.part, c.alternative, fit, l))})`
      : name(c));
  const out = [];
  if (settled.length) out.push(l.t.summary.settled(joinList(settled, l)));
  if (close.length) out.push(l.t.summary.close(joinList(close, l)));
  return out.join(" ");
}

export type Change = { part: Component["part"]; from: string; to: string; confFrom: number; confTo: number };

export function diffFits(a: FitResponse, b: FitResponse, l: L): Change[] {
  return b.components.flatMap((c) => {
    const old = a.components.find((x) => x.part === c.part);
    if (!old) return [];
    if (old.value === c.value && Math.abs(old.confidence - c.confidence) < 0.01) return [];
    return [{ part: c.part, from: partValue(c.part, old.value, a, l), to: partValue(c.part, c.value, b, l),
              confFrom: old.confidence, confTo: c.confidence }];
  });
}
