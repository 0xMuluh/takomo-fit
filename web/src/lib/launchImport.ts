import type { LaunchMonitor, Reading } from "./api";

export const IRONS = ["5i", "6i", "7i", "8i", "9i"] as const;

/**
 * Club speed drops about 2.5 % per iron number (TrackMan's published tour and LPGA averages: 6-iron 92 / 78 mph,
 * 7-iron 90 / 76, 8-iron 87 / 74), so another iron's speed converts to a 7-iron estimate. Launch, carry and
 * landing depend on loft and don't convert.
 */
const SPEED_STEP = 0.025;

export function sevenIronSpeed(speedMph: number, club: string): number | undefined {
  const n = Number(/^(\d)i$/.exec(club)?.[1]);
  if (!(n >= 5 && n <= 9)) return undefined;
  return speedMph * (1 + SPEED_STEP * (n - 7));
}

/** The speed measured with `club`, back from its 7-iron estimate. */
export function measuredSpeed(sevenMph: number, club: string): number | undefined {
  const k = sevenIronSpeed(1, club);
  return k === undefined ? undefined : sevenMph / k;
}

/** The evidence a confirmed reading becomes, or undefined when it can't describe a 7-iron. */
export function toLaunchMonitor(r: Reading, club: string): LaunchMonitor | undefined {
  const base = { kind: r.kind, source: r.source, device: r.device ?? null, takomo_test_club: [], takomo_201_landing_angles: [] };
  const shots = r.shot_list ?? [];
  if (club === "7i") {
    return shots.length >= 3
      ? { ...base, own_7i: shots, own_7i_summary: null }
      : { ...base, own_7i: [], own_7i_summary: { shots: r.shots ?? null, mean: r.mean, sd: r.sd ?? {} } };
  }
  const sp = r.mean.club_speed_mph;
  const seven = sp != null ? sevenIronSpeed(sp, club) : undefined;
  if (seven === undefined) return undefined;
  return { ...base, own_7i: [], converted_from: club as LaunchMonitor["converted_from"],
           own_7i_summary: { shots: r.shots ?? null, mean: { club_speed_mph: Math.round(seven * 10) / 10 }, sd: {} } };
}
