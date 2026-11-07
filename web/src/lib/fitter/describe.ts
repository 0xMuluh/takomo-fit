import type { L } from "@/i18n";
import type { Catalog, Component, FitResponse, HeadInfo, ShaftInfo } from "../api";
import { certaintyLabel, partValue, type Change } from "../format";
import type { CaptureKey } from "../session";
import type { Answers } from "./answers";

export type Kind = "body" | "hand" | "swing" | "ball_line" | "launch_monitor";

export const KIND_TO_CAPTURE: Record<Kind, CaptureKey> = {
  body: "body", hand: "hand", swing: "swing", ball_line: "ballLine", launch_monitor: "radar",
};
export const KIND_LABEL: Record<Kind, string> = {
  body: "full-body photo", hand: "hand photo with a bank card", swing: "swing", ball_line: "ball-line test",
  launch_monitor: "launch monitor upload",
};
const TEST_KIND: Record<string, Kind> = {
  "hand photo with a bank card": "hand", "slow-motion swing video": "swing", "ball-line test": "ball_line",
  "launch monitor upload": "launch_monitor",
};
const AT_HOME: Kind[] = ["body", "hand", "swing"];
const WHERE: Partial<Record<Kind, string>> = {
  body: "can do now at home", hand: "can do now at home", swing: "can do now at home",
  ball_line: "needs balls and a mat or range; ask if they can do it now",
  launch_monitor: "if they have numbers from any simulator or launch monitor: photo or video of the screen, screenshot, link or export",
};

const PARTS: Component["part"][] = ["head", "shaft", "length", "lie", "grip"];

/** Measurements to suggest next, most useful first: the body photo, then the engine's ranked tests, then the rest. */
export function suggestedKinds(fit: FitResponse, done: Set<CaptureKey>): Kind[] {
  const ranked = fit.next_tests.map((t) => TEST_KIND[t.test]).filter((k): k is Kind => !!k);
  const order: Kind[] = ["body", ...ranked, ...AT_HOME, "ball_line", "launch_monitor"];
  return order.filter((k, i) => order.indexOf(k) === i && !done.has(KIND_TO_CAPTURE[k]));
}

const label = (c: Component, l: L) => certaintyLabel(c, l).toLowerCase();

function partLine(c: Component, fit: FitResponse, l: L): string {
  let s = `- ${l.t.part[c.part]}: ${partValue(c.part, c.value, fit, l)}, ${label(c, l)} (${l.f.pct(c.confidence)})`;
  if (c.alternative && c.alternative_probability != null && (c.close_call || c.confidence < 0.95)) {
    s += `; runner-up ${partValue(c.part, c.alternative, fit, l)} (${l.f.pct(c.alternative_probability)})`;
  }
  return s;
}

/** Everything the fitter needs to talk about the fit, as plain text. `l` is English with the golfer's units. */
export function fitBrief(fit: FitResponse, done: Set<CaptureKey>, l: L): string {
  const { f } = l;
  const comps = PARTS.map((p) => fit.components.find((c) => c.part === p)!).filter(Boolean);
  const unsettled = comps.filter((c) => c.close_call || c.confidence < 0.95);
  const next = suggestedKinds(fit, done);
  const gains = new Map(fit.next_tests.map((t) => [TEST_KIND[t.test], t]));
  const lines = [
    `Spec: ${fit.spec.head_name}; ${partValue("shaft", fit.spec.shaft.slug, fit, l)} shaft; length `
      + `${partValue("length", String(fit.spec.length_in), fit, l)}; lie ${partValue("lie", String(fit.spec.lie_deg), fit, l)}; `
      + `${partValue("grip", fit.spec.grip, fit, l)} grip; ${fit.spec.handedness}-handed; ${fit.spec.purchase} build.`,
    "Parts (confirmed means the engine is at least 95% sure, and on test golfers it was right 99% of the time when it said so):",
    ...comps.map((c) => partLine(c, fit, l)),
    unsettled.length ? `Not yet confirmed: ${unsettled.map((c) => l.t.part[c.part].toLowerCase()).join(", ")}.`
      : "Every part is confirmed.",
    `Stock or custom: ${fit.stock_advice.recommendation}. ${fit.stock_advice.message} `
      + `Chance a stock set is what their swing needs: ${f.pct(fit.stock_advice.probability_stock_is_right)}.`,
    `Measurements done: ${done.size ? [...done].join(", ") : "none yet"}.`,
  ];
  if (next.length) {
    lines.push("Measurements to suggest, most useful first:");
    next.forEach((k, i) => {
      const g = gains.get(k);
      const gain = g ? Object.entries(g.improves).map(([p, [a, b]]) => `${p} ${f.pct(a)} to about ${f.pct(b)}`).join(", ") : "";
      lines.push(`${i + 1}. ${KIND_LABEL[k]} (${WHERE[k]})${gain ? `: expected ${gain}` : ""}`);
    });
  } else {
    lines.push("No remaining measurement would change this fit.");
  }
  if (fit.warnings?.length) lines.push(`Warnings: ${fit.warnings.join(" ")}`);
  return lines.join("\n");
}

