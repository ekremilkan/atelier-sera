import { SALON, STYLISTS } from "./data";
import { weekdayOf } from "./time";
import type { ExistingBooking, ISODate, SalonConfig, Stylist } from "./types";

/** FNV-1a — tiny, stable string hash. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG, seeded → same sequence every time. */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a believable, fully deterministic diary for one stylist on one day:
 * the same stylist + date always yields the same appointments.
 */
export function generateMockBookings(
  stylist: Stylist,
  date: ISODate,
  salon: SalonConfig = SALON,
): ExistingBooking[] {
  const wd = weekdayOf(date);
  const shift = stylist.shifts[wd];
  const open = salon.openingHours[wd];
  if (!shift || !open) return [];

  const start = Math.max(shift.start, open.start);
  const end = Math.min(shift.end, open.end);
  const rand = seededRandom(hashString(`${stylist.id}|${date}`));
  const step = salon.slotStepMin;

  // Roughly one day in twenty is fully booked — it happens in good salons.
  if (rand() < 0.05) return [{ stylistId: stylist.id, date, start, end }];

  // Saturdays run busier.
  const busyness = wd === 6 ? 0.5 : 0.36;
  const bookings: ExistingBooking[] = [];
  let t = start;
  while (t < end) {
    if (rand() < busyness) {
      const len = step * (2 + Math.floor(rand() * 4)); // 60–150 min
      const bEnd = Math.min(t + len, end);
      bookings.push({ stylistId: stylist.id, date, start: t, end: bEnd });
      t = bEnd;
    } else {
      t += step * (1 + Math.floor(rand() * 4)); // 30–120 min gap
    }
  }
  return bookings;
}

export function mockBookingsFor(stylistId: string, date: ISODate): ExistingBooking[] {
  const stylist = STYLISTS.find((s) => s.id === stylistId);
  return stylist ? generateMockBookings(stylist, date) : [];
}
