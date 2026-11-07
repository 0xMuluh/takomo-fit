"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import { ApiError, api, type LaunchMonitor, type Reading, type Shot } from "@/lib/api";
import { fileToCanvas } from "@/lib/image";
import { IRONS, sevenIronSpeed, toLaunchMonitor } from "@/lib/launchImport";
import { VideoUnreadable, videoFrames } from "@/lib/videoFrames";
import { Button, Choice, ErrorNote, Segmented, Spinner } from "../ui";
import { LaunchMonitorUpload } from "./LaunchMonitorUpload";
import { MediaPicker } from "./MediaPicker";

type Way = "photo" | "video" | "link" | "csv";
type Field = keyof Shot;

const ROWS: Field[] = ["club_speed_mph", "carry_yd", "launch_angle_deg", "landing_angle_deg", "attack_angle_deg",
  "dynamic_loft_deg", "face_to_path_deg", "side_yd", "impact_offset_mm"];
const isIron = (c?: string | null) => !!c && /^[4-9]i$/.test(c);
const M_TO_YD = 1.0936133;
type Unit = "yd" | "m";

/** The reading with carry and side re-converted, if the golfer says the screen's distances were in the other unit. */
function inUnit(r: Reading, unit: Unit): Reading {
  const read: Unit = r.screen_distance_unit ?? "yd";
  if (unit === read) return r;
  const k = unit === "m" ? M_TO_YD : 1 / M_TO_YD;
  const fix = (s: Shot): Shot => ({
    ...s,
    carry_yd: s.carry_yd == null ? s.carry_yd : Math.round(s.carry_yd * k * 100) / 100,
    side_yd: s.side_yd == null ? s.side_yd : Math.round(s.side_yd * k * 100) / 100,
  });
  return { ...r, mean: fix(r.mean), sd: r.sd && fix(r.sd), shot_list: r.shot_list?.map(fix), screen_distance_unit: unit };
}

/** A shared TrackMan link reduced to its report id; the rest is the sharer's display settings. */
function reportOnly(link: string): string {
  try {
    const u = new URL(link.trim());
    const id = u.searchParams.get("r") ?? u.searchParams.get("a");
    if (!id) return link.trim();
    return `${u.origin}/?${u.searchParams.has("r") ? "r" : "a"}=${encodeURIComponent(id)}`;
  } catch {
    return link.trim();
  }
}

/**
 * A launch-monitor session from any brand: a photo or video of the screen, a shared TrackMan report or a CSV file,
 * confirmed by the golfer.
 */