export function explainPart(fit: FitResponse, part: Component["part"], a: Answers | undefined, l: L): string {
  const c = fit.components.find((x) => x.part === part);
  if (!c) return `No part called ${part}.`;
  const out = [c.summary, ...c.reasons, c.effect ?? ""].filter(Boolean);
  out.push(`Confidence ${l.f.pct(c.confidence)} (${label(c, l)}).`);
  if (c.alternative && c.alternative_probability != null) {
    out.push(`Runner-up: ${partValue(c.part, c.alternative, fit, l)} at ${l.f.pct(c.alternative_probability)}.`);
  }
  if (c.evidence?.length) out.push(`Evidence: ${c.evidence.map((e) => `${e.source}: ${e.reading}`).join("; ")}.`);
  if (part === "purchase") out.push(fit.stock_advice.message);
  const misses = new Set(a?.x.misses ?? []);
  if (part === "lie" && (misses.has("left") || misses.has("right"))) {
    const lefty = fit.spec.handedness === "left";
    out.push(`They said bad shots go ${[...misses].filter((m) => m === "left" || m === "right").join(" and ")}. `
      + `A lie too upright for them starts shots ${lefty ? "right" : "left"}, too flat ${lefty ? "left" : "right"}; `
      + "swing path does the same, so the ball-line test is what separates club from swing.");
  }
  return out.join(" ");
}

function headLine(h: HeadInfo, fit: FitResponse, l: L): string {
  const r = h.ratings;
  const carry = fit.estimates[`carry_${h.slug}`];
  return `${h.name}: ${h.description}. 7-iron loft ${h.seven_iron_loft_deg}°, offset ${h.seven_iron_offset_mm} mm. `
    + `Takomo ratings out of 5: forgiveness ${r.forgiveness}, distance ${r.distance}, workability ${r.workability}, `
    + `distance control ${r.distance_control}, forged feel ${r.feel || "none (not forged)"}. Built for scores ${h.target_score_label}. `
    + (carry ? `At this golfer's speed: about ${l.f.dist(carry.mean)} carry (±${l.f.dist(carry.sd)}). ` : "")
    + `Engine's pick ${l.f.pct(fit.probabilities.head?.[h.slug] ?? 0)} of the time.`;
}

function shaftLine(s: ShaftInfo): string {
  return `${s.model} ${s.flex}: ${s.material}, ${s.weight_g ? `${s.weight_g} g` : "weight not listed"}, `
    + `launch ${s.flight_profile?.join("/") ?? "not listed"}, suits ${s.tempo_profile?.join("/") ?? "any"} tempo.`;
}

