"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/context";
import { LocaleSwitch } from "./LocaleSwitch";
import { TakomoLogo } from "./TakomoLogo";
import { cx, ExternalIcon } from "./ui";

const STORE = "https://takomogolf.com/";
const FAQ = "https://takomogolf.com/pages/customer-help";

/**
 * Two rows like takomogolf.com: a thin bar with the language selector on the left and help on the right, then
 * the logo with this app as the current section. `actions` adds screen-specific buttons to the main bar.
 */
export function SiteHeader({ tone = "light", actions }: { tone?: "light" | "dark"; actions?: ReactNode }) {
  const { t } = useI18n();
  const dark = tone === "dark";
  const row = "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10";
  return (
    <header className={cx(dark ? "bg-ink text-paper" : "bg-white text-ink")}>
      <div className={cx("border-b", dark ? "border-white/10" : "border-line")}>
        <div className={cx(row, "min-h-9 pt-[env(safe-area-inset-top)]")}>
          <LocaleSwitch tone={tone} />
          <a href={FAQ} target="_blank" rel="noopener noreferrer"
             className={cx("hidden text-[12px] font-semibold sm:block", dark ? "text-white/70 hover:text-white" : "text-ink/80 hover:text-ink")}>
            {t.header.faq}
          </a>
        </div>
      </div>
      <div className={cx("border-b", dark ? "border-white/10" : "border-line")}>
        <div className={cx(row, "min-h-14 sm:min-h-16")}>
          <TakomoLogo tone={tone} href="/" />
          <nav className="flex items-center gap-4 sm:gap-6">
            {actions}
            <Link href="/" aria-current="page"
                  className="border-b-2 border-accent py-1 font-display text-[14px] font-bold uppercase tracking-wide sm:text-[15px]">
              {t.header.findFit}
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
