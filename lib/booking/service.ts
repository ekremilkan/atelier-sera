/**
 * The seam between UI and data. Components only talk to `BookingService`;
 * swap `MockBookingService` for an HTTP/DB implementation without touching them.
 */
import {
  assignStylist,
  capableStylists,
  findNextAvailable,
  getDayAvailability,
  getSlots,
  summarize,
} from "./availability";
import { CATEGORIES, SALON, SERVICES, STYLISTS } from "./data";
import { hashString, mockBookingsFor } from "./mock-bookings";
import { parseISODate } from "./time";
import {
  BookingError,
  type AvailabilityContext,
  type Booking,
  type BookingRequest,
  type Category,
  type DayAvailability,
  type ExistingBooking,
  type ISODate,
  type SalonConfig,
  type Service,
  type Slot,
  type Stylist,
  type StylistChoice,
} from "./types";
import { isValid, validateDetails } from "./validation";

export interface AvailabilityQuery {
  serviceIds: string[];
  stylist: StylistChoice;
}

export interface BookingService {
  getCatalog(): Promise<{ salon: SalonConfig; categories: Category[]; services: Service[]; stylists: Stylist[] }>;
  getCalendar(q: AvailabilityQuery & { from: ISODate; days: number }): Promise<DayAvailability[]>;
  getSlots(q: AvailabilityQuery & { date: ISODate }): Promise<Slot[]>;
  getNextAvailable(q: AvailabilityQuery): Promise<{ date: ISODate; slot: Slot } | null>;
  createBooking(req: BookingRequest): Promise<Booking>;
}

export class MockBookingService implements BookingService {
  private created: ExistingBooking[] = [];
  private ctx: AvailabilityContext;

  constructor(
    private clock: () => Date = () => new Date(),
    private latencyMs = 0,
  ) {
    this.ctx = {
      salon: SALON,
      services: SERVICES,
      stylists: STYLISTS,
      bookingsFor: (id, date) => [
        ...mockBookingsFor(id, date),
        ...this.created.filter((b) => b.stylistId === id && b.date === date),
      ],
    };
  }

  private delay<T>(value: T): Promise<T> {
    if (!this.latencyMs) return Promise.resolve(value);
    return new Promise((r) => setTimeout(() => r(value), this.latencyMs));
  }

  async getCatalog() {
    return { salon: SALON, categories: CATEGORIES, services: SERVICES, stylists: STYLISTS };
  }

  getCalendar(q: AvailabilityQuery & { from: ISODate; days: number }) {
    return this.delay(getDayAvailability(this.ctx, { ...q, now: this.clock() }));
  }

  getSlots(q: AvailabilityQuery & { date: ISODate }) {
    return this.delay(getSlots(this.ctx, { ...q, now: this.clock() }));
  }

  getNextAvailable(q: AvailabilityQuery) {
    return this.delay(findNextAvailable(this.ctx, { ...q, now: this.clock() }));
  }

  async createBooking(req: BookingRequest): Promise<Booking> {
    if (req.serviceIds.length === 0) throw new BookingError("no-services");
    const { services, durationMin, priceEUR } = summarize(this.ctx, req.serviceIds);
    if (services.length !== req.serviceIds.length) throw new BookingError("unknown-service");
    if (capableStylists(this.ctx, req.serviceIds).length === 0)
      throw new BookingError("no-capable-stylist");
    if (!isValid(validateDetails(req.customer))) throw new BookingError("invalid-details");

    // Re-check against live availability — the slot may have gone meanwhile.
    const slot = getSlots(this.ctx, { ...req, now: this.clock() }).find((s) => s.start === req.start);
    if (!slot) throw new BookingError("slot-unavailable");

    const stylistId = assignStylist(this.ctx, slot, req.date);
    const end = req.start + durationMin;
    this.created.push({ stylistId, date: req.date, start: req.start, end });

    const { y, m } = parseISODate(req.date);
    const n = hashString(`${req.customer.email}|${req.date}|${req.start}|${this.created.length}`) % 9000;
    const reference = `AS-${String(y).slice(2)}${String(m).padStart(2, "0")}-${1000 + n}`;

    return this.delay({
      reference,
      serviceIds: req.serviceIds,
      stylistId,
      date: req.date,
      start: req.start,
      end,
      totalEUR: priceEUR,
      customer: req.customer,
      createdAt: this.clock().toISOString(),
    });
  }
}

/** App-wide instance. Replace with `new ApiBookingService(...)` later. */
export const bookingService: BookingService = new MockBookingService(() => new Date(), 220);
