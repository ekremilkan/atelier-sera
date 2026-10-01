import type { ISODate, Minutes, Weekday } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(y: number, m: number, d: number): ISODate {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseISODate(date: ISODate): { y: number; m: number; d: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

export function addDays(date: ISODate, days: number): ISODate {
  const { y, m, d } = parseISODate(date);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return toISODate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function weekdayOf(date: ISODate): Weekday {
  const { y, m, d } = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday;
}

export function diffDays(a: ISODate, b: ISODate): number {
  const pa = parseISODate(a);
  const pb = parseISODate(b);
  return Math.round(
    (Date.UTC(pa.y, pa.m - 1, pa.d) - Date.UTC(pb.y, pb.m - 1, pb.d)) / 86_400_000,
  );
}

export function formatTime(min: Minutes): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

export function parseTime(hhmm: string): Minutes {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Wall-clock date and minute-of-day for an instant in the given zone. */
export function zonedNow(now: Date, timeZone: string): { date: ISODate; minutes: Minutes } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return {
    date: toISODate(get("year"), get("month"), get("day")),
    minutes: get("hour") * 60 + get("minute"),
  };
}

/** Convert a wall-clock time in `timeZone` to a UTC instant (DST-safe). */
export function zonedToUtc(date: ISODate, minutes: Minutes, timeZone: string): Date {
  const { y, m, d } = parseISODate(date);
  const wallAsUtc = Date.UTC(y, m - 1, d, 0, minutes);
  let guess = wallAsUtc;
  // Two passes settle the offset even across a DST transition.
  for (let i = 0; i < 2; i++) {
    const z = zonedNow(new Date(guess), timeZone);
    const zp = parseISODate(z.date);
    const seenAsUtc = Date.UTC(zp.y, zp.m - 1, zp.d, 0, z.minutes);
    guess += wallAsUtc - seenAsUtc;
  }
  return new Date(guess);
}

/** "45 min", "75 min", "2 h", "3 h 30" — minutes read better than "1h 15" up to two hours. */
export function formatDuration(min: number, locale: "en" | "de" = "en"): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (min < 120 && m !== 0) return `${min} min`;
  const unit = locale === "de" ? "Std." : "h";
  return m === 0 ? `${h} ${unit}` : `${h} ${unit} ${pad(m)}`;
}
