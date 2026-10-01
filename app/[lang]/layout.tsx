import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { BookingOverlay } from "@/components/booking/BookingOverlay";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { Header } from "@/components/sections/Header";
import { bookingService } from "@/lib/booking/service";
import { IMG, SITE_URL } from "@/lib/content";
import { getDictionary, hasLocale, LOCALES } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/provider";
import { bodoni, manrope } from "./fonts";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", de: "/de", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Atelier Sera",
      title: meta.title,
      description: meta.description,
      locale: lang === "de" ? "de_DE" : "en_GB",
      images: [{ url: `${IMG.hero}?w=1200&h=630&fit=crop&crop=faces&q=75`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    // Concept project — keep it out of search indexes.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#141211",
  colorScheme: "dark light",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const catalog = await bookingService.getCatalog();

  return (
    <html lang={lang} className={`${bodoni.variable} ${manrope.variable}`}>
      <body>
        <I18nProvider locale={lang} dict={dict}>
          <BookingProvider catalog={catalog}>
            <a
              href="#main"
              className="label fixed left-4 top-4 z-[90] -translate-y-24 bg-bone px-4 py-3 text-ink focus:translate-y-0"
            >
              {dict.nav.skip}
            </a>
            <Header />
            {children}
            <BookingOverlay />
          </BookingProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
