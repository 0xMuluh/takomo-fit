"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      {...p}
      className={cx(
        "inline-flex min-h-12 items-center justify-center gap-2 px-6 transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant !== "ghost" && "rounded-[4px] font-display text-[16px] font-bold uppercase tracking-wide",
        variant === "primary" && "bg-accent text-ink hover:bg-accent-strong",
        variant === "secondary" && "border border-ink bg-white text-ink hover:bg-ink hover:text-paper",
        variant === "ghost" && "rounded-full text-[15px] font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline",
        className,
      )}
    />
  );
}

/** Drawn because "↗" falls back to an emoji glyph in Barlow. */
export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={cx("inline size-2.5 shrink-0", className)} aria-hidden>
      <path d="M3 1h6v6M9 1L1 9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Stickman golfer with a 7-iron — Ilmari's avatar in chat and voice views. */
export function GolferStickman({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("size-4 shrink-0", className)} fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9.5" cy="4.2" r="2" />
      <path d="M9.5 6.3 L8.2 13 L6.2 20 M8.2 13 L11 20" />
      <path d="M9.2 8.2 L13.5 11.8 L18.5 19.5 L20.4 18.8" />
    </svg>
  );
}

/** Circular animated stickman loader shown while connecting to Ilmari or waiting for his first line. */
export function StickmanLoader({ label, size = "md" }: { label?: string; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div className={cx("relative grid place-items-center", sm ? "size-11" : "size-16")}>
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <span className={cx("absolute inset-0 animate-spin rounded-full border-white/15 border-t-accent",
                            sm ? "border-2" : "border-[2.5px]")} />
        <div className={cx("relative grid place-items-center rounded-full bg-accent/15 text-accent",
                           sm ? "size-8" : "size-12")}>
          <GolferStickman className={sm ? "size-4" : "size-6"} />
        </div>
      </div>
      {label && <div className="text-center text-[14px] font-medium text-white/75">{label}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-line bg-white p-4 sm:p-5", className)}>{children}</div>;
}

export function Choice<T extends string | number>({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: T; label: string; hint?: string; tip?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={cx("grid gap-2", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-3")} role="radiogroup">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          title={o.tip}
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "min-h-11 rounded-xl border px-3 py-2.5 text-left transition sm:px-4 sm:py-3",
            value === o.value ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink/40",
          )}
        >
          <div className="text-[14px] font-medium leading-tight sm:text-[15px]">{o.label}</div>
          {o.hint && <div className={cx("mt-0.5 text-[12px] sm:text-[13px]", value === o.value ? "text-paper/70" : "text-muted")}>{o.hint}</div>}
        </button>
      ))}
    </div>
  );
}

export function MultiChoice<T extends string>({
  options,
  value,
  onChange,
  max,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  max: number;
}) {
  const toggle = (v: T) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : value.length < max ? [...value, v] : value);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        const order = value.indexOf(o.value) + 1;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            disabled={!on && value.length >= max}
            className={cx(
              "flex items-center gap-2 rounded-full border px-4 py-2.5 text-[15px] transition disabled:opacity-40",
              on ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink/40",
            )}
          >
            {on && <span className="grid size-5 place-items-center rounded-full bg-paper text-[11px] text-ink">{order}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  placeholder,
  ariaLabel,
}: {
  label: string;
  ariaLabel?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[13px] font-medium text-muted">{label}</span>}
      <div className="flex items-center rounded-xl border border-line bg-white focus-within:border-ink">
        <input
          aria-label={label ? undefined : ariaLabel}
          inputMode="decimal"
          type="number"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className="w-full rounded-xl bg-transparent px-4 py-3 text-[17px] outline-none"
        />
        <span className="pr-4 text-[15px] text-muted">{unit}</span>
      </div>
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx("rounded-full px-3 py-1 text-[13px]", value === o.value ? "bg-ink text-paper" : "text-muted")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Meter({ value, tone }: { value: number; tone?: "good" | "close" }) {
  const t = tone ?? (value >= 0.65 ? "good" : "close");
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
      <div
        className={cx("h-full rounded-full", t === "good" ? "bg-fairway" : "bg-flag")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

export function Pct({ value }: { value: number }) {
  return <span className="tabular-nums">{Math.round(value * 100)}%</span>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "close" | "good" }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium",
        tone === "neutral" && "bg-line text-ink",
        tone === "close" && "bg-flag-soft text-flag",
        tone === "good" && "bg-fairway-soft text-fairway",
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[15px] text-muted" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-ink" />
      {label}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-flag-soft px-4 py-3 text-[14px] text-flag" role="alert">{children}</div>;
}
