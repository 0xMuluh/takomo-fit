"use client";

import type { ReactNode } from "react";
import type { L } from "@/i18n";
import { useI18n } from "@/i18n/context";
import type { Catalog, FitResponse, HeadInfo, ShaftInfo } from "@/lib/api";
import { headImage, headPage } from "@/lib/products";
import type { FitContext } from "@/lib/session";
import { Card, cx, ExternalIcon } from "../ui";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const FLEX = ["lady", "senior", "regular", "stiff", "x-stiff"];

function Dots({ n, l }: { n: number; l: L }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={l.t.compare.of5(n)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx("size-2 rounded-full", i <= n ? "bg-ink" : "bg-line")} />
      ))}
    </span>
  );
}

function Table({ head, rows }: { head: [string, string]; rows: [string, ReactNode, ReactNode][] }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[260px] text-[13px] sm:text-[14px]">
        <thead>
          <tr className="text-left text-[12px] text-muted">
            <th className="w-[34%] pb-2 pr-2 font-normal" />
            <th className="pb-2 pr-2 font-medium text-ink">{head[0]}</th>
            <th className="pb-2 font-normal">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b]) => (
            <tr key={label} className="border-t border-line">
              <td className="py-2 pr-2 text-muted">{label}</td>
              <td className="py-2 pr-2 font-medium sm:font-normal">{a}</td>
              <td className="py-2 text-ink/70">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const carry = (fit: FitResponse, slug: string) => fit.estimates[`carry_${slug}`];

function YourClub({ fit, ours, ctx, l }: { fit: FitResponse; ours: HeadInfo; ctx: FitContext; l: L }) {
  const yourLoft = ctx.q.own_7i_loft_deg ?? undefined;
  const yourCarry = ctx.q.carry_yd ?? undefined;
  const est = carry(fit, ours.slug);
  if (!est || (yourLoft === undefined && yourCarry === undefined)) return null;
  const dLoft = yourLoft !== undefined ? ours.seven_iron_loft_deg - yourLoft : undefined;
  const dCarry = yourCarry !== undefined ? est.mean - yourCarry : undefined;
  let why = "";
  if (dLoft !== undefined && dLoft >= 1.5) {
    why = l.t.compare.moreLoft(l.f.deg(dLoft, 1));
  } else if (dLoft !== undefined && dLoft <= -1.5) {
    why = l.t.compare.lessLoft(l.f.deg(Math.abs(dLoft), 1));
  } else if (dLoft !== undefined) {
    why = l.t.compare.sameLoft;
  } else if (dCarry !== undefined && dCarry <= -5) {
    why = l.t.compare.yoursLonger(l.f.deg(ours.seven_iron_loft_deg));
  }
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{l.t.compare.yourVs(ours.name)}</h3>
      <Table head={[ours.name, ctx.x.currentClub ?? l.t.compare.yourCurrent]} rows={[
        [l.t.compare.loft, l.f.deg(ours.seven_iron_loft_deg), yourLoft !== undefined ? l.f.deg(yourLoft, yourLoft % 1 ? 1 : 0) : l.t.compare.notKnown],
        [l.t.compare.carry, `${l.f.dist(est.mean)} ± ${l.f.num(l.f.distValue(est.sd), 0)}`, yourCarry !== undefined ? l.t.compare.estimate(l.f.dist(yourCarry)) : "—"],
      ]} />
      {why && <p className="text-[14px] text-ink/80">{why}</p>}
    </div>
  );
}

function Heads({ fit, a, b, l }: { fit: FitResponse; a: HeadInfo; b: HeadInfo; l: L }) {
  const ca = carry(fit, a.slug);
  const cb = carry(fit, b.slug);
  const p = fit.probabilities.head ?? {};
  const imgA = headImage(a.slug, 400);
  const imgB = headImage(b.slug, 400);
  const r = (k: keyof typeof l.t.compare.rating): [string, ReactNode, ReactNode] =>
    [l.t.compare.rating[k], <Dots key="a" n={a.ratings[k]} l={l} />, <Dots key="b" n={b.ratings[k]} l={l} />];
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{l.t.compare.topTwo}</h3>
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((h, i) => {
          const img = i === 0 ? imgA : imgB;
          return (
            <a key={h.slug} href={headPage(h.slug)} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 rounded-xl border border-line bg-paper/50 p-2.5 transition hover:border-ink/40">
              {img && <img src={img} alt={h.name} width={52} height={52} className="size-12 shrink-0 rounded-lg bg-white object-contain p-1" />}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-ink">{h.name}</div>
                <div className="text-[11px] text-muted">{l.f.pct(p[h.slug] ?? 0)} · takomogolf.com <ExternalIcon /></div>
              </div>
            </a>
          );
        })}
      </div>
      <Table head={[a.name, b.name]} rows={[
        r("forgiveness"), r("distance"), r("workability"), r("distance_control"),
        [l.t.compare.forgedFeel, a.ratings.feel ? <Dots key="a" n={a.ratings.feel} l={l} /> : l.t.compare.no, b.ratings.feel ? <Dots key="b" n={b.ratings.feel} l={l} /> : l.t.compare.no],
        [l.t.compare.loft, l.f.deg(a.seven_iron_loft_deg), l.f.deg(b.seven_iron_loft_deg)],
        [l.t.compare.offset, l.f.mm(a.seven_iron_offset_mm), l.f.mm(b.seven_iron_offset_mm)],
        [l.t.compare.builtFor, a.target_score_label, b.target_score_label],
        [l.t.compare.yourCarry, ca ? l.f.dist(ca.mean) : "—", cb ? l.f.dist(cb.mean) : "—"],
        [l.t.compare.rightForYou, l.f.pct(p[a.slug] ?? 0), l.f.pct(p[b.slug] ?? 0)],
      ]} />
      <p className="text-[13px] text-muted">
        {l.t.compare.rightNote}
      </p>
    </div>
  );
}

