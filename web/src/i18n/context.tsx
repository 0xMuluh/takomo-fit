"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { COOKIE, encodeLocale, type Locale } from "./config";
import { makeL, type L } from ".";

type I18n = L & { setLocale: (p: Partial<Locale>) => void };

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ initial, children }: { initial: Locale; children: ReactNode }) {
  const [loc, setLoc] = useState(initial);
  const setLocale = useCallback((p: Partial<Locale>) => {
    const next = { ...loc, ...p };
    document.cookie = `${COOKIE}=${encodeLocale(next)}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next.lang;
    setLoc(next);
  }, [loc]);
  const value = useMemo(() => ({ ...makeL(loc), setLocale }), [loc, setLocale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
