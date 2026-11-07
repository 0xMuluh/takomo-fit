"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/context";
import { LocaleSwitch } from "./LocaleSwitch";
import { TakomoLogo } from "./TakomoLogo";
import { BackButton, cx, ExternalIcon, GolferStickman } from "./ui";

const STORE = "https://takomogolf.com/";
const FAQ = "https://takomogolf.com/pages/customer-help";

/**
 * Pinned to the top. On wide screens two rows like takomogolf.com: a thin bar with help (and language on the landing
 * page), then the main bar with the back arrow at the far left before the logo. On phones one row with the logo in
 * the middle. `actions` adds screen-specific buttons to the main bar.
 */
export function SiteHeader({ tone = "light", actions, back, locale = false }: {
  tone?: "light" | "dark"; actions?: ReactNode; back?: string | (() => void); locale?: boolean;
}) {
  const { t } = useI18n();
  const dark = tone === "dark";
  const row = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-10";
  return (
    <header className={cx("sticky top-0 z-40 pt-[env(safe-area-inset-top)]", dark ? "bg-ink text-paper" : "bg-white text-ink")}>
      <div className={cx("hidden border-b sm:block", dark ? "border-white/10" : "border-line")}>
        <div className={cx(row, "flex min-h-9 items-center justify-between")}>
          {locale ? <LocaleSwitch tone={tone} align="left" /> : <span />}
          <a href={FAQ} target="_blank" rel="noopener noreferrer"
             className={cx("text-[12px] font-semibold", dark ? "text-white/70 hover:text-white" : "text-ink/80 hover:text-ink")}>
            {t.header.faq}
          </a>
        </div>
      </div>
      <div className={cx("border-b", dark ? "border-white/10" : "border-line")}>
        <div className={cx(row, "grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:flex sm:min-h-18 sm:gap-6")}>
          <div className={cx("flex items-center", !back && "sm:hidden")}>
            {back && (
              <BackButton label={t.common.back} className="-ml-2"
                          {...(typeof back === "string" ? { href: back } : { onClick: back })} />
            )}
          </div>
          <TakomoLogo tone={tone} href="/" />
          <nav className="flex items-center justify-end gap-3 sm:ml-auto sm:gap-6">
            {locale && <span className="sm:hidden"><LocaleSwitch tone={tone} /></span>}
            {actions}
            <Link href="/fit" aria-label={t.header.findFit} title={t.header.findFit}
                  className="grid size-9 place-items-center rounded-full bg-accent text-ink transition hover:bg-accent-strong">
              <GolferStickman className="size-5" />
            </Link>
            <a href={STORE} target="_blank" rel="noopener noreferrer"
               className={cx("hidden font-display text-[15px] font-bold uppercase tracking-wide md:block",
                             dark ? "text-white/70 hover:text-white" : "text-ink/70 hover:text-ink")}>
              {t.header.store}
              <ExternalIcon className="ml-1 align-baseline" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
