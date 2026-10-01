"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Arrow } from "@/components/ui/BookButton";
import { EASE } from "@/components/ui/Reveal";
import { Rich } from "@/components/ui/Rich";
import { addDays, buildIcs, downloadIcs, formatTime } from "@/lib/booking";
import { fmtDate, todayInSalon, weekdayLong } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "../BookingProvider";

export function StepDone() {
  const { dict, locale } = useI18n();
  const { state, catalog, close } = useBooking();
  const reduce = useReducedMotion();
  const booking = state.booking!;
  const b = dict.booking.done;
  const stylist = catalog.stylists.find((s) => s.id === booking.stylistId)!;
  const services = booking.serviceIds.map((id) => catalog.services.find((s) => s.id === id)!.name[locale]);

  const today = todayInSalon().date;
  const day =
    booking.date === today ? b.today : booking.date === addDays(today, 1) ? b.tomorrow : weekdayLong(booking.date, locale);

  const addToCalendar = () => {
    const ics = buildIcs({
      booking,
      title: t(dict.booking.ics.title, { services: services.join(", ") }),
      description: t(dict.booking.ics.description, { stylist: stylist.name, ref: booking.reference }),
      location: "Atelier Sera, Lehmweg 21, 20251 Hamburg",
      timeZone: catalog.salon.timeZone,
    });
    downloadIcs(dict.booking.ics.file, ics);
  };

  const rise = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.08 },
  });

  return (
    <div className="flex min-h-full flex-col">
      <motion.p {...rise(0)} className="label flex items-center gap-3 text-detail">
        <span className="flex h-6 w-6 items-center justify-center bg-oxblood text-bone">
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden>
            <path d="m1 4.5 3.2 3L11 1" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
        {b.kicker}
      </motion.p>

      <h2 tabIndex={-1} data-step-heading className="mt-6 overflow-hidden pb-2 font-display text-[3.5rem] leading-[0.92] outline-none sm:text-[5rem] lg:text-[6.5rem]">
        <motion.span
          className="block"
          initial={{ y: reduce ? 0 : "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
        >
          <Rich text={t(b.title, { day })} />
        </motion.span>
      </h2>

      <motion.dl {...rise(2)} className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-6">
        <div className="col-span-2">
          <dt className="label text-detail">{dict.booking.summary.when}</dt>
          <dd className="mt-2 font-display text-[1.5rem] capitalize leading-tight">
            {fmtDate(booking.date, locale, { weekday: "long", day: "numeric", month: "long" })}
            <span className="block tnum text-muted">
              {formatTime(booking.start)} — {formatTime(booking.end)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="label text-detail">{dict.booking.summary.artist}</dt>
          <dd className="mt-2 font-display text-[1.25rem]">{stylist.name}</dd>
        </div>
        <div>
          <dt className="label text-detail">{b.reference}</dt>
          <dd className="mt-2 font-display text-[1.25rem] tnum">{booking.reference}</dd>
        </div>
      </motion.dl>

      <motion.div {...rise(3)} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <button
          type="button"
          onClick={addToCalendar}
          className="group label inline-flex h-14 items-center justify-between gap-5 bg-oxblood px-7 text-bone transition-colors duration-500 hover:bg-oxblood-deep sm:justify-start"
        >
          {b.addToCalendar}
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
            <path d="M7 1v10m0 0L3 7m4 4 4-4M1 15h12" stroke="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          onClick={close}
          className="group label inline-flex h-14 items-center justify-between gap-4 border-b border-line-strong text-fg hover:border-fg sm:h-auto sm:justify-start sm:pb-2"
        >
          {b.close}
          <Arrow />
        </button>
      </motion.div>

      <motion.div {...rise(4)} className="mt-10 grid max-w-md gap-2 text-[0.85rem] leading-relaxed text-muted">
        <p>{b.arrive}</p>
        <p>{t(b.emailNote, { email: booking.customer.email })}</p>
      </motion.div>
    </div>
  );
}
