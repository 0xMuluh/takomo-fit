import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { MESSAGES } from "@/i18n";
import { I18nProvider } from "@/i18n/context";
import { requestLocale } from "@/i18n/server";
import "./globals.css";

const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600", "700"], style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = MESSAGES[(await requestLocale()).lang];
  return { title: meta.title, description: meta.description };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f8f8f8" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await requestLocale();
  return (
    <html lang={locale.lang} className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <I18nProvider initial={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
