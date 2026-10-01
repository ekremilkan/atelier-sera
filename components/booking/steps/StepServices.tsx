"use client";

import { useState } from "react";
import { ANY_STYLIST, formatDuration } from "@/lib/booking";
import { formatPrice, t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "../BookingProvider";
import { useDerived } from "../useDerived";
import { Check, Notice, StepHeading } from "./StepHeading";

export function StepServices() {
  const { dict, locale } = useI18n();
  const { catalog, state, toggleService } = useBooking();
  const d = useDerived();
  const b = dict.booking;
  const chosenStylist =
    state.stylist && state.stylist !== ANY_STYLIST ? catalog.stylists.find((s) => s.id === state.stylist) : null;
  // Arriving via "Book with Inès": show her menu first, everything else on request.
  const [showAll, setShowAll] = useState(false);
  const visible = (id: string) =>
    showAll || !chosenStylist || chosenStylist.serviceIds.includes(id) || state.serviceIds.includes(id);

  return (
    <div>
      <StepHeading index={0} title={b.services.title} hint={b.services.hint} />

      {state.notice?.key === "switched" && <Notice>{t(b.services.switched, { name: state.notice.name })}</Notice>}
      {state.serviceIds.length > 1 && d.capable.length === 0 && <Notice tone="warn">{b.services.conflict}</Notice>}

      {chosenStylist && !showAll && (
        <p className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-[0.9rem] text-muted">
          {t(b.services.onlyWith, { name: chosenStylist.name.split(" ")[0] })}
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="label h-11 text-fg underline decoration-line-strong underline-offset-8 hover:decoration-fg"
          >
            {b.services.showAll}
          </button>
        </p>
      )}

      <div className="grid gap-12">
        {catalog.categories
          .filter((cat) => catalog.services.some((s) => s.category === cat.id && visible(s.id)))
          .map((cat, ci) => (
          <fieldset key={cat.id}>
            <legend className="mb-3 flex w-full items-baseline gap-3">
              <span className="label tnum text-detail">0{ci + 1}</span>
              <span className="label">{cat.name[locale]}</span>
            </legend>
            <ul className="border-t border-line-strong">
              {catalog.services
                .filter((s) => s.category === cat.id && visible(s.id))
                .map((s) => {
                  const on = state.serviceIds.includes(s.id);
                  const notWith = chosenStylist && !chosenStylist.serviceIds.includes(s.id);
                  return (
                    <li key={s.id} className="border-b border-line">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleService(s.id)}
                        className={`group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left transition-colors duration-300 sm:gap-5 ${
                          on ? "bg-oxblood/[0.06]" : "hover:bg-ink/[0.03]"
                        }`}
                      >
                        <span className="pl-1">
                          <Check on={on} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-[1.3rem] leading-tight sm:text-[1.5rem]">{s.name[locale]}</span>
                          <span className="label mt-1.5 flex flex-wrap gap-x-3 gap-y-1 tnum text-muted">
                            <span>{formatDuration(s.durationMin, locale)}</span>
                            {notWith && <span className="text-oxblood">{t(b.services.notWith, { name: chosenStylist.name.split(" ")[0] })}</span>}
                          </span>
                        </span>
                        <span className="pr-1 font-display text-[1.25rem] tnum sm:text-[1.4rem]">
                          {formatPrice(s.priceEUR, locale, s.priceFrom, dict.services.from)}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
