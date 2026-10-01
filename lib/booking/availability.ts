/**
 * Pure availability rules. No I/O, no globals: everything comes in through
 * `AvailabilityContext` and an explicit `now`, so every edge case is testable.
 */
import { addDays, diffDays, weekdayOf, zonedNow } from "./time";
import {
  ANY_STYLIST,
  type AvailabilityContext,
  type DayAvailability,
  type ISODate,
  type Minutes,
  type Service,
  type Slot,
  type Stylist,
  type StylistChoice,
  type TimeRange,
} from "./types";

export function resolveServices(ctx: AvailabilityContext, serviceIds: string[]): Service[] {
  return serviceIds
    .map((id) => ctx.services.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));
}

export function summarize(ctx: AvailabilityContext, serviceIds: string[]) {
  const list = resolveServices(ctx, serviceIds);
  return {
    services: list,
    durationMin: list.reduce((sum, s) => sum + s.durationMin, 0),
    priceEUR: list.reduce((sum, s) => sum + s.priceEUR, 0),
    priceFrom: list.some((s) => s.priceFrom),
  };
}

/** Stylists who can perform every selected service in one sitting. */
export function capableStylists(ctx: AvailabilityContext, serviceIds: string[]): Stylist[] {
  return ctx.stylists.filter((st) => serviceIds.every((id) => st.serviceIds.includes(id)));
}

/** The stylist's bookable window on a date, clipped to salon hours. */
export function workingWindow(
  ctx: AvailabilityContext,
  stylist: Stylist,
  date: ISODate,
): TimeRange | null {
  const wd = weekdayOf(date);
  const open = ctx.salon.openingHours[wd];
  const shift = stylist.shifts[wd];
  if (!open || !shift) return null;
  if (stylist.datesOff?.includes(date)) return null;
  const start = Math.max(open.start, shift.start);
  const end = Math.min(open.end, shift.end);
  return end > start ? { start, end } : null;
}

const overlaps = (a: TimeRange, b: TimeRange) => a.start < b.end && b.start < a.end;

function candidates(ctx: AvailabilityContext, stylist: StylistChoice, serviceIds: string[]) {
  const capable = capableStylists(ctx, serviceIds);
  return stylist === ANY_STYLIST ? capable : capable.filter((s) => s.id === stylist);
}

export interface SlotQuery {
  date: ISODate;
  stylist: StylistChoice;
  serviceIds: string[];
  now: Date;
}

export function getSlots(ctx: AvailabilityContext, q: SlotQuery): Slot[] {
  const { durationMin } = summarize(ctx, q.serviceIds);
  if (durationMin === 0) return [];

  const today = zonedNow(q.now, ctx.salon.timeZone);
  const dayOffset = diffDays(q.date, today.date);
  if (dayOffset < 0 || dayOffset > ctx.salon.horizonDays) return [];
  const earliest: Minutes = dayOffset === 0 ? today.minutes + ctx.salon.leadTimeMin : 0;

  const byStart = new Map<Minutes, string[]>();
  for (const st of candidates(ctx, q.stylist, q.serviceIds)) {
    const win = workingWindow(ctx, st, q.date);
    if (!win) continue;
    const busy = ctx.bookingsFor(st.id, q.date);
    const step = ctx.salon.slotStepMin;
    for (let t = win.start; t + durationMin <= win.end; t += step) {
      if (t < earliest) continue;
      const candidate = { start: t, end: t + durationMin };
      if (busy.some((b) => overlaps(b, candidate))) continue;
      byStart.set(t, [...(byStart.get(t) ?? []), st.id]);
    }
  }

  return [...byStart.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, stylistIds]) => ({ start, stylistIds }));
}

export function getDayAvailability(
  ctx: AvailabilityContext,
  q: Omit<SlotQuery, "date"> & { from: ISODate; days: number },
): DayAvailability[] {
  const today = zonedNow(q.now, ctx.salon.timeZone).date;
  const pool = candidates(ctx, q.stylist, q.serviceIds);
  const out: DayAvailability[] = [];

  for (let i = 0; i < q.days; i++) {
    const date = addDays(q.from, i);
    const offset = diffDays(date, today);
    const wd = weekdayOf(date);
    let status: DayAvailability["status"];
    let slotCount = 0;

    if (offset < 0) status = "past";
    else if (offset > ctx.salon.horizonDays) status = "beyond";
    else if (!ctx.salon.openingHours[wd]) status = "closed";
    else if (!pool.some((st) => workingWindow(ctx, st, date))) status = "off";
    else {
      slotCount = getSlots(ctx, { ...q, date }).length;
      if (slotCount > 0) status = "open";
      // Today, after the last possible start: the day is over, not "full".
      else if (offset === 0 && dayIsOver(ctx, pool, date, q.now)) status = "past";
      else status = "full";
    }
    out.push({ date, status, slotCount });
  }
  return out;
}

function dayIsOver(ctx: AvailabilityContext, pool: Stylist[], date: ISODate, now: Date) {
  const earliest = zonedNow(now, ctx.salon.timeZone).minutes + ctx.salon.leadTimeMin;
  return pool.every((st) => {
    const win = workingWindow(ctx, st, date);
    return !win || win.end <= earliest;
  });
}

export function findNextAvailable(
  ctx: AvailabilityContext,
  q: Omit<SlotQuery, "date">,
): { date: ISODate; slot: Slot } | null {
  const today = zonedNow(q.now, ctx.salon.timeZone).date;
  for (let i = 0; i <= ctx.salon.horizonDays; i++) {
    const date = addDays(today, i);
    const [first] = getSlots(ctx, { ...q, date });
    if (first) return { date, slot: first };
  }
  return null;
}

/**
 * For "no preference": give the slot to whoever has the lightest day,
 * ties broken by roster order so the result is deterministic.
 */
export function assignStylist(ctx: AvailabilityContext, slot: Slot, date: ISODate): string {
  const load = (id: string) =>
    ctx.bookingsFor(id, date).reduce((sum, b) => sum + (b.end - b.start), 0);
  const order = (id: string) => ctx.stylists.findIndex((s) => s.id === id);
  return [...slot.stylistIds].sort((a, b) => load(a) - load(b) || order(a) - order(b))[0];
}
