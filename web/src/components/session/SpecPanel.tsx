"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import type { Component, FitResponse } from "@/lib/api";
import { certainty, certaintyLabel, partValue } from "@/lib/format";
import { headImage } from "@/lib/products";
import { cx } from "../ui";

const PARTS: Component["part"][] = ["head", "shaft", "length", "lie", "grip"];

const TONE = {
  good: "text-[#9fd3b0]",
  neutral: "text-paper/70",
  close: "text-[#f2b33d]",
};

export function SpecPanel({ fit, changed, busy }: { fit: FitResponse; changed: Set<string>; busy: boolean }) {
  const l = useI18n();
  const [open, setOpen] = useState(true);
  const comps = PARTS.map((p) => fit.components.find((c) => c.part === p)!).filter(Boolean);
  const close = comps.filter((c) => certainty(c).tone === "close").length;
  const img = headImage(fit.spec.head, 240);
  return (
    <div className="sticky top-0 z-10 -mx-4 bg-paper/95 px-4 pb-3 pt-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="rounded-2xl bg-ink text-paper">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-4 pt-3 text-left">
          <span className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-paper/60">
            {img && <img src={img} alt="" width={24} height={24} className="size-6 rounded-md bg-white object-contain p-0.5" />}
            <span>{l.t.session.soFar} {busy && <span className="ml-1 normal-case tracking-normal">{l.t.session.updatingShort}</span>}</span>
          </span>
          <span className="text-[12px] text-paper/60">
            {close ? l.t.session.closeCalls(close) : l.t.session.allSettled} {open ? "▴" : "▾"}
          </span>
        </button>
        {open ? (
          <div className="grid grid-cols-1 gap-y-1.5 px-4 pb-3 pt-2">
            {comps.map((c) => {
              const ce = certainty(c);
              return (
                <div key={c.part}
                     className={cx("flex items-baseline gap-3 rounded-lg px-1 transition-colors duration-700",
                                   changed.has(c.part) && "bg-paper/15")}>
                  <span className="w-16 shrink-0 text-[12px] text-paper/60">{l.t.part[c.part]}</span>
                  <span className="flex-1 truncate text-[15px] font-medium">{partValue(c.part, c.value, fit, l)}</span>
                  <span className={cx("text-[12px]", TONE[ce.tone])}>{certaintyLabel(c, l)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="truncate px-4 pb-3 pt-1 text-[14px]">
            {comps.map((c) => partValue(c.part, c.value, fit, l)).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
