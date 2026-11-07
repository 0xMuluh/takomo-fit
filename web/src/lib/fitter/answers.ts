import type { L } from "../../i18n";
import { MPH_TO_KMH, YD_TO_M } from "../../i18n/format";
import type { Characteristic, Evidence, Questionnaire } from "../api";
import type { Draft, Extras, Miss } from "../session";

/**
 * What the voice fitter passes to record_answers. Every field is optional; the LLM sends what it just learned,
 * in whichever units the golfer used.
 */
export type AnswerParams = Partial<{
  first_name: string;
  handedness: "right" | "left";
  score_band: number;
  rounds_per_year: Questionnaire["rounds_per_year"];
  carry_7i_yards: number;
  carry_7i_metres: number;
  speed_7i_mph: number;
  speed_7i_kmh: number;
  current_7i: string;
  current_7i_loft_deg: number;
  misses: string;
  flight: Questionnaire["flight"];
  tempo: Questionnaire["tempo"] | "unsure";
  priorities: string;
  age: number;
  sex: Questionnaire["sex"];
  height_cm: number;
  glove_size: NonNullable<Questionnaire["glove"]> | "unsure";
  carry_source: NonNullable<Extras["carrySource"]>;
  launch_data: NonNullable<Extras["launchData"]>;
  launch_device: string;
  club_from_150_yards: string;
  club_from_140_metres: string;
  years_playing: number;
  lessons: NonNullable<Extras["lessons"]>;
  injuries: string;
  current_set_age_years: number;
  current_set_fitted: boolean;
  current_set_feedback: string;
  home_course: string;
  practice_surface: NonNullable<Extras["practiceSurface"]>;
  goal: string;
}>;

export type Answers = { q: Draft; x: Extras };

const CHARS: Characteristic[] = ["forgiveness", "distance", "forged feel", "distance control", "workability",
  "less offset", "more offset"];
const MISSES: Miss[] = ["left", "right", "fat", "thin", "toe", "heel"];
const SCORES = ["under 71", "71-77", "78-84", "85-92", "over 92"];
/** 101 MKII, from the product catalog; the other heads run up to 34°. */
const TAKOMO_STRONGEST_7I_LOFT = 29;

const list = (s: string) => s.toLowerCase().split(/[,;/]| and /).map((x) => x.trim()).filter(Boolean);
const inRange = (v: number | undefined, lo: number, hi: number) => v !== undefined && Number.isFinite(v) && v >= lo && v <= hi;

export const emptyAnswers = (): Answers => ({ q: { characteristics: [] }, x: { misses: [] } });

