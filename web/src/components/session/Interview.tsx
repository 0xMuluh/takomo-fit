"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { L } from "@/i18n";
import { useI18n } from "@/i18n/context";
import type { Characteristic, Questionnaire } from "@/lib/api";
import type { Draft, Extras, Miss } from "@/lib/session";
import { Button, cx, GolferStickman, NumberField, Segmented } from "../ui";

export type Ctx = { q: Draft; x: Extras };
export type LogEntry = { id: string; say: string; echo: string; before: Ctx };
type Patch = { q?: Partial<Draft>; x?: Partial<Extras> };
type Done = (p: Patch, echo: string) => void;
type Turn = { id: string; when?: (c: Ctx) => boolean; say: (c: Ctx, l: L) => string; reply: (c: Ctx, done: Done, l: L) => ReactNode };

const CHAR_ORDER: Characteristic[] = [
  "forgiveness", "distance", "forged feel", "distance control", "workability", "less offset", "more offset",
];
const MISS_ORDER: Miss[] = ["left", "right", "fat", "thin", "toe", "heel"];

function carryRanges(l: L): [string, number][] {
  if (l.units === "metric") {
    return [
      [l.t.interview.under("110\u00a0m"), 112],
      ["110–125\u00a0m", 128],
      ["125–140\u00a0m", 145],
      ["140–160\u00a0m", 165],
      [l.t.interview.over("160\u00a0m"), 182],
    ];
  }
  return [
    [l.t.interview.under("120\u00a0yd"), 112],
    ["120–135\u00a0yd", 128],
    ["135–155\u00a0yd", 145],
    ["155–175\u00a0yd", 165],
    [l.t.interview.over("175\u00a0yd"), 182],
  ];
}

function carryOutlier(q: Draft): "long" | "short" | undefined {
  const c = q.carry_yd;
  const b = q.score_bucket;
  if (!c || !b || q.speed_mph) return undefined;
  if ((b >= 4 && c >= 165) || (b === 5 && c >= 155)) return "long";
  if (b <= 2 && c < 125) return "short";
  return undefined;
}

function missComment(x: Extras, l: L): string {
  const m = new Set(x.misses);
  const out = [];
  if (m.has("left") || m.has("right")) out.push(l.t.interview.missComment.start);
  if (m.has("toe") || m.has("heel")) out.push(l.t.interview.missComment.toeHeel);
  if (!out.length && (m.has("fat") || m.has("thin"))) out.push(l.t.interview.missComment.fatThin);
  return out.join(" ");
}

