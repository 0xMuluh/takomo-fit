"use client";

import { useEffect, useRef, useState } from "react";
import { LANG_NAMES, LANGS, type Lang, type Units } from "@/i18n/config";
import { useI18n } from "@/i18n/context";
import { cx } from "./ui";

/** Drawn rather than emoji: Windows shows flag emoji as two letters. */
function Flag({ lang }: { lang: Lang }) {
  const box = "h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-black/10";
  switch (lang) {
    case "fi":
      return (
        <svg viewBox="0 0 18 11" className={box} preserveAspectRatio="none" aria-hidden>
          <rect width="18" height="11" fill="#fff" />
          <rect x="5" width="3" height="11" fill="#003580" />
          <rect y="4" width="18" height="3" fill="#003580" />
        </svg>
      );
    case "sv":
      return (
        <svg viewBox="0 0 16 10" className={box} preserveAspectRatio="none" aria-hidden>
          <rect width="16" height="10" fill="#006aa7" />
          <rect x="5" width="2" height="10" fill="#fecc00" />
          <rect y="4" width="16" height="2" fill="#fecc00" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 5 3" className={box} preserveAspectRatio="none" aria-hidden>
          <rect width="5" height="1" fill="#000" />
          <rect y="1" width="5" height="1" fill="#dd0000" />
          <rect y="2" width="5" height="1" fill="#ffce00" />
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 60 30" className={box} preserveAspectRatio="none" aria-hidden>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
          <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0V30M0 15H60" stroke="#c8102e" strokeWidth="6" />
        </svg>
      );
  }
}

/** Language and units, placed like the country selector in Takomo's store header. */
export function LocaleSwitch({ tone = "light", label = true }: { tone?: "light" | "dark"; label?: boolean }) {
  const { lang, units, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const unitLabel = (u: Units) => (u === "metric" ? t.switcher.metric : t.switcher.imperial);
  return (
    <div ref={root} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true"
              className={cx("flex min-h-8 items-center gap-1.5 text-[12px] font-semibold",
                            dark ? "text-white/80 hover:text-white" : "text-ink hover:text-ink/70")}>
        {label && <span className={cx("hidden sm:inline", dark ? "text-white/55" : "text-muted")}>{t.switcher.language}</span>}
        <Flag lang={lang} />
        <span>{LANG_NAMES[lang]}</span>
        <span className={dark ? "text-white/55" : "text-muted"}>({unitLabel(units)})</span>
        <span aria-hidden className="text-[9px]">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-md border border-line bg-white p-1.5 text-ink shadow-lg">
          <div className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{t.switcher.language}</div>
          {LANGS.map((x) => (
            <button key={x} type="button" onClick={() => { setLocale({ lang: x }); setOpen(false); }}
                    className={cx("flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[14px] hover:bg-paper",
                                  x === lang && "font-semibold")}>
              <Flag lang={x} />
              <span className="flex-1">{LANG_NAMES[x]}</span>
              {x === lang && <span aria-hidden>✓</span>}
            </button>
          ))}
          <div className="mt-1 border-t border-line px-2 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t.switcher.units}
          </div>
          <div className="grid grid-cols-2 gap-1 p-1">
            {(["imperial", "metric"] as Units[]).map((u) => (
              <button key={u} type="button" onClick={() => setLocale({ units: u })} aria-pressed={u === units}
                      className={cx("rounded-[4px] border px-2 py-1.5 text-[13px] tabular-nums",
                                    u === units ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/40")}>
                {unitLabel(u)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
