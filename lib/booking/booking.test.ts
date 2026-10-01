import { describe, expect, it } from "vitest";
import {
  assignStylist,
  findNextAvailable,
  getDayAvailability,
  getSlots,
} from "./availability";
import { SALON, STYLISTS } from "./data";
import { buildIcs } from "./ics";
import { generateMockBookings } from "./mock-bookings";
import { MockBookingService } from "./service";
import { addDays, formatTime, parseTime, weekdayOf, zonedNow, zonedToUtc } from "./time";
import type { AvailabilityContext, ExistingBooking, SalonConfig } from "./types";
import { validateDetails } from "./validation";

const T = parseTime;
const times = (slots: { start: number }[]) => slots.map((s) => formatTime(s.start));

/** Berlin wall-clock instant → Date (October 2026 is CEST, UTC+2, until the 25th). */
const berlin = (iso: string) => new Date(`${iso}+02:00`);

const salon: SalonConfig = {
  timeZone: "Europe/Berlin",
  openingHours: {
    1: { start: T("10:00"), end: T("18:00") },
    2: { start: T("10:00"), end: T("18:00") },
    3: { start: T("10:00"), end: T("18:00") },
    4: { start: T("10:00"), end: T("18:00") },
    5: { start: T("10:00"), end: T("18:00") },
    6: { start: T("09:00"), end: T("14:00") },
  },
  slotStepMin: 30,
  leadTimeMin: 30,
  horizonDays: 60,
};

const busy: ExistingBooking[] = [{ stylistId: "ana", date: "2026-10-06", start: T("12:00"), end: T("13:00") }];

const ctx: AvailabilityContext = {
  salon,
  services: [
    { id: "color", category: "color", name: { en: "", de: "" }, description: { en: "", de: "" }, durationMin: 135, priceEUR: 165 },
    { id: "cut", category: "cut", name: { en: "", de: "" }, description: { en: "", de: "" }, durationMin: 60, priceEUR: 95 },
    { id: "brow", category: "brows", name: { en: "", de: "" }, description: { en: "", de: "" }, durationMin: 45, priceEUR: 55 },
  ],
  stylists: [
    {
      id: "ana",
      name: "Ana",
      role: { en: "", de: "" },
      serviceIds: ["color", "cut", "brow"],
      // Works until 19:00 on Tuesdays — but the salon closes at 18:00.
      shifts: {
        1: { start: T("10:00"), end: T("18:00") },
        2: { start: T("10:00"), end: T("19:00") },
        3: { start: T("10:00"), end: T("18:00") },
        4: { start: T("10:00"), end: T("18:00") },
        5: { start: T("10:00"), end: T("18:00") },
        6: { start: T("09:00"), end: T("14:00") },
      },
      datesOff: ["2026-10-08"],
    },
    {
      id: "ben",
      name: "Ben",
      role: { en: "", de: "" },
      serviceIds: ["cut"],
      // Off Mondays and Saturdays.
      shifts: {
        2: { start: T("12:00"), end: T("18:00") },
        3: { start: T("12:00"), end: T("18:00") },
        4: { start: T("12:00"), end: T("18:00") },
        5: { start: T("12:00"), end: T("18:00") },
      },
    },
  ],
  bookingsFor: (id, date) => busy.filter((b) => b.stylistId === id && b.date === date),
};

const MON_BEFORE = berlin("2026-10-05T08:00:00");

