import type { L } from "@/i18n";
import type { Evidence } from "../api";
import { measuredSpeed } from "../launchImport";

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** What a measurement found, in one sentence. */
export function measuredNote(ev: Evidence, heightCm: number | null | undefined, l: L): string {
  const { t, f } = l;
  if (ev.body_photo?.wrist_to_floor_ratio && heightCm) return t.notes.wtf(f.cm(ev.body_photo.wrist_to_floor_ratio * heightCm));
  if (ev.hand_photo) return t.notes.hand(f.cm(ev.hand_photo.hand_length_cm));
  if (ev.swing_video) {
    const v = ev.swing_video;
    return t.notes.swing(f.sec(v.backswing_s), f.sec(v.downswing_s), f.ratio(v.backswing_s / v.downswing_s),
                         v.clubhead_speed_mph ? f.speed(v.clubhead_speed_mph) : undefined);
  }
  if (ev.ball_line_tilts_deg?.length) {
    const m = mean(ev.ball_line_tilts_deg);
    return Math.abs(m) < 0.5 ? t.notes.ballLineSquare : t.notes.ballLineLean(f.deg(Math.abs(m)), m > 0);
  }
  if (ev.launch_monitor) {
    const lm = ev.launch_monitor;
    const own = lm.own_7i ?? [];
    if (own.length < 3 && lm.own_7i_summary) {
      const sp = lm.own_7i_summary.mean.club_speed_mph;
      const raw = sp != null && lm.converted_from ? measuredSpeed(sp, lm.converted_from) : undefined;
      return t.notes.radarSummary(lm.source ?? "csv", sp != null ? f.speed(sp, 1) : undefined, lm.own_7i_summary.shots,
        raw !== undefined ? { club: t.lmImport.clubs[lm.converted_from!], speed: f.speed(raw, 1) } : undefined);
    }
    const sp = own.map((s) => s.club_speed_mph).filter((x): x is number => x != null);
    return t.notes.radar(own.length, sp.length ? f.speed(mean(sp), 1) : undefined);
  }
  return t.notes.added;
}
