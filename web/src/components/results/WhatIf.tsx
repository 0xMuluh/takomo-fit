"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { api, type FitResponse, type Overrides, type WhatIfResponse } from "@/lib/api";
import { certaintySummary } from "@/lib/format";
import { Button, Card, Choice, ErrorNote, Spinner } from "../ui";

export function WhatIf({ fit }: { fit: FitResponse }) {
  const l = useI18n();
  const speed0 = Math.round(fit.estimates.speed?.mean ?? 75);
  const height0 = Math.round(fit.estimates.height?.mean ?? 175);
  const [speed, setSpeed] = useState(speed0);
  const [height, setHeight] = useState(height0);
  const [flight, setFlight] = useState<Overrides["flight"]>();
  const [tempo, setTempo] = useState<Overrides["tempo"]>();
  const [res, setRes] = useState<WhatIfResponse>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  const run = async () => {
    const ov: Overrides = {};
    if (speed !== speed0) ov.speed_mph = speed;
    if (height !== height0) ov.height_cm = height;
    if (flight) ov.flight = flight;
    if (tempo) ov.tempo = tempo;
    setBusy(true);
    setErr(undefined);
    try {
      setRes(await api.whatIf(fit.fit_id, ov, { lang: l.lang, units: l.units }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : l.t.whatIf.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{l.t.whatIf.title}</h2>
        <p className="text-[14px] text-muted">{l.t.whatIf.intro}</p>
      </div>
      <Slider label={l.t.whatIf.speed} fmt={(v) => l.f.speed(v)} now={l.t.whatIf.now} value={speed} min={50} max={110} onChange={setSpeed} base={speed0} />
      <Slider label={l.t.whatIf.height} fmt={(v) => l.f.height(v)} now={l.t.whatIf.now} value={height} min={145} max={210} onChange={setHeight} base={height0} />
      <div>
        <div className="mb-2 text-[13px] font-medium text-muted">{l.t.whatIf.flight}</div>
        <Choice columns={3} value={flight ?? undefined} onChange={(v) => setFlight(flight === v ? undefined : v)}
                options={(["low", "mid", "high"] as const).map((f) => ({ value: f, label: l.t.interview.flight[f] }))} />
      </div>
      <div>
        <div className="mb-2 text-[13px] font-medium text-muted">{l.t.whatIf.tempo}</div>
        <Choice columns={3} value={tempo ?? undefined} onChange={(v) => setTempo(tempo === v ? undefined : v)}
                options={(["smooth", "moderate", "quick"] as const).map((t) => ({ value: t, label: l.t.interview.tempo[t] }))} />
      </div>
      <Button variant="secondary" className="w-full" onClick={() => void run()} disabled={busy}>{l.t.whatIf.show}</Button>
      {busy && <Spinner label={l.t.whatIf.running} />}
      {err && <ErrorNote>{err}</ErrorNote>}
      {res && !busy && (
        <div className="rounded-xl bg-paper p-4 text-[14px]">
          {res.changes.length ? (
            <ul className="list-disc space-y-1 pl-5">{res.changes.map((c) => <li key={c}>{c}</li>)}</ul>
          ) : (
            <p>{l.t.whatIf.same}</p>
          )}
          <p className="mt-2 text-[13px] text-muted">{certaintySummary(res.after, l)}</p>
        </div>
      )}
    </Card>
  );
}

function Slider({ label, fmt, now, value, min, max, onChange, base }: {
  label: string; fmt: (v: number) => string; now: (v: string) => string; value: number; min: number; max: number; base: number; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-[13px]">
        <span className="font-medium text-muted">{label}</span>
        <span className="tabular-nums">
          {fmt(value)}{value !== base && <span className="text-muted"> {now(fmt(base))}</span>}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
             className="mt-2 w-full accent-ink" />
    </label>
  );
}