function Shafts({ a, b, l }: { a: ShaftInfo; b: ShaftInfo; l: L }) {
  const flexName = (f: string) => l.t.spec.flex[f] ?? cap(f);
  const matName = (m: string) => l.t.spec.material[m] ?? cap(m);
  const d = FLEX.indexOf(b.flex) - FLEX.indexOf(a.flex);
  const bLabel = `${b.model} ${flexName(b.flex)}`;
  const contrast = d > 0 ? l.t.compare.stiffer(bLabel)
    : d < 0 ? l.t.compare.softer(bLabel)
    : a.weight_g && b.weight_g && a.weight_g !== b.weight_g
      ? (b.weight_g > a.weight_g
          ? l.t.compare.heavier(b.model, l.f.grams(Math.abs(a.weight_g - b.weight_g)))
          : l.t.compare.lighter(b.model, l.f.grams(Math.abs(a.weight_g - b.weight_g))))
      : "";
  const aLaunch = a.flight_profile?.map((f) => l.t.compare.launchLevel[f] ?? f).join("/");
  const aTempo = a.tempo_profile?.filter((t) => t !== "any").map((t) => l.t.compare.tempoLevel[t] ?? t).join(" / ") || undefined;
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{l.t.compare.shaftsTitle}</h3>
      <Table head={[`${a.model} ${flexName(a.flex)}`, bLabel]} rows={[
        [l.t.compare.flex, flexName(a.flex), flexName(b.flex)],
        [l.t.compare.weight, a.weight_g ? l.f.grams(a.weight_g) : "—", b.weight_g ? l.f.grams(b.weight_g) : "—"],
        [l.t.compare.material, matName(a.material), matName(b.material)],
        [l.t.compare.launch, a.flight_profile?.map((f) => l.t.compare.launchLevel[f] ?? f).join(" / ") ?? "—", b.flight_profile?.map((f) => l.t.compare.launchLevel[f] ?? f).join(" / ") ?? "—"],
        [l.t.compare.suitsTempo, a.tempo_profile?.map((t) => l.t.compare.tempoLevel[t] ?? t).join(" / ") ?? l.t.compare.any, b.tempo_profile?.map((t) => l.t.compare.tempoLevel[t] ?? t).join(" / ") ?? l.t.compare.any],
      ]} />
      <p className="text-[14px] text-ink/80">
        {l.t.compare.shaftLine(a.model, aLaunch, aTempo)} {contrast}
      </p>
    </div>
  );
}

export function Compare({ fit, catalog, ctx }: { fit: FitResponse; catalog: Catalog; ctx?: FitContext }) {
  const l = useI18n();
  const head = (slug: string) => catalog.heads.find((h) => h.slug === slug);
  const shaft = (slug: string) => catalog.shafts.find((s) => s.slug === slug);
  const ours = head(fit.spec.head);
  const runner = head(fit.runner_up_head);
  const sComp = fit.components.find((c) => c.part === "shaft");
  const sa = shaft(fit.spec.shaft.slug);
  const sb = sComp?.alternative ? shaft(sComp.alternative) : undefined;
  if (!ours) return null;
  return (
    <Card className="space-y-6">
      <h2 className="text-lg font-semibold">{l.t.compare.title}</h2>
      {ctx && <YourClub fit={fit} ours={ours} ctx={ctx} l={l} />}
      {runner && runner.slug !== ours.slug && <Heads fit={fit} a={ours} b={runner} l={l} />}
      {sa && sb && <Shafts a={sa} b={sb} l={l} />}
    </Card>
  );
}