describe("long services near closing time", () => {
  it("a 2h15 service never runs past closing (clipped to salon hours, not the shift)", () => {
    const slots = getSlots(ctx, { date: "2026-10-06", stylist: "ana", serviceIds: ["color"], now: MON_BEFORE });
    expect(times(slots)).toEqual(["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]);
    expect(times(slots)).not.toContain("16:00");
    expect(times(slots)).not.toContain("17:00");
  });

  it("does not start a service that would overlap an existing booking", () => {
    const slots = times(getSlots(ctx, { date: "2026-10-06", stylist: "ana", serviceIds: ["color"], now: MON_BEFORE }));
    // 10:00 + 2h15 = 12:15 → collides with the 12:00 booking.
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("11:30");
  });

  it("uses the TOTAL duration of all selected services", () => {
    const cutOnly = times(getSlots(ctx, { date: "2026-10-07", stylist: "ana", serviceIds: ["cut"], now: MON_BEFORE }));
    const combo = times(getSlots(ctx, { date: "2026-10-07", stylist: "ana", serviceIds: ["cut", "color"], now: MON_BEFORE }));
    expect(cutOnly.at(-1)).toBe("17:00"); // 60 min
    expect(combo.at(-1)).toBe("14:30"); // 3h15 → ends exactly at 17:45
  });

  it("short Saturday hours", () => {
    const slots = times(getSlots(ctx, { date: "2026-10-10", stylist: "ana", serviceIds: ["color"], now: MON_BEFORE }));
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
  });
});

describe("days off and Sundays", () => {
  it("Sunday is closed for everyone", () => {
    expect(weekdayOf("2026-10-11")).toBe(0);
    expect(getSlots(ctx, { date: "2026-10-11", stylist: "any", serviceIds: ["cut"], now: MON_BEFORE })).toEqual([]);
    const [day] = getDayAvailability(ctx, { from: "2026-10-11", days: 1, stylist: "any", serviceIds: ["cut"], now: MON_BEFORE });
    expect(day.status).toBe("closed");
  });

  it("respects a stylist's weekly day off", () => {
    expect(getSlots(ctx, { date: "2026-10-05", stylist: "ben", serviceIds: ["cut"], now: MON_BEFORE })).toEqual([]);
    const [day] = getDayAvailability(ctx, { from: "2026-10-05", days: 1, stylist: "ben", serviceIds: ["cut"], now: MON_BEFORE });
    expect(day.status).toBe("off");
  });

  it("respects one-off dates off, while 'any' still finds a colleague", () => {
    expect(getSlots(ctx, { date: "2026-10-08", stylist: "ana", serviceIds: ["cut"], now: MON_BEFORE })).toEqual([]);
    const any = getSlots(ctx, { date: "2026-10-08", stylist: "any", serviceIds: ["cut"], now: MON_BEFORE });
    expect(any.length).toBeGreaterThan(0);
    expect(any.every((s) => s.stylistIds.join() === "ben")).toBe(true);
    expect(times(any)[0]).toBe("12:00"); // Ben's shift starts at noon
  });

  it("only offers stylists who can do every selected service", () => {
    expect(getSlots(ctx, { date: "2026-10-07", stylist: "ben", serviceIds: ["cut", "brow"], now: MON_BEFORE })).toEqual([]);
    const any = getSlots(ctx, { date: "2026-10-07", stylist: "any", serviceIds: ["cut", "brow"], now: MON_BEFORE });
    expect(any.every((s) => s.stylistIds.join() === "ana")).toBe(true);
  });
});

describe("past times", () => {
  it("hides slots earlier than now + lead time on the same day", () => {
    const now = berlin("2026-10-07T14:10:00");
    const slots = times(getSlots(ctx, { date: "2026-10-07", stylist: "ana", serviceIds: ["cut"], now }));
    expect(slots[0]).toBe("15:00"); // 14:30 < 14:40 (now + 30 min)
    expect(slots).not.toContain("14:30");
  });

  it("returns nothing for yesterday and marks it past", () => {
    const now = berlin("2026-10-07T09:00:00");
    expect(getSlots(ctx, { date: "2026-10-06", stylist: "ana", serviceIds: ["cut"], now })).toEqual([]);
    const [day] = getDayAvailability(ctx, { from: "2026-10-06", days: 1, stylist: "ana", serviceIds: ["cut"], now });
    expect(day.status).toBe("past");
  });

  it("after closing, today is 'past' (not 'full') and the next slot is tomorrow", () => {
    const now = berlin("2026-10-07T17:45:00");
    const [day] = getDayAvailability(ctx, { from: "2026-10-07", days: 1, stylist: "ana", serviceIds: ["cut"], now });
    expect(day.status).toBe("past");
    const next = findNextAvailable(ctx, { stylist: "ana", serviceIds: ["cut"], now });
    // Thursday 8th is Ana's day off → Friday.
    expect(next?.date).toBe("2026-10-09");
    expect(formatTime(next!.slot.start)).toBe("10:00");
  });

  it("uses Berlin time even if the server clock is elsewhere (UTC 23:30 = next day in Berlin)", () => {
    const now = new Date("2026-10-06T23:30:00Z"); // 01:30 Wed in Berlin
    expect(zonedNow(now, "Europe/Berlin").date).toBe("2026-10-07");
    const [tue] = getDayAvailability(ctx, { from: "2026-10-06", days: 1, stylist: "ana", serviceIds: ["cut"], now });
    expect(tue.status).toBe("past");
  });

  it("nothing beyond the booking horizon", () => {
    const far = addDays("2026-10-05", 61);
    expect(getSlots(ctx, { date: far, stylist: "ana", serviceIds: ["cut"], now: MON_BEFORE })).toEqual([]);
  });

  it("no services selected → no slots", () => {
    expect(getSlots(ctx, { date: "2026-10-07", stylist: "any", serviceIds: [], now: MON_BEFORE })).toEqual([]);
  });
});

describe("no preference", () => {
  it("merges slots across stylists and assigns the lightest diary", () => {
    const slots = getSlots(ctx, { date: "2026-10-06", stylist: "any", serviceIds: ["cut"], now: MON_BEFORE });
    const noon = slots.find((s) => s.start === T("13:00"))!;
    expect(noon.stylistIds.sort()).toEqual(["ana", "ben"]);
    // Ana has a 1h booking that day, Ben has none.
    expect(assignStylist(ctx, noon, "2026-10-06")).toBe("ben");
    // At 12:00 only Ben is free (Ana is booked).
    expect(slots.find((s) => s.start === T("12:00"))!.stylistIds).toEqual(["ben"]);
  });
});

describe("mock diary (real roster)", () => {
  it("is deterministic and stays inside working hours without overlaps", () => {
    for (const st of STYLISTS) {
      for (let i = 0; i < 42; i++) {
        const date = addDays("2026-10-05", i);
        const a = generateMockBookings(st, date);
        expect(generateMockBookings(st, date)).toEqual(a);
        const wd = weekdayOf(date);
        const shift = st.shifts[wd];
        const open = SALON.openingHours[wd];
        if (!shift || !open) {
          expect(a).toEqual([]);
          continue;
        }
        for (const [j, b] of a.entries()) {
          expect(b.start).toBeGreaterThanOrEqual(Math.max(shift.start, open.start));
          expect(b.end).toBeLessThanOrEqual(Math.min(shift.end, open.end));
          if (j > 0) expect(b.start).toBeGreaterThanOrEqual(a[j - 1].end);
        }
      }
    }
  });
});

describe("time zone helpers", () => {
  it("converts Berlin wall time to UTC across the DST change", () => {
    expect(zonedToUtc("2026-10-02", T("10:00"), "Europe/Berlin").toISOString()).toBe("2026-10-02T08:00:00.000Z");
    expect(zonedToUtc("2026-10-26", T("10:00"), "Europe/Berlin").toISOString()).toBe("2026-10-26T09:00:00.000Z");
  });
});

describe("MockBookingService", () => {
  const customer = { name: "Lea Krüger", email: "lea@example.com", phone: "+49 40 1234567", consent: true };

  it("creates a booking, then the slot is gone", async () => {
    const svc = new MockBookingService(() => MON_BEFORE);
    const [slot] = await svc.getSlots({ date: "2026-10-06", stylist: "any", serviceIds: ["signature-cut"] });
    const booking = await svc.createBooking({
      serviceIds: ["signature-cut"],
      stylist: "any",
      date: "2026-10-06",
      start: slot.start,
      customer,
    });
    expect(booking.reference).toMatch(/^AS-2610-\d{4}$/);
    expect(booking.end - booking.start).toBe(75);
    expect(slot.stylistIds).toContain(booking.stylistId);

    const again = await svc.getSlots({ date: "2026-10-06", stylist: booking.stylistId, serviceIds: ["signature-cut"] });
    expect(again.find((s) => s.start === slot.start)).toBeUndefined();
  });

  it("rejects an unavailable slot and invalid details", async () => {
    const svc = new MockBookingService(() => MON_BEFORE);
    await expect(
      svc.createBooking({ serviceIds: ["signature-cut"], stylist: "any", date: "2026-10-11", start: T("10:00"), customer }),
    ).rejects.toMatchObject({ code: "slot-unavailable" });
    await expect(
      svc.createBooking({ serviceIds: ["signature-cut"], stylist: "any", date: "2026-10-06", start: T("10:00"), customer: { ...customer, consent: false } }),
    ).rejects.toMatchObject({ code: "invalid-details" });
    await expect(
      svc.createBooking({ serviceIds: ["balayage", "brow-lamination"], stylist: "any", date: "2026-10-06", start: T("10:00"), customer }),
    ).rejects.toMatchObject({ code: "no-capable-stylist" });
  });
});

describe("validation", () => {
  it("flags each field", () => {
    expect(validateDetails({ name: "", email: "x@", phone: "12", consent: false })).toEqual({
      name: "required",
      email: "invalid-email",
      phone: "invalid-phone",
      consent: "required",
    });
    expect(validateDetails({ name: "Jo", email: "jo@mail.de", phone: "040 / 123 45 67", consent: true })).toEqual({});
  });
});

describe("ics", () => {
  it("produces a valid VEVENT in UTC with CRLF line endings", () => {
    const ics = buildIcs({
      booking: {
        reference: "AS-2610-1234",
        serviceIds: ["signature-cut"],
        stylistId: "jonas",
        date: "2026-10-06",
        start: T("13:00"),
        end: T("14:15"),
        totalEUR: 95,
        customer: { name: "Lea", email: "lea@example.com", phone: "+4940123456", consent: true },
        createdAt: "",
      },
      title: "Atelier Sera — Signature Cut",
      description: "With Jonas Ebert; ref AS-2610-1234",
      location: "Lehmweg 21, 20251 Hamburg",
      timeZone: "Europe/Berlin",
      now: new Date("2026-10-05T10:00:00Z"),
    });
    expect(ics).toContain("DTSTART:20261006T110000Z\r\n");
    expect(ics).toContain("DTEND:20261006T121500Z\r\n");
    expect(ics).toContain("LOCATION:Lehmweg 21\\, 20251 Hamburg");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
  });
});
