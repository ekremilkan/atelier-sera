"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ANY_STYLIST, formatTime, type StylistChoice } from "@/lib/booking";
import { bookingService } from "@/lib/booking/service";
import { TEAM_MEDIA } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "../BookingProvider";
import { Notice, StepHeading } from "./StepHeading";

function useNextFree(choices: StylistChoice[], serviceIds: string[]) {
  const { dict, locale } = useI18n();
  const key = `${serviceIds.join()}|${choices.join()}|${locale}`;
  const [res, setRes] = useState<{ key: string; map: Record<string, string | null> }>({ key, map: {} });
  useEffect(() => {
    let alive = true;
    choices.forEach((c) =>
      bookingService.getNextAvailable({ stylist: c, serviceIds }).then((r) => {
        if (!alive) return;
        const label = r
          ? `${relativeDay(r.date, locale, { today: dict.hero.today, tomorrow: dict.hero.tomorrow })}, ${formatTime(r.slot.start)}`
          : null;
        setRes((r) => ({ key, map: { ...(r.key === key ? r.map : {}), [c]: label } }));
      }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (res.key === key ? res.map : {}) as Record<string, string | null | undefined>;
}

export function StepStylist() {
  const { dict, locale } = useI18n();
  const { catalog, state, setStylist } = useBooking();
  const b = dict.booking.stylist;
  const capable = catalog.stylists.filter((st) => state.serviceIds.every((id) => st.serviceIds.includes(id)));
  const nextFree = useNextFree([ANY_STYLIST, ...capable.map((c) => c.id)], state.serviceIds);

  // A render function (not a component) so tiles aren't remounted on every state change.
  const tile = ({
    id,
    disabled,
    children,
    reason,
  }: {
    id: StylistChoice;
    disabled?: boolean;
    children: React.ReactNode;
    reason?: string;
  }) => {
    const on = state.stylist === id;
    const free = nextFree[id];
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        disabled={disabled}
        onClick={() => setStylist(id)}
        className={`group relative flex flex-col text-left outline-offset-4 transition-opacity duration-300 disabled:cursor-not-allowed ${
          disabled ? "opacity-45" : ""
        }`}
      >
        {children}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 aspect-[4/5] ring-inset transition-shadow duration-300 ${
            on ? "ring-[3px] ring-oxblood" : "ring-0 group-hover:ring-1 group-hover:ring-line-strong"
          }`}
        />
        {on && (
          <span aria-hidden className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-oxblood text-bone">
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="m1 4.5 3.2 3L11 1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        )}
        <span className="label mt-2 block tnum text-muted">
          {disabled ? (
            reason
          ) : free === undefined ? (
            b.checking
          ) : free === null ? (
            b.none
          ) : (
            <>
              <span className="text-detail">{b.nextFree}</span> · {free}
            </>
          )}
        </span>
      </button>
    );
  };

  return (
    <div>
      <StepHeading index={1} title={b.title} hint={b.hint} />
      {capable.length === 0 && <Notice tone="warn">{dict.booking.services.conflict}</Notice>}

      <div role="radiogroup" aria-label={dict.booking.steps[1]} className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
        {tile({
          id: ANY_STYLIST,
          disabled: capable.length === 0,
          children: (
            <>
              <span className="flex aspect-[4/5] flex-col justify-between bg-ink p-4 text-bone">
                <span className="label text-champagne">00</span>
                <span className="font-display text-[2.25rem] italic leading-[0.9] sm:text-[2.75rem]">{b.any}.</span>
              </span>
              <span className="mt-3 block font-display text-[1.2rem] leading-tight">{b.anyHint}</span>
            </>
          ),
        })}

        {catalog.stylists.map((st) => {
          const missing = state.serviceIds.find((id) => !st.serviceIds.includes(id));
          const missingName = catalog.services.find((s) => s.id === missing)?.name[locale];
          return (
            <div key={st.id} className="contents">
              {tile({
                id: st.id,
                disabled: Boolean(missing),
                reason: missingName ? t(b.cantDo, { service: missingName }) : undefined,
                children: (
                  <>
              <span className="relative block aspect-[4/5] overflow-hidden bg-ink-2">
                <Image
                  src={TEAM_MEDIA[st.id].portrait}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 16vw, 45vw"
                  className={`graded object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03] ${
                    missing ? "grayscale" : ""
                  }`}
                  style={{ objectPosition: TEAM_MEDIA[st.id].position }}
                />
              </span>
              <span className="mt-3 block font-display text-[1.2rem] leading-tight">{st.name}</span>
              <span className="label mt-1 block text-detail">{st.role[locale]}</span>
                  </>
                ),
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