export function LaunchMonitorImport({ onDone, initial }: {
  onDone: (lm: LaunchMonitor) => void;
  initial?: { file?: File; url?: string };
}) {
  const l = useI18n();
  const m = l.t.lmImport;
  const isVideo = (f?: File) => !!f?.type.startsWith("video/");
  const [way, setWay] = useState<Way>(initial?.url ? "link" : isVideo(initial?.file) ? "video" : "photo");
  const [busy, setBusy] = useState<string>();
  const [err, setErr] = useState<string>();
  const [readings, setReadings] = useState<Reading[]>();
  const [club, setClub] = useState<string>();
  const [unit, setUnit] = useState<Unit>();
  const [url, setUrl] = useState(initial?.url ?? "");
  const started = useRef(false);

  const reset = () => {
    setErr(undefined);
    setReadings(undefined);
    setClub(undefined);
    setUnit(undefined);
  };
  const run = async (label: string, get: () => Promise<Reading[]>) => {
    reset();
    setBusy(label);
    try {
      const rs = await get();
      setReadings(rs);
      const pick = rs.find((r) => r.club === "7i") ?? rs.find((r) => isIron(r.club)) ?? rs[0];
      setClub(isIron(pick?.club) ? pick.club! : rs.length > 1 ? pick?.club ?? undefined : undefined);
    } catch (e) {
      setErr(e instanceof VideoUnreadable ? m.errors.video_codec
        : e instanceof ApiError && e.code ? (m.errors[e.code] ?? m.errors.generic) : m.errors.generic);
    } finally {
      setBusy(undefined);
    }
  };
  const readPhoto = (f: File) => run(m.reading, async () => {
    const c = await fileToCanvas(f, 2560);
    return (await api.readLaunchPhoto(c.toDataURL("image/jpeg", 0.9))).readings;
  });
  const readVideo = (f: File) => run(m.readingVideo, async () => (await api.readLaunchVideo(await videoFrames(f))).readings);
  const readLink = (u = url) => run(m.fetching, async () => (await api.readLaunchReport(reportOnly(u))).readings);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (isVideo(initial?.file)) void readVideo(initial!.file!);
    else if (initial?.file) void readPhoto(initial.file);
    else if (initial?.url) void readLink(initial.url);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const read = readings && (readings.length > 1 ? readings.find((r) => r.club === club) : readings[0]);
  const askUnit = !!read && (read.source === "photo" || read.source === "video")
    && (read.mean.carry_yd != null || read.mean.side_yd != null);
  const reading = read && askUnit ? inUnit(read, unit ?? read.screen_distance_unit ?? "yd") : read;
  const clubs = readings && readings.length > 1
    ? readings.map((r) => r.club).filter((c): c is string => !!c)
    : [...IRONS];
  const lm = reading && club ? toLaunchMonitor(reading, club) : undefined;
  const speed = reading?.mean.club_speed_mph;
  const seven = speed != null && club && club !== "7i" ? sevenIronSpeed(speed, club) : undefined;

  const show = (f: Field, v: number) =>
    f === "club_speed_mph" ? l.f.speed(v, 1)
      : f === "carry_yd" || f === "side_yd" ? l.f.dist(v, 1)
        : f === "impact_offset_mm" ? l.f.mm(v)
          : l.f.deg(v, 1, f === "attack_angle_deg" || f === "face_to_path_deg");

  return (
    <div className="space-y-4">
      <Choice<Way> value={way} onChange={(w) => { setWay(w); reset(); }} columns={2}
        options={[
          { value: "photo", label: m.photo, tip: m.photoHint },
          { value: "video", label: m.video, tip: m.videoHint },
          { value: "link", label: m.link, tip: m.linkHint },
          { value: "csv", label: m.csv, tip: m.csvHint },
        ]} />

      {way === "csv" && <LaunchMonitorUpload onDone={onDone} />}

      {way === "photo" && !readings && (
        <div className="space-y-3">
          <p className="text-[14px] text-ink/70">{m.photoTips}</p>
          {!busy && <MediaPicker kind="photo" onPick={(f) => void readPhoto(f)} />}
          <p className="text-[13px] text-muted">{m.privacy}</p>
        </div>
      )}

      {way === "video" && !readings && (
        <div className="space-y-3">
          <p className="text-[14px] text-ink/70">{m.videoTips}</p>
          {!busy && <MediaPicker kind="video" onPick={(f) => void readVideo(f)} />}
          <p className="text-[13px] text-muted">{m.videoPrivacy}</p>
        </div>
      )}

      {way === "link" && !readings && (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (url.trim()) void readLink(); }}>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-muted">{m.linkLabel}</span>
            <input type="url" inputMode="url" autoComplete="off" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://web-dynamic-reports.trackmangolf.com/?r=…"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-ink" />
          </label>
          <Button type="submit" className="w-full" disabled={!url.trim() || !!busy}>{m.fetch}</Button>
        </form>
      )}

      {busy && <Spinner label={busy} />}
      {err && <ErrorNote>{err}</ErrorNote>}

      {readings && (
        <div className="space-y-4 rounded-xl bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-display text-[18px] font-bold uppercase tracking-wide">{m.check}</div>
            {reading && (
              <div className="text-[13px] text-muted">
                {[reading.device, reading.shots === 1 ? m.oneShot : m.shots(reading.shots)].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[13px] font-medium text-muted">{club ? m.club : m.unknownClub}</div>
            <div className="overflow-x-auto">
              <Segmented<string> value={club ?? ""} onChange={setClub}
                options={clubs.map((c) => ({ value: c, label: m.clubs[c] ?? c }))} />
            </div>
          </div>

          {askUnit && (
            <div className="space-y-2">
              <div className="text-[13px] font-medium text-muted">{m.unitQ}</div>
              <Segmented<Unit> value={reading!.screen_distance_unit ?? "yd"} onChange={setUnit}
                options={[{ value: "yd", label: m.yards }, { value: "m", label: m.metres }]} />
            </div>
          )}

          {reading && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[15px] sm:grid-cols-3">
              {ROWS.filter((f) => reading.mean[f] != null || reading.unsure?.includes(f)).map((f) => (
                <div key={f}>
                  <dt className="text-[13px] text-muted">{l.t.radar.columns[f] ?? f}</dt>
                  <dd className="font-medium tabular-nums">
                    {reading.mean[f] == null
                      ? <span className="font-normal text-flag">{m.unread}</span>
                      : show(f, reading.mean[f]!)}
                    {reading.mean[f] != null && reading.sd?.[f] != null && (
                      <span className="ml-1 text-[13px] font-normal text-muted">
                        {m.spread(show(f, reading.sd[f]!).replace(/^[+-]/, ""))}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {reading?.notes?.filter((n) => !(n === "single_shot" && reading.notes?.includes("low_res"))).map((n) => m.notes[n] && (
            <p key={n} className="text-[14px] text-flag">{m.notes[n]}</p>
          ))}
          {club && club !== "7i" && (seven !== undefined
            ? <p className="text-[14px] text-ink/80">{m.otherIron(m.clubs[club] ?? club, l.f.speed(seven, 1))}</p>
            : <p className="text-[14px] text-flag">{m.notIron}</p>)}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" disabled={!lm} onClick={() => lm && onDone(lm)}>{m.use}</Button>
            <Button variant="secondary" className="flex-1" onClick={reset}>
              {way === "link" ? m.tryLink : way === "video" ? m.retryVideo : m.retry}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
