import type { Locale } from "@/lib/booking/types";
import { de } from "./de";
import { en, type Dictionary } from "./en";

export type { Dictionary, Locale };

export const LOCALES: Locale[] = ["en", "de"];
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, de };

export const hasLocale = (l: string): l is Locale => (LOCALES as string[]).includes(l);
export const getDictionary = (l: Locale) => dictionaries[l];

/** Fill `{token}` placeholders. */
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** "{n} service|{n} services" → picks the right form. */
export function plural(template: string, n: number): string {
  const [one, many = one] = template.split("|");
  return t(n === 1 ? one : many, { n });
}

export const intlLocale = (l: Locale) => (l === "de" ? "de-DE" : "en-GB");

export function formatPrice(eur: number, l: Locale, from = false, fromLabel = "from") {
  const n = new Intl.NumberFormat(intlLocale(l), { maximumFractionDigits: 0 }).format(eur);
  const p = l === "de" ? `${n} €` : `€${n}`;
  return from ? `${fromLabel} ${p}` : p;
}
