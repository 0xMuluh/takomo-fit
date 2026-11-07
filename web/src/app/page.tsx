"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge, cx } from "@/components/ui";
import { useI18n } from "@/i18n/context";
import { partValue } from "@/lib/format";
import { headImage } from "@/lib/products";

export default function Home() {
  const l = useI18n();
  const h = l.t.home;
  return (
    <div className="flex min-h-dvh flex-col">
    <SiteHeader />
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),2.25rem)] pt-2 sm:px-6 sm:pt-4 lg:max-w-6xl lg:px-10">
      <div className="lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <h1 className="mt-6 text-[40px] italic leading-[0.98] sm:mt-8 sm:text-[52px] lg:mt-0 lg:text-[72px]">{h.title}</h1>
          <p className="mt-3.5 text-[16px] leading-relaxed text-ink/75 sm:text-[17px] lg:mt-5 lg:max-w-lg lg:text-[19px]">{h.intro}</p>
          <Actions className="mt-8 hidden lg:block" />
        </div>
        <Preview />
      </div>

      <ol className="mt-7 space-y-3 sm:mt-9 sm:space-y-3.5 lg:mt-16 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-y-0">
        {h.steps.map(([t, d], i) => (
          <li key={t} className="flex gap-3.5 rounded-2xl border border-line/80 bg-white/75 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] lg:flex-col lg:gap-3 lg:p-5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-paper">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold leading-snug text-ink sm:text-[16px]">{t}</div>
              <div className="mt-0.5 text-[14px] leading-snug text-muted">{d}</div>
            </div>
          </li>
        ))}
      </ol>

      <Actions className="mt-auto pt-8 lg:hidden" />
    </main>
    </div>
  );
}

function Actions({ className }: { className?: string }) {
  const l = useI18n();
  const h = l.t.home;
  return (
    <div className={cx("space-y-2.5 lg:max-w-md", className)}>
      <Link href="/fit"
            className="flex min-h-13 w-full items-center justify-center rounded-[4px] bg-accent px-6 font-display text-[18px] font-bold uppercase tracking-wide text-ink transition hover:bg-accent-strong active:scale-[0.99]">
        {h.start}
      </Link>
      <Link href="/fit/guided?new=1"
            className="flex min-h-12 w-full items-center justify-center rounded-[4px] border border-ink bg-white px-6 font-display text-[16px] font-bold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper">
        {h.guided}
      </Link>
      <p className="pt-1 text-center text-[13px] font-medium text-ink/70 lg:text-left">{h.needs}</p>
      <p className="text-center text-[12px] leading-relaxed text-muted lg:text-left">{h.privacy} {l.t.fitter.aiNotice}</p>
    </div>
  );
}

/** What a finished fitting looks like, shown beside the headline on wide screens. */
function Preview() {
  const l = useI18n();
  const { t } = l;
  const rows: [string, string, "good" | "neutral" | "close", string][] = [
    [t.part.shaft, `KBS Tour Lite ${t.spec.flex.regular}`, "good", t.certainty.confirmed],
    [t.part.length, partValue("length", "0.5", undefined, l), "good", t.certainty.confirmed],
    [t.part.lie, partValue("lie", "1", undefined, l), "neutral", t.certainty.likely],
    [t.part.grip, partValue("grip", "midsize", undefined, l), "good", t.certainty.confirmed],
  ];
  return (
    <div className="relative hidden lg:block">
      <div className="rounded-[2rem] border border-line bg-white p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={headImage("101-mkii")} alt="Takomo Iron 101 MKII" width={640} height={640}
             className="mx-auto h-[360px] w-auto object-contain" />
      </div>
      <div className="absolute -bottom-8 -left-8 w-80 rounded-2xl bg-ink p-5 text-paper shadow-xl">
        <div className="text-[11px] font-medium uppercase tracking-wider text-paper/55">{t.home.example}</div>
        <div className="mt-1 text-[18px] font-semibold">Iron 101 MKII</div>
        <div className="mt-3 space-y-2">
          {rows.map(([k, v, tone, label]) => (
            <div key={k} className="flex items-center gap-3 text-[13px]">
              <span className="w-16 shrink-0 text-paper/55">{k}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{v}</span>
              <Badge tone={tone}>{label}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
