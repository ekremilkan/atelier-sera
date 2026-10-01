/**
 * Domain types for the booking engine.
 *
 * All dates are ISO calendar dates ("2026-10-06") and all times are
 * minutes after midnight in the salon's wall-clock time (Europe/Berlin).
 * Keeping these as plain values makes the layer trivial to serialise
 * when it moves behind a real API.
 */

export type Locale = "en" | "de";
export type Localized = Record<Locale, string>;

export type ISODate = string; // YYYY-MM-DD
export type Minutes = number; // minutes after midnight, salon local time

/** 0 = Sunday … 6 = Saturday (same as Date#getUTCDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CategoryId = "cut" | "color" | "treatment" | "bridal" | "brows";

export interface Category {
  id: CategoryId;
  name: Localized;
}

export interface Service {
  id: string;
  category: CategoryId;
  name: Localized;
  description: Localized;
  durationMin: number;
  priceEUR: number;
  /** Price is a starting price ("from €320"). */
  priceFrom?: boolean;
}

export interface TimeRange {
  start: Minutes;
  end: Minutes;
}

export type WeeklyHours = Partial<Record<Weekday, TimeRange>>;

export interface Stylist {
  id: string;
  name: string;
  role: Localized;
  serviceIds: string[];
  /** Weekdays not listed are days off. */
  shifts: WeeklyHours;
  /** Extra one-off days off (holidays, training, …). */
  datesOff?: ISODate[];
}

export interface ExistingBooking {
  stylistId: string;
  date: ISODate;
  start: Minutes;
  end: Minutes;
}

export interface SalonConfig {
  timeZone: string;
  openingHours: WeeklyHours;
  /** Granularity of bookable start times. */
  slotStepMin: number;
  /** How soon a same-day slot may start, measured from "now". */
  leadTimeMin: number;
  /** How many days ahead the calendar is bookable. */
  horizonDays: number;
}

/** Everything the pure availability functions need. Inject fakes in tests. */
export interface AvailabilityContext {
  salon: SalonConfig;
  services: Service[];
  stylists: Stylist[];
  bookingsFor: (stylistId: string, date: ISODate) => ExistingBooking[];
}

export const ANY_STYLIST = "any" as const;
export type StylistChoice = string | typeof ANY_STYLIST;

export interface Slot {
  start: Minutes;
  /** Stylists who can take this slot (one entry unless choice is "any"). */
  stylistIds: string[];
}

export type DayStatus = "past" | "closed" | "off" | "full" | "open" | "beyond";

export interface DayAvailability {
  date: ISODate;
  status: DayStatus;
  slotCount: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  note?: string;
  consent: boolean;
}

export interface BookingRequest {
  serviceIds: string[];
  stylist: StylistChoice;
  date: ISODate;
  start: Minutes;
  customer: CustomerDetails;
}

export interface Booking {
  reference: string;
  serviceIds: string[];
  stylistId: string;
  date: ISODate;
  start: Minutes;
  end: Minutes;
  totalEUR: number;
  customer: CustomerDetails;
  createdAt: string;
}

export type BookingErrorCode =
  | "no-services"
  | "unknown-service"
  | "no-capable-stylist"
  | "slot-unavailable"
  | "invalid-details";

export class BookingError extends Error {
  constructor(public code: BookingErrorCode, message?: string) {
    super(message ?? code);
    this.name = "BookingError";
  }
}
