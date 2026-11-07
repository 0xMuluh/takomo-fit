import { cookies, headers } from "next/headers";
import { MESSAGES } from ".";
import { COOKIE, resolveLocale, type Locale } from "./config";

export async function requestLocale(): Promise<Locale> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return resolveLocale(c.get(COOKIE)?.value, h.get("accept-language") ?? undefined);
}

export async function pageTitle(page: keyof (typeof MESSAGES)["en"]["meta"]["pages"]) {
  const { meta } = MESSAGES[(await requestLocale()).lang];
  return { title: `${meta.pages[page]} · ${meta.title}` };
}
