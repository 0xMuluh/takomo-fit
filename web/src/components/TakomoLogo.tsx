"use client";

import Link from "next/link";
import { cx } from "./ui";

export function TakomoLogo({
  tone = "light",
  href = "/",
  subtitle = "FIT",
  className,
}: {
  tone?: "light" | "dark";
  href?: string;
  subtitle?: string | false;
  className?: string;
}) {
  const content = (
    <span className={cx("inline-flex items-center gap-1.5", className)}>
      <img
        src="/takomo-logo-dark.png"
        alt="Takomo Golf"
        width={137}
        height={20}
        className={cx("h-[17px] w-auto shrink-0 select-none sm:h-[20px]", tone === "dark" && "brightness-0 invert")}
      />
      {subtitle && (
        <>
          <span aria-hidden className={cx("h-3.5 w-[1.5px] shrink-0", tone === "dark" ? "bg-white/25" : "bg-ink/25")} />
          <span className="truncate font-display text-[16px] font-bold uppercase leading-none tracking-[0.08em] text-accent sm:text-[18px]">
            {subtitle}
          </span>
        </>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Takomo Golf" className="inline-flex min-h-9 items-center rounded-lg focus-visible:outline-offset-4">
      {content}
    </Link>
  );
}
