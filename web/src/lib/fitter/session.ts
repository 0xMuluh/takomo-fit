import { agentL, makeL, type Locale } from "../../i18n";
import { api, type Evidence, type FitResponse } from "../api";
import { diffFits, type Change } from "../format";
import { saveFitContext } from "../session";
import {
  doubtful, emptyAnswers, fitterHints, measuredNumbers, mergeAnswers, needList, niceToHave, saidVsMeasured,
  toQuestionnaire,
  type AnswerParams,
} from "./answers";
import { changesText, fitBrief, KIND_LABEL, measurementGuide, suggestedKinds, type Kind } from "./describe";
import { evidenceKeys, evidenceKeysOf } from "./evidence";
import { fitterTools, type ToolState } from "./tools";
import { measuredNote } from "./notes";

export type SessionEvents = {
  onState: (s: ToolState) => void;
  onChanges?: (c: Change[]) => void;
  onMeasure?: (k: Kind | undefined) => void;
  onResults?: () => void;
  onOpenBreakdown?: () => void;
};

/** One golfer's live fitting: what they said, what was measured, and the engine's current fit. */
export class FitterSession {
  s: ToolState;
  private doubts = new Set<string>();

  /** `locale` is read on every call, so a language or units switch applies from the next refit. */
  constructor(private ev: SessionEvents, private locale: () => Locale, initial?: Partial<ToolState>) {
    this.s = { answers: emptyAnswers(), evidence: {}, ...initial };
  }

  private set(patch: Partial<ToolState>) {
    this.s = { ...this.s, ...patch };
    this.ev.onState(this.s);
  }

  /** The fitter's instructions are English; the numbers in them are in the golfer's units. */
  private get al() {
    return agentL(this.locale().units);
  }

  done() {
    return evidenceKeysOf(this.s.evidence, this.s.fit);
  }

  async refit(): Promise<{ fit?: FitResponse; changes: Change[] }> {
    const { answers, evidence } = this.s;
    if (needList(answers, this.al).length) return { changes: [] };
    const prev = this.s.fit;
    const fit = await api.createFit({ questionnaire: toQuestionnaire(answers), evidence }, this.locale());
    const changes = prev ? diffFits(prev, fit, this.al) : [];
    this.set({ fit });
    if (changes.length) this.ev.onChanges?.(changes);
    saveFitContext(fit.fit_id, { q: answers.q, x: answers.x, captured: evidenceKeys(evidence) });
    return { fit, changes };
  }

  async recordAnswers(p: AnswerParams): Promise<string> {
    const { next, rejected } = mergeAnswers(this.s.answers, p);
    this.set({ answers: next });
    const out = ["Saved."];
    if (rejected.length) out.push(`Not saved, check with the golfer: ${rejected.join("; ")}.`);
    const need = needList(next, this.al);
    if (need.length) {
      out.push(`Still needed before a fit (${7 - need.length}/7 done): ${need.join(", ")}.`);
      const extra = niceToHave(next);
      if (extra.length) out.push(`Optional to weave in alongside a required question (never delay the fit for these): ${extra.slice(0, 2).join(", ")}.`);
    } else {
      const had = !!this.s.fit;
      const { fit, changes } = await this.refit();
      if (fit && !had) {
        out.push(`Fit ready (7/7 core answers complete). Stop asking interview questions and give your first read now, then offer optional measurements once as a group (if they decline or ask for the recommendation directly, skip all measurements and give the verdict):\n${fitBrief(fit, this.done(), this.al, next)}`);
      } else if (fit) {
        out.push(`Fit updated. ${changesText(changes, fit, this.al)}`);
      }
    }
    const fresh = doubtful(next, this.al).filter((d) => !this.doubts.has(d));
    fresh.forEach((d) => this.doubts.add(d));
    if (fresh.length) out.push(`Double-check: ${fresh.join(" ")}`);
    const hints = fitterHints(next, !!this.s.evidence.launch_monitor).filter((d) => !this.doubts.has(d));
    hints.forEach((d) => this.doubts.add(d));
    if (hints.length) out.push(`Keep in mind: ${hints.join(" ")}`);
    return out.join("\n");
  }

  /**
   * Adds a measurement and refits. `note` is for the golfer's screen, in their language; `message` tells the
   * fitter what was found and what changed.
   */
  async addEvidence(kind: Kind, ev: Evidence): Promise<{ note: string; message: string }> {
    const said = saidVsMeasured(this.s.answers, ev, this.al);
    const { q, x } = this.s.answers;
    const measured = measuredNumbers(ev).speed;
    // A measured 7-iron speed answers the carry question better than memory can.
    const standsIn = measured != null && q.speed_mph === undefined && q.carry_yd === undefined;
    this.set({
      evidence: { ...this.s.evidence, ...ev },
      ...(ev.launch_monitor && {
        answers: { q: standsIn ? { ...q, speed_mph: Math.round(measured * 10) / 10 } : q,
                   x: { ...x, launchData: "now", carrySource: x.carrySource ?? "launch_monitor" } },
      }),
    });
    const had = !!this.s.fit;
    const { fit, changes } = await this.refit();
    const height = this.s.answers.q.height_cm;
    const note = measuredNote(ev, height, makeL(this.locale()));
    const what = `[measurement] ${KIND_LABEL[kind]} finished. ${measuredNote(ev, height, this.al)} `;
    if (!fit) {
      return {
        note,
        message: what + "It's saved and counts as soon as the fit is ready. "
          + (standsIn ? "Their measured 7-iron club speed now stands in for the carry question; don't ask for a carry. " : "")
          + `Still needed before a fit: ${needList(this.s.answers, this.al).join(", ")}. React to the numbers in one `
          + "sentence, then carry on with the interview.",
      };
    }
    if (!had) return { note, message: what + `Fit ready. Give your first read:\n${fitBrief(fit, this.done(), this.al, this.s.answers)}` };
    const next = suggestedKinds(fit, this.done())[0];
    return {
      note,
      message: what + `${changesText(changes, fit, this.al)} ${said ? `${said} ` : ""}`
        + (next ? `Most useful next: ${KIND_LABEL[next]}.` : "No further measurement would change the fit."),
    };
  }

  tools() {
    return fitterTools({
      state: () => this.s,
      locale: this.locale,
      setCatalog: (catalog) => this.set({ catalog }),
      recordAnswers: (p) => this.recordAnswers(p),
      startMeasurement: (kind) => {
        if (!this.s.fit && kind !== "launch_monitor") {
          return `Not yet: finish the interview first. Still needed: ${needList(this.s.answers, this.al).join(", ")}. `
            + "Only the launch monitor upload can be done before the fit is ready.";
        }
        if (!KIND_LABEL[kind]) return "Unknown measurement.";
        this.ev.onMeasure?.(kind);
        return measurementGuide(kind, this.al);
      },
      cancelMeasurement: () => {
        this.ev.onMeasure?.(undefined);
        return "Closed. They can do it later.";
      },
      showResults: () => {
        this.ev.onResults?.();
        return "The summary preview card is on their screen, with a button to open the full breakdown.";
      },
      openFullBreakdown: () => {
        if (!this.s.fit) return "No fit yet.";
        this.ev.onOpenBreakdown?.();
        return "Opening the full written breakdown and ending the live session. You've already said goodbye, so say nothing more.";
      },
    });
  }
}