const TURNS: Turn[] = [
  {
    id: "hand",
    say: (_, l) => l.t.interview.say.hand,
    reply: (_, done, l) => <Chips options={[
      { label: l.t.interview.rightHanded, pick: () => done({ q: { handedness: "right" } }, l.t.interview.rightHanded) },
      { label: l.t.interview.leftHanded, pick: () => done({ q: { handedness: "left" } }, l.t.interview.leftHanded) },
    ]} />,
  },
  {
    id: "score",
    say: (_, l) => l.t.interview.say.score,
    reply: (_, done, l) => <Chips options={l.t.interview.scores.map((s, i) => ({ label: s, pick: () => done({ q: { score_bucket: i + 1 } }, s) }))} />,
  },
  {
    id: "rounds",
    say: (_, l) => l.t.interview.say.rounds,
    reply: (_, done, l) => <Chips options={(["Under 10", "10-30", "31-50", "Over 50"] as const).map((r, i) => ({
      label: l.t.interview.rounds[i], pick: () => done({ q: { rounds_per_year: r } }, l.t.interview.rounds[i]),
    }))} />,
  },
  {
    id: "carry",
    say: (_, l) => l.t.interview.say.carry,
    reply: (_, done) => <CarryReply done={done} />,
  },
  {
    id: "speed",
    when: (c) => !!c.x.speedFirst && !c.q.speed_mph,
    say: (_, l) => l.t.interview.say.speed,
    reply: (_, done, l) => l.units === "metric" ? (
      <NumberReply unit="km/h" min={65} max={210} placeholder={l.t.common.eg("122")}
        onSend={(v) => {
          const mph = Math.round((v / 1.609344) * 10) / 10;
          done({ q: { speed_mph: mph } }, l.f.speed(mph));
        }} />
    ) : (
      <NumberReply unit="mph" min={40} max={130} placeholder={l.t.common.eg("76")}
        onSend={(v) => done({ q: { speed_mph: v } }, l.f.speed(v))} />
    ),
  },
  {
    id: "carryRange",
    when: (c) => !!c.x.carryUnsure && !c.q.carry_yd && !c.q.speed_mph,
    say: (_, l) => l.t.interview.say.carryRange,
    reply: (_, done, l) => <Chips options={carryRanges(l).map(([lbl, v]) => ({ label: lbl, pick: () => done({ q: { carry_yd: v } }, lbl) }))} />,
  },
  {
    id: "carryCheck",
    when: (c) => !!carryOutlier(c.q),
    say: (c, l) => l.t.interview.say.carryCheck(
      l.f.dist(c.q.carry_yd!),
      carryOutlier(c.q) === "long",
      l.t.interview.scores[c.q.score_bucket! - 1],
    ),
    reply: (c, done, l) => carryOutlier(c.q) === "long" ? (
      <Chips options={[
        { label: l.t.interview.isCarry, pick: () => done({}, l.t.interview.isCarryEcho) },
        { label: l.t.interview.includesRoll, pick: () => done({ q: { carry_yd: Math.round(c.q.carry_yd! * 0.93) } }, l.t.interview.includesRoll) },
        { label: l.t.common.notSure, pick: () => done({ x: { carryUnsure: true } }, l.t.common.notSure) },
      ]} />
    ) : (
      <Chips options={[
        { label: l.t.interview.thatsRight, pick: () => done({}, l.t.interview.thatsRight) },
        { label: l.t.common.notSure, pick: () => done({ x: { carryUnsure: true } }, l.t.common.notSure) },
      ]} />
    ),
  },
  {
    id: "club",
    say: (_, l) => l.t.interview.say.club,
    reply: (_, done) => <ClubReply done={done} />,
  },
  {
    id: "misses",
    say: (_, l) => l.t.interview.say.misses,
    reply: (_, done) => <MissReply done={done} />,
  },
  {
    id: "flight",
    say: (c, l) => `${missComment(c.x, l)} ${l.t.interview.say.flight}`.trim(),
    reply: (_, done, l) => <Chips options={(["low", "mid", "high"] as const).map((f) => ({
      label: l.t.interview.flight[f],
      hint: l.t.interview.flightHint[f],
      pick: () => done({ q: { flight: f } }, l.t.interview.flight[f]),
    }))} />,
  },
  {
    id: "tempo",
    say: (_, l) => l.t.interview.say.tempo,
    reply: (_, done, l) => <Chips options={[
      ...(["smooth", "moderate", "quick"] as const).map((t) => ({
        label: l.t.interview.tempo[t],
        hint: l.t.interview.tempoHint[t],
        pick: () => done({ q: { tempo: t } }, l.t.interview.tempo[t]),
      })),
      { label: l.t.common.notSure, pick: () => done({ q: { tempo: "moderate" }, x: { tempoUnsure: true } }, l.t.common.notSure) },
    ]} />,
  },
  {
    id: "priorities",
    say: (c, l) => l.t.interview.say.priorities(!!c.x.tempoUnsure),
    reply: (_, done) => <PriorityReply done={done} />,
  },
  {
    id: "body",
    say: (_, l) => l.t.interview.say.body,
    reply: (_, done) => <BodyReply done={done} />,
  },
  {
    id: "glove",
    say: (_, l) => l.t.interview.say.glove,
    reply: (_, done, l) => <Chips options={[
      ...(["XS", "S", "M", "M/L", "L", "XL"] as const).map((g) => ({ label: g, pick: () => done({ q: { glove: g } }, g) })),
      { label: l.t.common.notSure, pick: () => done({ x: { gloveUnsure: true } }, l.t.common.notSure) },
    ]} />,
  },
];

function nextTurn(from: number, c: Ctx): number {
  for (let i = from; i < TURNS.length; i++) if (!TURNS[i].when || TURNS[i].when!(c)) return i;
  return -1;
}

const apply = (c: Ctx, p: Patch): Ctx => ({ q: { ...c.q, ...p.q }, x: { ...c.x, ...p.x } });

export function Interview({ ctx, log, onAnswer, onBack, onComplete }: {
  ctx: Ctx;
  log: LogEntry[];
  onAnswer: (entry: LogEntry, next: Ctx) => void;
  onBack: () => void;
  onComplete: (c: Ctx) => void;
}) {
  const l = useI18n();
  const last = log[log.length - 1];
  const idx = nextTurn(last ? TURNS.findIndex((t) => t.id === last.id) + 1 : 0, ctx);
  const turn = idx >= 0 ? TURNS[idx] : undefined;
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  const done: Done = (p, echo) => {
    if (!turn) return;
    const next = apply(ctx, p);
    onAnswer({ id: turn.id, say: turn.say(ctx, l), echo, before: ctx }, next);
    if (nextTurn(idx + 1, next) < 0) onComplete(next);
  };

  return (
    <div className="space-y-3">
      {log.map((e, i) => (
        <div key={i} className="space-y-3">
          <FitterSays>{e.say}</FitterSays>
          <YouSay>{e.echo}</YouSay>
        </div>
      ))}
      {turn && (
        <>
          <FitterSays>{turn.say(ctx, l)}</FitterSays>
          <div className="pt-1">{turn.reply(ctx, done, l)}</div>
        </>
      )}
      {log.length > 0 && (
        <button type="button" onClick={onBack} className="text-[13px] text-muted underline-offset-4 hover:underline">
          {l.t.interview.changeLast}
        </button>
      )}
      <div ref={end} />
    </div>
  );
}