export function compareText(fit: FitResponse, cat: Catalog, what: string, otherHead: string | undefined,
                            a: Answers | undefined, l: L): string {
  const { f } = l;
  const head = (slug: string) => cat.heads.find((h) => h.slug === slug);
  const ours = head(fit.spec.head)!;
  if (what === "shafts") {
    const sa = cat.shafts.find((s) => s.slug === fit.spec.shaft.slug);
    const alt = fit.components.find((c) => c.part === "shaft")?.alternative;
    const sb = alt ? cat.shafts.find((s) => s.slug === alt) : undefined;
    if (!sa) return "Shaft details unavailable.";
    return `Recommended: ${shaftLine(sa)}` + (sb ? `\nRunner-up: ${shaftLine(sb)}` : "\nNo close runner-up shaft.")
      + "\nStiffer flex launches lower with less spin and feels firmer; softer flex launches higher and spins more.";
  }
  if (what === "current_club") {
    const loft = a?.q.own_7i_loft_deg;
    const carry = a?.q.carry_yd;
    const est = fit.estimates[`carry_${ours.slug}`];
    const speed = fit.estimates.speed;
    const parts = [`Their current 7-iron: ${a?.x.currentClub ?? "model not given"}, loft ${loft ?? "unknown"}°, `
      + `their carry estimate ${carry != null ? f.dist(carry) : "not given"}.`,
      `${ours.name}: loft ${ours.seven_iron_loft_deg}°, expected carry ${est ? `${f.dist(est.mean)} (±${f.dist(est.sd)})` : "unknown"}.`];
    if (speed) {
      parts.push(`The engine puts their 7-iron club speed at ${f.speed(speed.mean)} (±${f.speed(speed.sd)}) from `
        + `${speed.sources}. Remembered carries usually run long: golfers recall good shots and often include roll.`);
    }
    if (loft != null) {
      const d = ours.seven_iron_loft_deg - loft;
      parts.push(Math.abs(d) < 1.5 ? "Lofts are about the same."
        : `${ours.name} has ${Math.abs(d).toFixed(1)}° ${d > 0 ? "more" : "less"} loft, so at the same swing it flies `
          + `${d > 0 ? "higher and shorter, landing softer" : "lower and further"}. That is loft, not speed.`);
    } else {
      parts.push("Their loft is unknown. Many modern game-improvement 7-irons have several degrees less loft than "
        + `${ours.seven_iron_loft_deg}°, which is why they fly further.`);
    }
    return parts.join("\n");
  }
  const other = head(otherHead ?? fit.runner_up_head);
  if (!other || other.slug === ours.slug) return `Recommended: ${headLine(ours, fit, l)}\nNo different head to compare.`;
  return `Recommended: ${headLine(ours, fit, l)}\nCompared with: ${headLine(other, fit, l)}`;
}

export function changesText(changes: Change[], fit: FitResponse, l: L): string {
  const real = changes.filter((c) => c.part !== "purchase");
  if (!real.length) return "Nothing in the spec changed and confidence held steady.";
  return real.map((c) => {
    const comp = fit.components.find((x) => x.part === c.part)!;
    return c.from !== c.to
      ? `${l.t.part[c.part]} changed from ${c.from} to ${c.to} (${l.f.pct(c.confTo)}, ${label(comp, l)}).`
      : `${l.t.part[c.part]} stays ${c.to}, ${l.f.pct(c.confFrom)} to ${l.f.pct(c.confTo)} (${label(comp, l)}).`;
  }).join(" ");
}

export function measurementGuide(kind: Kind, l: L): string {
  const { f } = l;
  const steps: Record<Kind, string> = {
    body: `Tell them out loud right now: stand on a hard floor in your golf shoes, prop the phone at waist height about ${f.room(3, 4)} away, step back so your whole body is in frame head to toe with your arms hanging relaxed at your sides, and hold still until you hear the chime.`,
    swing: `Tell them out loud right now: prop the phone at hip height about ${f.room(3)} in front of you, face-on, so your whole body and 7-iron stay in frame, then hold your address still for the ready chime and make three normal swings (or tap upload if you have a slow-motion video). Tell them you'll call out each swing as they go.`,
    hand: "Tell them out loud right now: place any bank card flat on a table, lay your hand flat right next to it with your fingers together, and take a photo looking straight down from above.",
    ball_line: "Tell them out loud right now: draw a straight dark line on a ball with a marker, set it upright on the tee or mat facing the clubface, hit a 7-iron shot, and take a photo of the line mark left on the clubface for at least two shots.",
    launch_monitor: "Tell them out loud right now: any brand works. Take a photo of the screen up close, ideally showing your 7-iron session averages, or upload a video of you hitting with the screen in view, a screenshot from the app, the TrackMan report link from your email, or an export file. Then check the numbers on screen match.",
  };
  return `The ${KIND_LABEL[kind]} is open on their screen. Speak these setup instructions out loud in one or two short sentences so they don't have to read the phone screen while stepping back: ${steps[kind]} React briefly to any [camera] coaching updates, and wait for the [measurement] result.`;
}
