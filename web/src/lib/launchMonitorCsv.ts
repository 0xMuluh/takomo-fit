import en, { type Messages } from "@/i18n/messages/en";
import type { LaunchMonitor, Shot } from "./api";

type Field = keyof Shot;

// Header spellings used by common launch-monitor exports (TrackMan, Garmin R10, Rapsodo, FlightScope, Mevo).
const ALIASES: Record<Field, string[]> = {
  club_speed_mph: ["club speed", "clubhead speed", "club head speed", "clubspeed", "club speed (mph)", "club_speed_mph"],
  carry_yd: ["carry", "carry distance", "carry (yds)", "carry dist", "carry_yd", "carry (yd)"],
  launch_angle_deg: ["launch angle", "vert launch", "launch v", "launch_angle_deg", "vertical launch"],
  landing_angle_deg: ["land angle", "landing angle", "descent angle", "landing_angle_deg"],
  dynamic_loft_deg: ["dyn loft", "dynamic loft", "dynamic_loft_deg"],
  attack_angle_deg: ["attack angle", "angle of attack", "aoa", "attack_angle_deg"],
  face_to_path_deg: ["face to path", "face-to-path", "face_to_path_deg"],
  side_yd: ["side", "carry side", "offline", "carry deviation distance", "side_yd", "lateral"],
  impact_offset_mm: ["impact offset", "impact_offset_mm"],
  impact_toe_up_deg: ["impact_toe_up_deg"],
};
const CLUB_COLS = ["club", "club type", "club name", "clubname"];

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if ((ch === "," || ch === ";") && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/[[\].]/g, "").replace(/\s+/g, " ").trim();

export type ParsedSession = { session: LaunchMonitor; shotsFound: number; clubFiltered: boolean; columns: string[] };

export function parseLaunchMonitorCsv(
  text: string,
  kind: LaunchMonitor["kind"],
  msg: Pick<Messages["radar"], "noColumns" | "tooFew"> = en.radar,
): ParsedSession {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headerIdx = lines.findIndex((l) => ALIASES.club_speed_mph.some((a) => norm(l).includes(a)) ||
    ALIASES.carry_yd.some((a) => norm(l).includes(a)));
  if (headerIdx < 0) throw new Error(msg.noColumns);
  const header = splitCsvLine(lines[headerIdx]).map(norm);
  const col: Partial<Record<Field, number>> = {};
  for (const [field, names] of Object.entries(ALIASES) as [Field, string[]][]) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) col[field] = i;
  }
  const clubCol = header.findIndex((h) => CLUB_COLS.includes(h));
  const rows = lines.slice(headerIdx + 1).map(splitCsvLine);
  const sevenIron = (r: string[]) => /(^|\b)(7\s*i(ron)?|7i|i7|7-iron)\b/i.test(r[clubCol] ?? "");
  const anySeven = clubCol >= 0 && rows.some(sevenIron);
  const shots: Shot[] = [];
  for (const r of rows) {
    if (anySeven && !sevenIron(r)) continue;
    const shot: Shot = {};
    for (const [field, i] of Object.entries(col) as [Field, number][]) {
      const v = parseFloat((r[i] ?? "").replace(",", "."));
      if (Number.isFinite(v)) shot[field] = v;
    }
    if (shot.club_speed_mph !== undefined || shot.carry_yd !== undefined) shots.push(shot);
  }
  if (shots.length < 3) throw new Error(msg.tooFew);
  return { session: { kind, source: "csv", own_7i: shots, takomo_test_club: [], takomo_201_landing_angles: [] },
           shotsFound: shots.length, clubFiltered: anySeven, columns: Object.keys(col) };
}
