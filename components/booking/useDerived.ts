"use client";

import { useMemo } from "react";
import { ANY_STYLIST, formatDuration, formatTime } from "@/lib/booking";
import { fmtDate } from "@/lib/format";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "./BookingProvider";

/** Everything the UI derives from the booking state, formatted for the current locale. */
export function useDerived() {
  const { state, catalog } = useBooking();
  const { locale, dict } = useI18n();

  return useMemo(() => {
    const services = state.serviceIds
      .map((id) => catalog.services.find((s) => s.id === id))
      .filter((s) => s !== undefined);
    const durationMin = services.reduce((a, s) => a + s.durationMin, 0);
    const priceEUR = services.reduce((a, s) => a + s.priceEUR, 0);
    const priceFrom = services.some((s) => s.priceFrom);
    const capable = catalog.stylists.filter((st) => state.serviceIds.every((id) => st.serviceIds.includes(id)));

    const assignedId = state.booking?.stylistId ?? (state.stylist !== ANY_STYLIST ? state.stylist : null);
    const stylist = assignedId ? catalog.stylists.find((s) => s.id === assignedId) ?? null : null;

    const when =
      state.date && state.start !== null
        ? {
            day: fmtDate(state.date, locale, { weekday: "long", day: "numeric", month: "long" }),
            time: `${formatTime(state.start)} — ${formatTime(state.start + durationMin)}`,
          }
        : state.date
          ? { day: fmtDate(state.date, locale, { weekday: "long", day: "numeric", month: "long" }), time: null }
          : null;

    return {
      services,
      durationMin,
      duration: formatDuration(durationMin, locale),
      priceEUR,
      price: formatPrice(priceEUR, locale, priceFrom, dict.services.from),
      capable,
      stylist,
      when,
    };
  }, [state, catalog, locale, dict]);
}