/** Merge what the fitter heard, rejecting values the engine would refuse, and say what was rejected. */
export function mergeAnswers(a: Answers, p: AnswerParams): { next: Answers; rejected: string[] } {
  const q: Draft = { ...a.q };
  const x = { ...a.x };
  const rejected: string[] = [];
  /** `k` converts the golfer's unit to the engine's; the range is checked, and reported, in the golfer's unit. */
  const num = (label: string, v: number | undefined, lo: number, hi: number, set: (v: number) => void, k = 1) => {
    if (v === undefined || v === null) return;
    if (inRange(v / k, lo, hi)) set(v / k);
    else rejected.push(`${label} ${v} is outside ${Math.round(lo * k)}-${Math.round(hi * k)}`);
  };
  const carry = (v: number) => { q.carry_yd = Math.round(v); x.carryUnsure = false; };

  if (p.first_name?.trim()) x.name = p.first_name.trim().split(/\s+/)[0];
  if (p.handedness) q.handedness = p.handedness;
  num("score_band", p.score_band, 1, 5, (v) => (q.score_bucket = Math.round(v)));
  if (p.rounds_per_year) q.rounds_per_year = p.rounds_per_year;
  num("carry_7i_yards", p.carry_7i_yards, 40, 250, carry);
  num("carry_7i_metres", p.carry_7i_metres, 40, 250, carry, YD_TO_M);
  num("speed_7i_mph", p.speed_7i_mph, 40, 130, (v) => (q.speed_mph = v));
  num("speed_7i_kmh", p.speed_7i_kmh, 40, 130, (v) => (q.speed_mph = Math.round(v * 10) / 10), MPH_TO_KMH);
  if (p.current_7i?.trim()) x.currentClub = p.current_7i.trim();
  num("current_7i_loft_deg", p.current_7i_loft_deg, 24, 40, (v) => (q.own_7i_loft_deg = v));
  if (p.misses) x.misses = list(p.misses).filter((m): m is Miss => (MISSES as string[]).includes(m));
  if (p.flight) q.flight = p.flight;
  if (p.tempo === "unsure") { q.tempo = "moderate"; x.tempoUnsure = true; }
  else if (p.tempo) { q.tempo = p.tempo; x.tempoUnsure = false; }
  if (p.priorities) {
    q.characteristics = list(p.priorities).map((c) => CHARS.find((k) => k === c || c.includes(k)))
      .filter((c, i, arr): c is Characteristic => !!c && arr.indexOf(c) === i).slice(0, 3);
  }
  num("age", p.age, 8, 100, (v) => (q.age = Math.round(v)));
  if (p.sex) q.sex = p.sex;
  num("height_cm", p.height_cm, 120, 225, (v) => (q.height_cm = Math.round(v * 10) / 10));
  if (p.glove_size === "unsure") { q.glove = undefined; x.gloveUnsure = true; }
  else if (p.glove_size) { q.glove = p.glove_size; x.gloveUnsure = false; }

  if (p.carry_source) x.carrySource = p.carry_source;
  if (p.launch_data) x.launchData = p.launch_data;
  if (p.launch_device?.trim()) x.launchDevice = p.launch_device.trim();
  const club150 = p.club_from_150_yards ?? p.club_from_140_metres;
  if (club150?.trim()) {
    x.clubFrom150 = { club: club150.trim(), yards: p.club_from_150_yards ? 150 : Math.round(140 / YD_TO_M) };
  }
  num("years_playing", p.years_playing, 0, 80, (v) => (x.yearsPlaying = Math.round(v)));
  if (p.lessons) x.lessons = p.lessons;
  if (p.injuries?.trim()) x.injuries = p.injuries.trim();
  num("current_set_age_years", p.current_set_age_years, 0, 60, (v) => (x.setAgeYears = Math.round(v)));
  if (p.current_set_fitted != null) x.setFitted = p.current_set_fitted;
  if (p.current_set_feedback?.trim()) x.setFeedback = p.current_set_feedback.trim();
  if (p.home_course?.trim()) x.homeCourse = p.home_course.trim();
  if (p.practice_surface) x.practiceSurface = p.practice_surface;
  if (p.goal?.trim()) x.goal = p.goal.trim();
  return { next: { q, x }, rejected };
}

/** Iron number of a club the golfer names ("6", "6i", "six iron", "PW" = 10). */
function ironNumber(club: string): number | undefined {
  const s = club.toLowerCase();
  if (/\bp(w|itching)\b|pitch/.test(s)) return 10;
  const words = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const n = Number(/(\d)/.exec(s)?.[1] ?? words.findIndex((w) => w && s.includes(w)));
  return n >= 3 && n <= 9 ? n : undefined;
}

/**
 * The 7-iron carry implied by the club they actually hit from a known distance: about 10 yards per iron. This is
 * what they do, not what they remember, so it's the cross-check for a remembered carry.
 */
export function impliedCarry(x: Extras): number | undefined {
  if (!x.clubFrom150) return undefined;
  const n = ironNumber(x.clubFrom150.club);
  return n === undefined ? undefined : x.clubFrom150.yards + (n - 7) * 10;
}

export type Need = keyof L["t"]["missing"];

/** Fields the engine needs before it can compute a fit, in the order a fitter would ask. */
export function missing(a: Answers): Need[] {
  const q = a.q;
  const out: Need[] = [];
  if (!q.score_bucket) out.push("score");
  if (q.carry_yd === undefined && q.speed_mph === undefined) out.push("carry");
  if (!q.flight) out.push("flight");
  if (!q.tempo) out.push("tempo");
  if (!q.age) out.push("age");
  if (!q.sex) out.push("sex");
  if (!q.height_cm) out.push("height");
  return out;
}

