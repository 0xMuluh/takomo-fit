import type { Lang, Locale, Units } from "./config";
import { formatter, type Fmt } from "./format";
import de from "./messages/de";
import en, { type Messages } from "./messages/en";
import fi from "./messages/fi";
import sv from "./messages/sv";

export type { Lang, Locale, Messages, Units };
export const MESSAGES: Record<Lang, Messages> = { en, fi, sv, de };

/** Everything needed to put a sentence on screen: the locale, its words, and its number formats. */
export type L = Locale & {
  t: Messages;
  f: Fmt;
  /** Lower-cases a label for use mid-sentence; German nouns keep their capital. */
  lower: (s: string) => string;
};

export const makeL = (loc: Locale): L => ({
  ...loc,
  t: MESSAGES[loc.lang],
  f: formatter(loc),
  lower: (s) => (loc.lang === "de" ? s : s.toLowerCase()),
});

/** The voice agent's instructions stay in English; the numbers in them use the golfer's units. */
export const agentL = (units: Units): L => makeL({ lang: "en", units });

/** A message resolved at render time, so it follows a language switch. */
export type Msg = (l: L) => string;