export function FitterSays({ children }: { children: ReactNode }) {
  const l = useI18n();
  return (
    <div className="flex items-end gap-2">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-ink" title={l.t.fitter.role}>
        <GolferStickman className="size-4.5" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm">{children}</div>
    </div>
  );
}

function YouSay({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] text-paper">{children}</div>
    </div>
  );
}

function Chips({ options }: { options: { label: string; hint?: string; pick: () => void }[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {options.map((o) => (
        <button key={o.label} type="button" onClick={o.pick}
                className="min-h-11 rounded-full border border-ink/20 bg-white px-4 py-2 text-left text-[15px] transition hover:border-ink active:bg-ink/5">
          {o.label}
          {o.hint && <span className="ml-1.5 text-[13px] text-muted">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function NumberReply({ unit, min, max, placeholder, onSend }: {
  unit: string; min: number; max: number; placeholder?: string; onSend: (v: number) => void;
}) {
  const l = useI18n();
  const [v, setV] = useState<number>();
  const ok = v !== undefined && v >= min && v <= max;
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (ok) onSend(v); }}>
      <div className="flex-1"><NumberField label="" ariaLabel={unit} unit={unit} value={v} onChange={setV} placeholder={placeholder} /></div>
      <Button type="submit" disabled={!ok}>{l.t.common.send}</Button>
    </form>
  );
}

function CarryReply({ done }: { done: Done }) {
  const l = useI18n();
  const [unit, setUnit] = useState<"yd" | "m">(l.units === "metric" ? "m" : "yd");
  const [v, setV] = useState<number>();
  useEffect(() => {
    if (v === undefined) setUnit(l.units === "metric" ? "m" : "yd");
  }, [l.units, v]);
  const yd = v === undefined ? undefined : unit === "yd" ? v : v * 1.09361;
  const ok = yd !== undefined && yd > 40 && yd < 250;
  const unitName = unit === "yd" ? l.t.interview.yards : l.t.interview.metres;
  return (
    <div className="space-y-2">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (ok) done({ q: { carry_yd: Math.round(yd) } }, l.t.interview.about(`${v} ${unitName}`)); }}>
        <div className="flex-1">
          <NumberField label="" ariaLabel={l.t.interview.carryIn(unitName)} unit={unit} value={v}
                       onChange={setV} placeholder={l.t.common.eg(unit === "yd" ? "145" : "133")} />
        </div>
        <Button type="submit" disabled={!ok}>{l.t.common.send}</Button>
      </form>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Segmented value={unit} onChange={setUnit} options={[{ value: "yd", label: l.t.interview.yards }, { value: "m", label: l.t.interview.metres }]} />
        <Chips options={[
          { label: l.t.interview.knowSpeed, pick: () => done({ x: { speedFirst: true } }, l.t.interview.knowSpeedEcho) },
          { label: l.t.common.notSure, pick: () => done({ x: { carryUnsure: true } }, l.t.common.notSure) },
        ]} />
      </div>
    </div>
  );
}

function ClubReply({ done }: { done: Done }) {
  const l = useI18n();
  const [model, setModel] = useState("");
  const [loft, setLoft] = useState<number>();
  const okLoft = loft === undefined || (loft >= 24 && loft <= 40);
  const send = () => {
    const name = model.trim();
    done({ q: { own_7i_loft_deg: loft }, x: { currentClub: name || undefined } },
         [name || l.t.interview.myClub, loft !== undefined ? l.f.deg(loft, loft % 1 ? 1 : 0) : l.t.interview.loftUnknown].join(", "));
  };
  return (
    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (okLoft) send(); }}>
      <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={l.t.interview.clubPlaceholder}
             className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[16px] outline-none focus:border-ink" />
      <div className="flex gap-2">
        <div className="flex-1">
          <NumberField label="" ariaLabel={l.t.interview.loftAria} unit={l.t.interview.loftUnit} step={0.5} value={loft} onChange={setLoft}
                       placeholder={l.t.interview.ifKnown} />
        </div>
        <Button type="submit" disabled={!okLoft}>{l.t.common.send}</Button>
      </div>
      <div className="flex justify-end">
        <Chips options={[{ label: l.t.common.skip, pick: () => done({}, l.t.interview.ratherNot) }]} />
      </div>
    </form>
  );
}

