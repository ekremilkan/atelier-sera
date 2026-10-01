import { addDays, formatTime, parseISODate, zonedNow, type ISODate, type Locale, type Minutes } from "@/lib/booking";
import { intlLocale } from "@/lib/i18n";

const TZ = "Europe/Berlin";

const asUtcDate = (date: ISODate) => {
  const { y, m, d } = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

export function fmtDate(date: ISODate, locale: Locale, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", ...opts }).format(asUtcDate(date));
}

export const weekdayLong = (date: ISODate, l: Locale) => fmtDate(date, l, { weekday: "long" });

/** "Today" / "Tomorrow" / "Thu 8 Oct" relative to Berlin time. */
export function relativeDay(
  date: ISODate,
  l: Locale,
  words: { today: string; tomorrow: string },
  now = new Date(),
) {
  const today = zonedNow(now, TZ).date;
  if (date === today) return words.today;
  if (date === addDays(today, 1)) return words.tomorrow;
  return fmtDate(date, l, { weekday: "short", day: "numeric", month: "short" });
}

export function fmtTime(min: Minutes, l: Locale) {
  const t = formatTime(min);
  return l === "de" ? t : t;
}

export const todayInSalon = (now = new Date()) => zonedNow(now, TZ);
