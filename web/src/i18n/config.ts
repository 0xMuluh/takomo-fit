export const LANGS = ["en", "fi", "sv", "de"] as const;
export type Lang = (typeof LANGS)[number];
export type Units = "imperial" | "metric";
export type Locale = { lang: Lang; units: Units };

export const FITTER_NAME = "Ilmari";
export const LANG_NAMES: Record<Lang, string> = { en: "English", fi: "Suomi", sv: "Svenska", de: "Deutsch" };
export const COOKIE = "pf_locale";
export const DEFAULT_LOCALE: Locale = { lang: "en", units: "imperial" };

/** Golf in these markets is played in yards; everywhere else in metres. */
const YARD_REGIONS = new Set(["US", "GB", "CA"]);

const isLang = (x: string): x is Lang => (LANGS as readonly string[]).includes(x);
const isUnits = (x: string): x is Units => x === "imperial" || x === "metric";

export const defaultUnits = (lang: Lang, region?: string): Units =>
  lang === "en" && (!region || YARD_REGIONS.has(region.toUpperCase())) ? "imperial" : "metric";

export const encodeLocale = (l: Locale) => `${l.lang}.${l.units}`;

/**
 * The saved choice wins; otherwise the browser's first supported language. Units follow the first region the
 * browser names, so a Norwegian browser falling back to English still gets metres.
 */
export function resolveLocale(cookie?: string, acceptLanguage?: string): Locale {
  const [lang, units] = (cookie ?? "").split(".");
  if (isLang(lang)) return { lang, units: isUnits(units) ? units : defaultUnits(lang) };
  let firstRegion: string | undefined;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const [base, region] = part.split(";")[0].trim().split("-");
    firstRegion ??= region;
    const l = base?.toLowerCase();
    if (l && isLang(l)) return { lang: l, units: defaultUnits(l, region ?? firstRegion) };
  }
  return { lang: "en", units: defaultUnits("en", firstRegion) };
}