function MissReply({ done }: { done: Done }) {
  const l = useI18n();
  const [sel, setSel] = useState<Miss[]>([]);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        {MISS_ORDER.map((m) => (
          <button key={m} type="button" aria-pressed={sel.includes(m)}
                  onClick={() => setSel(sel.includes(m) ? sel.filter((s) => s !== m) : [...sel, m])}
                  className={cx("rounded-full border px-4 py-2 text-[15px]",
                                sel.includes(m) ? "border-ink bg-ink text-paper" : "border-ink/20 bg-white hover:border-ink")}>
            {l.t.interview.misses[m]}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => done({ x: { misses: [] } }, l.t.interview.noPattern)}>{l.t.interview.noPattern}</Button>
        <Button disabled={!sel.length} onClick={() => done({ x: { misses: sel } }, sel.map((m) => l.t.interview.misses[m]).join(", "))}>
          {l.t.common.done}
        </Button>
      </div>
    </div>
  );
}

function PriorityReply({ done }: { done: Done }) {
  const l = useI18n();
  const [sel, setSel] = useState<Characteristic[]>([]);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        {CHAR_ORDER.map((v) => {
          const on = sel.includes(v);
          return (
            <button key={v} type="button" aria-pressed={on} disabled={!on && sel.length >= 3}
                    onClick={() => setSel(on ? sel.filter((s) => s !== v) : [...sel, v])}
                    className={cx("flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] disabled:opacity-40",
                                  on ? "border-ink bg-ink text-paper" : "border-ink/20 bg-white hover:border-ink")}>
              {on && <span className="grid size-5 place-items-center rounded-full bg-paper text-[11px] text-ink">{sel.indexOf(v) + 1}</span>}
              {l.t.interview.chars[v]}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => done({ q: { characteristics: [] } }, l.t.interview.noStrongPreference)}>{l.t.interview.noPreference}</Button>
        <Button disabled={!sel.length}
                onClick={() => done({ q: { characteristics: sel } }, sel.map((s) => l.t.interview.chars[s]).join(", "))}>
          {l.t.common.done}
        </Button>
      </div>
    </div>
  );
}

function BodyReply({ done }: { done: Done }) {
  const l = useI18n();
  const [sex, setSex] = useState<Questionnaire["sex"]>();
  const [age, setAge] = useState<number>();
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [cm, setCm] = useState<number>();
  const [ft, setFt] = useState<number>();
  const [inch, setInch] = useState<number>();
  const height = unit === "cm" ? cm : ft !== undefined ? (ft * 12 + (inch ?? 0)) * 2.54 : undefined;
  const ok = !!sex && age !== undefined && age >= 8 && age <= 100 && height !== undefined && height > 120 && height < 225;
  const send = () => done({ q: { sex, age: Math.round(age!), height_cm: Math.round(height! * 10) / 10 } },
    `${sex === "male" ? l.t.interview.male : l.t.interview.female}, ${Math.round(age!)}, ${unit === "cm" ? `${cm}\u00a0cm` : `${ft}′${inch ?? 0}″`}`);
  return (
    <form className="space-y-3 rounded-2xl border border-line bg-white p-4" onSubmit={(e) => { e.preventDefault(); if (ok) send(); }}>
      <div className="grid grid-cols-2 gap-2">
        {(["male", "female"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={sex === s} onClick={() => setSex(s)}
                  className={cx("rounded-xl border px-4 py-2.5 text-[15px]", sex === s ? "border-ink bg-ink text-paper" : "border-line")}>
            {s === "male" ? l.t.interview.male : l.t.interview.female}
          </button>
        ))}
      </div>
      <NumberField label={l.t.interview.age} unit={l.t.interview.years} value={age} onChange={setAge} />
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted">{l.t.interview.height}</span>
          <Segmented value={unit} onChange={setUnit} options={[{ value: "cm", label: "cm" }, { value: "ft", label: "ft / in" }]} />
        </div>
        {unit === "cm" ? (
          <NumberField label="" ariaLabel={l.t.interview.heightCm} unit="cm" value={cm} onChange={setCm} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="" ariaLabel={l.t.interview.heightFt} unit="ft" value={ft} onChange={setFt} />
            <NumberField label="" ariaLabel={l.t.interview.heightIn} unit="in" value={inch} onChange={setInch} />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={!ok}>{l.t.common.continue}</Button>
    </form>
  );
}
