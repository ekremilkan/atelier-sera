"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ANY_STYLIST, formatDuration } from "@/lib/booking";
import { formatPrice, plural, t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "./BookingProvider";
import { EASE } from "@/components/ui/Reveal";
import { useDerived } from "./useDerived";

/** The live "ticket": what, who, when, and the running total. */
export function Summary({ compact = false }: { compact?: boolean }) {
  const { dict, locale } = useI18n();
  const { state, toggleService } = useBooking();
  const d = useDerived();
  const s = dict.booking.summary;
  const done = state.step === 4;

  return (
    <div className="flex h-full flex-col">
      {!compact && (
        <div className="flex items-baseline justify-between gap-4">
          <p className="label text-detail">{s.title}</p>
          {state.booking && <p className="label tnum text-muted">{state.booking.reference}</p>}
        </div>
      )}

      {/* Services */}
      <div className={compact ? "" : "mt-8"}>
        {d.services.length === 0 ? (
          <p className="font-display text-[1.5rem] italic text-muted">{s.empty}</p>
        ) : (
          <ul className="grid">
            <AnimatePresence initial={false}>
              {d.services.map((sv) => (
                <motion.li
                  key={sv.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-line py-3.5">
                    <div className="min-w-0">
                      <p className="font-display text-[1.3rem] leading-tight">{sv.name[locale]}</p>
                      <p className="label mt-1.5 tnum text-muted">{formatDuration(sv.durationMin, locale)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="font-display text-[1.2rem] tnum">
                        {formatPrice(sv.priceEUR, locale, sv.priceFrom, dict.services.from)}
                      </p>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => toggleService(sv.id)}
                          aria-label={t(s.remove, { name: sv.name[locale] })}
                          className="-mr-3 flex h-11 w-11 items-center justify-center text-muted hover:text-fg"
                        >
                          <span aria-hidden className="relative block h-3 w-3">
                            <span className="absolute left-0 top-1/2 h-px w-3 rotate-45 bg-current" />
                            <span className="absolute left-0 top-1/2 h-px w-3 -rotate-45 bg-current" />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Who & when */}
      <dl className="mt-6 grid gap-5">
        <div className="grid grid-cols-[5.5rem_1fr] gap-4">
          <dt className="label pt-1 text-detail">{s.artist}</dt>
          <dd className="text-[0.95rem]">
            {d.stylist ? (
              d.stylist.name
            ) : state.stylist === ANY_STYLIST ? (
              <>
                {dict.booking.stylist.any}
                <span className="block text-[0.8rem] text-muted">{s.assigned}</span>
              </>
            ) : (
              <span className="text-muted">—</span>
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-4">
          <dt className="label pt-1 text-detail">{s.when}</dt>
          <dd className="text-[0.95rem]">
            {d.when ? (
              <>
                <span className="capitalize">{d.when.day}</span>
                {d.when.time && <span className="block tnum text-muted">{d.when.time}</span>}
              </>
            ) : (
              <span className="text-muted">—</span>
            )}
          </dd>
        </div>
      </dl>

      {/* Total */}
      <div className="mt-auto pt-10" aria-live="polite" aria-atomic="true">
        <div className="hairline" />
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="label text-detail">{s.total}</p>
            <p className="label mt-2 tnum text-muted">
              {d.services.length > 0 ? `${plural(s.count, d.services.length)} · ${d.duration}` : "—"}
            </p>
          </div>
          <motion.p
            key={d.price}
            initial={{ opacity: 0.2, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display text-[2.75rem] leading-none tnum"
          >
            {d.services.length > 0 ? d.price : "—"}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