export const needList = (a: Answers, l: L) => missing(a).map((k) => l.t.missing[k]);

/** Optional details a fitter would still ask about. */
export function niceToHave(a: Answers): string[] {
  const { q, x } = a;
  return [
    !x.launchData && (q.carry_yd !== undefined || q.speed_mph !== undefined)
      && "whether they've hit on any simulator or launch monitor lately (TrackMan, Foresight, Garmin, Rapsodo, "
      + "FlightScope, Uneekor, SkyTrak, Full Swing, a Toptracer range...) and can show you the numbers now: a photo or "
      + "video of the screen, an app screenshot, a report link or an export",
    !q.handedness && "handedness",
    !q.rounds_per_year && "rounds a year",
    !x.currentClub && q.own_7i_loft_deg == null && "their current 7-iron and its loft",
    !x.misses.length && "where their bad shots go",
    !q.characteristics.length && "what they value most",
    !q.glove && !x.gloveUnsure && "glove size",
    q.carry_yd !== undefined && !x.clubFrom150 && "which club they hit from 150 yards (140 metres) on a normal day",
    q.carry_yd !== undefined && !x.carrySource && "where their 7-iron number comes from: a launch monitor, a GPS app, or feel",
    x.yearsPlaying === undefined && "how long they've played",
    !x.lessons && "whether they take lessons or are changing their swing",
    !x.injuries && "any injuries or sore joints (back, wrist, elbow, shoulder)",
    x.setAgeYears === undefined && "how old their current irons are and whether they were fitted",
    !x.goal && "what they're chasing this season",
  ].filter((s): s is string => !!s);
}

/** Background a fitter would use when explaining, phrased as instructions to the fitter. */
export function fitterHints(a: Answers, measured = false): string[] {
  const { x } = a;
  const out: string[] = [];
  if (x.launchData === "now" && !measured) {
    out.push(`They have launch monitor numbers on hand${x.launchDevice ? ` (${x.launchDevice})` : ""}. Measured `
      + "numbers beat remembered ones, so call start_measurement launch_monitor now; it works before the fit is "
      + "ready. Any brand works: a photo or video of the screen, an app screenshot, a TrackMan link, or an export.");
  } else if (x.launchData === "later" && !measured) {
    out.push("They can get launch monitor numbers later. Near the end, remind them they can come back and add a "
      + "photo or video of the screen with the + button, and the fit will update.");
  }
  if (x.injuries && !/^(none|no|nothing)$/i.test(x.injuries)) {
    out.push(`They mentioned ${x.injuries}. When you explain the shaft, say plainly that shaft weight matters for that: `
      + "a lighter graphite shaft is easier on joints. If the fit says steel, tell them graphite is worth trying and "
      + "use what_if or compare to show what it changes; never swap the recommendation yourself.");
  }
  if (x.lessons === "current") {
    out.push("They're working on their swing with a coach. Lie and shaft can move as the swing changes, so the "
      + "30-day return on a stock set is worth more to them; say so when you give the stock-or-custom advice.");
  }
  if (x.practiceSurface === "mat") {
    out.push("They practise off mats. Mats hide heavy contact, so if they do the ball-line test or quote distances "
      + "from the range, mention that real turf can play shorter.");
  }
  if (x.setFitted === false && x.setAgeYears !== undefined && x.setAgeYears >= 8) {
    out.push(`Their irons are about ${x.setAgeYears} years old and were never fitted. Older 7-irons often have weaker `
      + "lofts, so a Takomo 7-iron may fly further at the same swing: that's loft, not a better swing.");
  }
  return out;
}

