import type { Characteristic, Questionnaire } from "./api";

export type Draft = Partial<Questionnaire> & { characteristics: Characteristic[] };
export type Miss = "left" | "right" | "fat" | "thin" | "toe" | "heel";
export type CaptureKey = "body" | "hand" | "swing" | "ballLine" | "radar";

/** What the golfer told us that the engine doesn't take as input, kept for explanations and comparisons. */
export type Extras = {
  name?: string;
  misses: Miss[];
  currentClub?: string;
  speedFirst?: boolean;
  carryUnsure?: boolean;
  tempoUnsure?: boolean;
  gloveUnsure?: boolean;
  carrySource?: "launch_monitor" | "gps_app" | "feel";
  /** Whether they have recent numbers from any simulator or launch monitor to show: now, later, or none. */
  launchData?: "now" | "later" | "none";
  launchDevice?: string;
  /** The club they actually hit from a set distance; the honest cross-check for a remembered carry. */
  clubFrom150?: { club: string; yards: number };
  yearsPlaying?: number;
  lessons?: "never" | "past" | "current";
  injuries?: string;
  setAgeYears?: number;
  setFitted?: boolean;
  setFeedback?: string;
  homeCourse?: string;
  practiceSurface?: "mat" | "grass" | "both";
  goal?: string;
};

export type FitContext = { q: Draft; x: Extras; captured: CaptureKey[] };

export function saveFitContext(fitId: string, c: FitContext) {
  try {
    localStorage.setItem(`pf:ctx:${fitId}`, JSON.stringify(c));
  } catch {}
}

export function loadFitContext(fitId: string): FitContext | undefined {
  try {
    const s = localStorage.getItem(`pf:ctx:${fitId}`);
    return s ? JSON.parse(s) : undefined;
  } catch {
    return undefined;
  }
}

export const MISS_LABEL: Record<Miss, string> = {
  left: "Left", right: "Right", fat: "Fat (ground first)", thin: "Thin", toe: "Off the toe", heel: "Off the heel",
};
