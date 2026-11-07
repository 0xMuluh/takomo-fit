"use client";

import { useEffect, useState } from "react";
import type { L } from "@/i18n";
import { useI18n } from "@/i18n/context";
import type { Component, FitResponse } from "@/lib/api";
import { partValue } from "@/lib/format";
import type { FitContext } from "@/lib/session";
import { Card } from "../ui";
import { FitterSays } from "../session/Interview";
import { VoiceFitter } from "./VoiceFitter";

type QA = { q: string; a: string };

function explain(c: Component, fit: FitResponse, l: L): string {
  const alt = c.alternative && c.alternative_probability != null
    ? ` ${l.t.ask.alternative(partValue(c.part, c.alternative, fit, l), l.f.pct(c.alternative_probability))}` : "";
  return [c.summary, ...c.reasons, c.effect ?? ""].filter(Boolean).join(" ") + ` ${l.t.ask.sure(l.f.pct(c.confidence))}` + alt;
}

function lieAndMisses(fit: FitResponse, l: L, ctx?: FitContext): string {
  const m = new Set(ctx?.x.misses ?? []);
  if (!m.has("left") && !m.has("right")) return "";
  const lefty = fit.spec.handedness === "left";
  const upright: "left" | "right" = lefty ? "right" : "left";
  const flat: "left" | "right" = lefty ? "left" : "right";
  const dir = m.has("left") && m.has("right") ? "both" : m.has("left") ? "left" : "right";
  return ` ${l.t.ask.missesLie(dir, upright, flat)}`;
}

export function AskFitter({ fit, ctx }: { fit: FitResponse; ctx?: FitContext }) {
  const l = useI18n();
  const [log, setLog] = useState<QA[]>([]);
  useEffect(() => {
    setLog([]);
  }, [l.lang, l.units]);
  const comp = (p: Component["part"]) => fit.components.find((c) => c.part === p)!;
  const next = fit.next_tests[0];
  const questions: QA[] = [
    { q: l.t.ask.whyHead(fit.spec.head_name), a: explain(comp("head"), fit, l) },
    { q: l.t.ask.whyShaft, a: explain(comp("shaft"), fit, l) },
    { q: l.t.ask.whyLie(partValue("lie", String(fit.spec.lie_deg), fit, l)), a: explain(comp("lie"), fit, l) + lieAndMisses(fit, l, ctx) },
    { q: l.t.ask.whyLength(partValue("length", String(fit.spec.length_in), fit, l)), a: explain(comp("length"), fit, l) },
    { q: l.t.ask.grip, a: explain(comp("grip"), fit, l) },
    { q: l.t.ask.stockCustom, a: `${fit.stock_advice.message} ${comp("purchase").reasons.join(" ")}` },
    {
      q: l.t.ask.next,
      a: next
        ? `${l.t.ask.nextTest(l.t.testTitle[next.test] ?? next.test, next.how)} `
          + Object.entries(next.improves).map(([p, [a, b]]) => l.t.ask.improve(l.t.spec.improves[p] ?? p, l.f.pct(a), l.f.pct(b))).join(" ")
        : l.t.ask.nothingElse,
    },
  ];
  const asked = new Set(log.map((x) => x.q));
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{l.t.ask.title}</h2>
        <p className="text-[14px] text-muted">{l.t.ask.intro}</p>
      </div>
      {log.map((x) => (
        <div key={x.q} className="space-y-2">
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2 text-[15px] text-paper">{x.q}</div>
          </div>
          <FitterSays>{x.a}</FitterSays>
        </div>
      ))}
      <div className="grid gap-2 sm:grid-cols-2">
        {questions.filter((x) => !asked.has(x.q)).map((x) => (
          <button key={x.q} type="button" onClick={() => setLog([...log, x])}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-left text-[14px] font-medium transition hover:border-accent/60 hover:ring-3 hover:ring-accent/12 active:bg-paper">
            <span className="min-w-0 flex-1">{x.q}</span>
            <span aria-hidden className="text-accent">›</span>
          </button>
        ))}
      </div>
      <div className="border-t border-line pt-4">
        <div className="mb-3 text-[13px] font-medium text-muted">{l.t.ask.rather}</div>
        <VoiceFitter fit={fit} ctx={ctx} />
      </div>
    </Card>
  );
}
