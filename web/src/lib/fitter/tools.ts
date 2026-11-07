import { agentL, type Locale } from "../../i18n";
import { MPH_TO_KMH } from "../../i18n/format";
import { api, type Catalog, type Component, type Evidence, type FitResponse, type Overrides } from "../api";
import { certaintySummary } from "../format";
import { evidenceKeysOf } from "./evidence";
import { needList, type AnswerParams, type Answers } from "./answers";
import { compareText, explainPart, fitBrief, type Kind } from "./describe";

export type ToolState = { answers: Answers; evidence: Evidence; fit?: FitResponse; catalog?: Catalog };

/** What the screen hosting the fitter can do beyond reading the fit. */
export type ToolHost = {
  state: () => ToolState;
  /** The golfer's language and units; fits are fetched in them and every number the fitter is given uses them. */
  locale: () => Locale;
  setCatalog: (c: Catalog) => void;
  recordAnswers?: (p: AnswerParams) => Promise<string>;
  startMeasurement?: (k: Kind) => string;
  cancelMeasurement?: () => string;
  showResults?: () => string;
};

const NOT_HERE = "That isn't available on this screen. The golfer can go back to the live fitting to do it.";

function guard<A>(fn: (a: A) => Promise<string> | string) {
  return async (a: A) => {
    try {
      return await fn(a ?? ({} as A));
    } catch {
      return "The fitting engine didn't respond. Tell the golfer you're checking, and try once more.";
    }
  };
}

type WhatIfParams = Partial<{ speed_mph: number; speed_kmh: number; height_cm: number; hand_length_cm: number;
                              score_band: number; flight: Overrides["flight"]; tempo: Overrides["tempo"] }>;

/** Client tools for the ElevenLabs fitter. Names and parameters match scripts/setup_voice_agent.py. */
export function fitterTools(h: ToolHost) {
  const l = () => agentL(h.locale().units);
  const noFit = (s: ToolState) => {
    const need = needList(s.answers, l());
    return `No fit yet. Still needed: ${need.length ? need.join(", ") : "nothing; call record_answers to compute it"}.`;
  };
  const catalog = async () => {
    const c = h.state().catalog ?? (await api.catalog(h.locale().lang));
    h.setCatalog(c);
    return c;
  };
  return {
    record_answers: guard<AnswerParams>((p) => (h.recordAnswers ? h.recordAnswers(p) : NOT_HERE)),
    get_fit: guard(() => {
      const s = h.state();
      return s.fit ? fitBrief(s.fit, evidenceKeysOf(s.evidence, s.fit), l()) : noFit(s);
    }),
    explain_part: guard<{ part: Component["part"] }>(({ part }) => {
      const s = h.state();
      return s.fit ? explainPart(s.fit, part, s.answers, l()) : noFit(s);
    }),
    compare: guard<{ what: string; other_head?: string }>(async ({ what, other_head }) => {
      const s = h.state();
      return s.fit ? compareText(s.fit, await catalog(), what, other_head, s.answers, l()) : noFit(s);
    }),
    what_if: guard<WhatIfParams>(async (p) => {
      const s = h.state();
      if (!s.fit) return noFit(s);
      const speed = p.speed_mph ?? (p.speed_kmh != null ? p.speed_kmh / MPH_TO_KMH : undefined);
      const ov: Overrides = Object.fromEntries(Object.entries({
        speed_mph: speed, height_cm: p.height_cm, hand_length_cm: p.hand_length_cm,
        score_bucket: p.score_band == null ? undefined : Math.round(p.score_band), flight: p.flight, tempo: p.tempo,
      }).filter(([, v]) => v !== undefined && v !== null));
      if (!Object.keys(ov).length) return "Tell me which value to change.";
      const r = await api.whatIf(s.fit.fit_id, ov, h.locale());
      return (r.changes.length ? `If that were true: ${r.changes.join("; ")}.` : "Nothing in the spec would change.")
        + ` ${certaintySummary(r.after, l())}`;
    }),
    start_measurement: guard<{ kind: Kind }>(({ kind }) => (h.startMeasurement ? h.startMeasurement(kind) : NOT_HERE)),
    cancel_measurement: guard(() => (h.cancelMeasurement ? h.cancelMeasurement() : NOT_HERE)),
    show_results: guard(() => (h.showResults ? h.showResults() : "The full breakdown is already on their screen.")),
  };
}