/** Answers that don't add up, phrased as what a fitter would check. `l` is the agent's English, in the golfer's units. */
export function doubtful(a: Answers, l: L): string[] {
  const { q, x } = a;
  const out: string[] = [];
  const c = q.carry_yd;
  const b = q.score_bucket;
  const implied = impliedCarry(x);
  if (c && implied !== undefined && c - implied >= 12) {
    out.push(`They said a ${l.f.dist(c)} 7-iron, but they hit ${x.clubFrom150!.club} from ${l.f.dist(x.clubFrom150!.yards)}, `
      + `which puts an ordinary 7-iron near ${l.f.dist(implied)}. Don't accuse; ask which is closer on a normal day. `
      + "Most golfers quote their best one, and that's fine to say.");
  }
  if (c && x.carrySource === "launch_monitor") {
    out.push("Their carry comes from a launch monitor. Ask them to show it: a photo or video of the screen, an app "
      + "screenshot, a TrackMan link or an export turns their number into a measurement (start_measurement "
      + "launch_monitor).");
  } else if (c && x.carrySource === "feel" && implied === undefined) {
    out.push("Their carry is from feel. Ask the club they'd hit from 150 yards (140 metres) to a back flag over water: "
      + "what they actually pull is more honest than what they remember.");
  }
  if (c && b && q.speed_mph === undefined) {
    if ((b >= 4 && c >= 165) || (b === 5 && c >= 155)) {
      out.push(`A ${l.f.dist(c)} 7-iron is long for someone who usually shoots ${SCORES[b - 1]}. Golfers often `
        + "remember their best shot or include roll. Ask whether that is a normal shot, in the air.");
    } else if (b <= 2 && c < 125) {
      out.push(`A ${l.f.dist(c)} 7-iron is short for someone who shoots ${SCORES[b - 1]}. Check the number and the score.`);
    }
  }
  if (q.own_7i_loft_deg != null && q.own_7i_loft_deg < TAKOMO_STRONGEST_7I_LOFT) {
    out.push(`Their current 7-iron has a ${q.own_7i_loft_deg}° loft, stronger than any Takomo 7-iron `
      + `(${TAKOMO_STRONGEST_7I_LOFT}° to 34°). Make sure they expect a Takomo 7-iron to fly shorter at the same swing: `
      + "that is loft, not lost speed.");
  }
  return out;
}

/** Club speed and carry a measurement gave, for comparing with what the golfer said. */
export function measuredNumbers(ev: Evidence): { speed?: number; carry?: number; source?: string } {
  const lm = ev.launch_monitor;
  if (lm) {
    const own = lm.own_7i ?? [];
    const med = (k: "club_speed_mph" | "carry_yd") => {
      const v = own.map((s) => s[k]).filter((n): n is number => n != null).sort((p, r) => p - r);
      return v.length ? v[Math.floor(v.length / 2)] : undefined;
    };
    const s = own.length >= 3 ? undefined : lm.own_7i_summary;
    const carryIs7i = !s || s.mean.carry_yd != null;
    return { speed: (s ? s.mean.club_speed_mph : med("club_speed_mph")) ?? undefined,
             carry: carryIs7i ? ((s ? s.mean.carry_yd : med("carry_yd")) ?? undefined) : undefined,
             source: "launch monitor" };
  }
  const v = ev.swing_video;
  if (v?.clubhead_speed_mph && v.fps >= 200) return { speed: v.clubhead_speed_mph, source: "slow-motion video" };
  return {};
}

/** What they said against what was just measured, as an instruction to the fitter; undefined when it agrees. */
export function saidVsMeasured(a: Answers, ev: Evidence, l: L): string | undefined {
  const { q } = a;
  const m = measuredNumbers(ev);
  const parts: string[] = [];
  if (q.speed_mph != null && m.speed != null && Math.abs(q.speed_mph - m.speed) >= 3) {
    parts.push(`they said ${l.f.speed(q.speed_mph)} club speed and the ${m.source} measured ${l.f.speed(m.speed, 1)}`);
  }
  if (q.carry_yd != null && m.carry != null && Math.abs(q.carry_yd - m.carry) >= 8) {
    parts.push(`they said a ${l.f.dist(q.carry_yd)} 7-iron and the ${m.source} measured ${l.f.dist(m.carry)} carry`);
  }
  if (!parts.length) return undefined;
  return `Said versus measured: ${parts.join("; ")}. Tell them straight, kindly and with a bit of humour: the fit now `
    + "runs on the measured number, and remembering a good one is what nearly every golfer does.";
}

export function toQuestionnaire(a: Answers): Questionnaire {
  return { handedness: "right", ...a.q } as Questionnaire;
}
