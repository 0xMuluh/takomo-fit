"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import type { LaunchMonitor } from "@/lib/api";
import { parseLaunchMonitorCsv, type ParsedSession } from "@/lib/launchMonitorCsv";
import { Button, Choice, ErrorNote } from "../ui";

export function LaunchMonitorUpload({ onDone }: { onDone: (lm: LaunchMonitor) => void }) {
  const l = useI18n();
  const [kind, setKind] = useState<LaunchMonitor["kind"]>("home_radar");
  const [parsed, setParsed] = useState<ParsedSession>();
  const [err, setErr] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  const read = async (f: File) => {
    setErr(undefined);
    setParsed(undefined);
    try {
      setParsed(parseLaunchMonitorCsv(await f.text(), kind, l.t.radar));
    } catch (e) {
      setErr(e instanceof Error ? e.message : l.t.radar.readFailed);
    }
  };

  const speeds = parsed?.session.own_7i?.map((s) => s.club_speed_mph).filter((x): x is number => x != null) ?? [];
  const avg = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;

  return (
    <div className="space-y-4">
      <p className="text-[15px] text-ink/80">
        {l.t.radar.intro}
      </p>
      <Choice<LaunchMonitor["kind"]> columns={2} value={kind} onChange={(k) => { setKind(k); setParsed(undefined); }}
        options={[
          { value: "home_radar", label: l.t.radar.home, hint: l.t.radar.homeHint },
          { value: "trackman", label: l.t.radar.studio, hint: l.t.radar.studioHint },
        ]} />
      <input ref={input} type="file" accept=".csv,text/csv" hidden
             onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void read(f); }} />
      <Button variant="secondary" className="w-full" onClick={() => input.current?.click()}>{l.t.radar.choose}</Button>
      {err && <ErrorNote>{err}</ErrorNote>}
      {parsed && (
        <div className="space-y-3 rounded-xl bg-white p-4">
          <div className="text-[15px]">
            {l.t.radar.found(parsed.shotsFound, parsed.clubFiltered, avg !== undefined ? l.f.speed(avg, 1) : undefined)}
          </div>
          <div className="text-[13px] text-muted">{l.t.radar.using(parsed.columns.map((c) => l.t.radar.columns[c] ?? c).join(", "))}</div>
          {!parsed.clubFiltered && (
            <div className="text-[13px] text-flag">{l.t.radar.noClub}</div>
          )}
          <Button className="w-full" onClick={() => onDone(parsed.session)}>{l.t.radar.useSession}</Button>
        </div>
      )}
    </div>
  );
}
