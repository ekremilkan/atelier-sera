"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE } from "@/components/ui/Reveal";
import {
  ANY_STYLIST,
  addDays,
  formatDuration,
  formatTime,
  parseISODate,
  toISODate,
  weekdayOf,
  type DayAvailability,
  type ISODate,
  type Slot,
} from "@/lib/booking";
import { bookingService } from "@/lib/booking/service";
import { fmtDate, todayInSalon } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "../BookingProvider";
import { useDerived } from "../useDerived";
import { Notice, StepHeading } from "./StepHeading";

type DayMap = Map<ISODate, DayAvailability>;

function useCalendar() {
  const { state, catalog } = useBooking();
  // Results are tagged with the query they answer, so a stale result reads as "loading".
  const [res, setRes] = useState<{ key: string; days: DayAvailability[] } | null>(null);
  const stylist = state.stylist ?? ANY_STYLIST;
  const key = `${stylist}|${state.serviceIds.join()}`;
  useEffect(() => {
    let alive = true;
    bookingService
      .getCalendar({
        from: todayInSalon().date,
        days: catalog.salon.horizonDays + 1,
        stylist,
        serviceIds: state.serviceIds,
      })
      .then((days) => alive && setRes({ key, days }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return res?.key === key ? res.days : null;
}

function useSlots(date: ISODate | null) {
  const { state } = useBooking();
  const [res, setRes] = useState<{ key: string; slots: Slot[] } | null>(null);
  const stylist = state.stylist ?? ANY_STYLIST;
  const key = `${date}|${stylist}|${state.serviceIds.join()}`;
  useEffect(() => {
    if (!date) return;
    let alive = true;
    bookingService.getSlots({ date, stylist, serviceIds: state.serviceIds }).then((slots) => alive && setRes({ key, slots }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return res?.key === key ? res.slots : null;
}

/** Availability as a hairline bar under each date: longer = more choice. */
function Density({ day, max }: { day?: DayAvailability; max: number }) {
  if (!day || day.status !== "open") return <span className="block h-[2px] w-full" />;
  const pct = Math.max(18, Math.round((day.slotCount / max) * 100));
  return (
    <span className="block h-[2px] w-full bg-line">
      <span className="block h-full bg-current" style={{ width: `${pct}%` }} />
    </span>
  );
}

function MonthGrid({ map, max, today, last }: { map: DayMap; max: number; today: ISODate; last: ISODate }) {
  const { locale, dict } = useI18n();
  const { state, setDate } = useBooking();
  const initial = parseISODate(state.date ?? today);
  const [view, setView] = useState({ y: initial.y, m: initial.m });
  const [focusDate, setFocusDate] = useState<ISODate>(state.date ?? today);
  const gridRef = useRef<HTMLDivElement>(null);
  const tp = parseISODate(today);
  const lp = parseISODate(last);

  // Keep the grid on the selected month (e.g. after auto-selecting the first free day).
  const [syncedDate, setSyncedDate] = useState(state.date);
  if (state.date !== syncedDate) {
    setSyncedDate(state.date);
    if (state.date) {
      const p = parseISODate(state.date);
      setView({ y: p.y, m: p.m });
      setFocusDate(state.date);
    }
  }

  const first = toISODate(view.y, view.m, 1);
  const lead = (weekdayOf(first) + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const cells: (ISODate | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(view.y, view.m, i + 1)),
  ];
  const weekdays = Array.from({ length: 7 }, (_, i) => fmtDate(addDays("2026-01-05", i), locale, { weekday: "short" }));
  const canPrev = view.y > tp.y || (view.y === tp.y && view.m > tp.m);
  const canNext = view.y < lp.y || (view.y === lp.y && view.m < lp.m);
  const shift = (d: number) => {
    const n = new Date(Date.UTC(view.y, view.m - 1 + d, 1));
    setView({ y: n.getUTCFullYear(), m: n.getUTCMonth() + 1 });
  };

  const inRange = (d: ISODate) => d >= today && d <= last;
  const onKey = (e: React.KeyboardEvent, date: ISODate) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = addDays(date, delta);
    if (!inRange(next)) return;
    const np = parseISODate(next);
    setView({ y: np.y, m: np.m });
    setFocusDate(next);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus());
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-display text-[1.75rem] capitalize leading-none" aria-live="polite">
          {fmtDate(first, locale, { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              disabled={d < 0 ? !canPrev : !canNext}
              onClick={() => shift(d)}
              aria-label={d < 0 ? dict.booking.time.prevMonth : dict.booking.time.nextMonth}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-fg disabled:opacity-25 disabled:hover:border-line-strong"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden className={d > 0 ? "rotate-180" : ""}>
                <path d="M5 1 1 5l4 4M1 5h13" stroke="currentColor" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div role="grid" ref={gridRef} aria-label={fmtDate(first, locale, { month: "long", year: "numeric" })}>
        <div role="row" className="grid grid-cols-7 border-b border-line pb-2">
          {weekdays.map((w) => (
            <span role="columnheader" key={w} className="label text-center text-muted">
              {w.replace(".", "")}
            </span>
          ))}
        </div>
        <div role="row" className="grid grid-cols-7 gap-y-1 pt-2">
          {cells.map((date, i) => {
            if (!date) return <span key={`e${i}`} role="gridcell" />;
            const day = map.get(date);
            const status = day?.status ?? (date < today ? "past" : "beyond");
            const selectable = inRange(date);
            const selected = state.date === date;
            const open = status === "open";
            return (
              <span key={date} role="gridcell" aria-selected={selected}>
                <button
                  type="button"
                  data-date={date}
                  disabled={!selectable}
                  tabIndex={date === focusDate ? 0 : -1}
                  onKeyDown={(e) => onKey(e, date)}
                  onClick={() => setDate(date)}
                  aria-label={`${fmtDate(date, locale, { weekday: "long", day: "numeric", month: "long" })}${
                    open ? "" : ` — ${dict.booking.time.legendFull}`
                  }`}
                  aria-pressed={selected}
                  className={`relative mx-auto flex h-14 w-full max-w-[4rem] flex-col items-center justify-center gap-1.5 px-2 transition-colors duration-300 disabled:cursor-default ${
                    selected ? "bg-oxblood text-bone" : open ? "hover:bg-ink/[0.05]" : "text-muted/60"
                  }`}
                >
                  <span className={`font-display text-[1.35rem] leading-none tnum ${!open && selectable ? "line-through decoration-1" : ""}`}>
                    {parseISODate(date).d}
                  </span>
                  <span className="w-6">
                    <Density day={day} max={max} />
                  </span>
                  {date === today && !selected && (
                    <span aria-hidden className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-oxblood" />
                  )}
                </button>
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-6">
        <span className="label flex items-center gap-2 text-muted">
          <span className="block h-[2px] w-5 bg-fg" />
          {dict.booking.time.legendFree}
        </span>
        <span className="label flex items-center gap-2 text-muted">
          <span className="font-display text-[0.9rem] normal-case tracking-normal line-through">14</span>
          {dict.booking.time.legendFull}
        </span>
      </div>
    </div>
  );
}

function DayStrip({ days, max }: { days: DayAvailability[]; max: number }) {
  const { locale } = useI18n();
  const { state, setDate } = useBooking();
  const ref = useRef<HTMLDivElement>(null);
  const month = fmtDate(state.date ?? days[0].date, locale, { month: "long", year: "numeric" });

  useEffect(() => {
    // Scroll only the strip itself — scrollIntoView would also move the dialog.
    const strip = ref.current;
    const el = strip?.querySelector<HTMLElement>(`[data-date="${state.date}"]`);
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [state.date]);

  return (
    <div>
      <p className="mb-3 font-display text-[1.5rem] capitalize leading-none">{month}</p>
      <div
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
        role="listbox"
        aria-label={month}
      >
        {days.map((day) => {
          const selected = state.date === day.date;
          const open = day.status === "open";
          const p = parseISODate(day.date);
          return (
            <button
              key={day.date}
              type="button"
              role="option"
              aria-selected={selected}
              data-date={day.date}
              onClick={() => setDate(day.date)}
              aria-label={fmtDate(day.date, locale, { weekday: "long", day: "numeric", month: "long" })}
              className={`flex h-[5.5rem] w-[3.75rem] shrink-0 snap-start flex-col items-center justify-center gap-2 border transition-colors duration-300 ${
                selected ? "border-oxblood bg-oxblood text-bone" : open ? "border-line" : "border-transparent text-muted/60"
              }`}
            >
              <span className="label text-[0.625rem]">{fmtDate(day.date, locale, { weekday: "short" }).replace(".", "")}</span>
              <span className={`font-display text-[1.5rem] leading-none tnum ${!open ? "line-through decoration-1" : ""}`}>{p.d}</span>
              <span className="w-6">
                <Density day={day} max={max} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SlotList({ date, map }: { date: ISODate; map: DayMap }) {
  const { dict, locale } = useI18n();
  const { state, catalog, setTime } = useBooking();
  const d = useDerived();
  const slots = useSlots(date);
  const tt = dict.booking.time;
  const status = map.get(date)?.status;

  const groups = useMemo(() => {
    if (!slots) return [];
    return [
      { label: tt.morning, items: slots.filter((s) => s.start < 12 * 60) },
      { label: tt.afternoon, items: slots.filter((s) => s.start >= 12 * 60 && s.start < 17 * 60) },
      { label: tt.evening, items: slots.filter((s) => s.start >= 17 * 60) },
    ].filter((g) => g.items.length);
  }, [slots, tt]);

  const message = (() => {
    if (status === "closed") return tt.closed;
    if (status === "past") return tt.past;
    if (status === "off") {
      const st = state.stylist && state.stylist !== ANY_STYLIST ? catalog.stylists.find((s) => s.id === state.stylist) : null;
      return st ? t(tt.off, { name: st.name.split(" ")[0] }) : tt.offAny;
    }
    if (slots && slots.length === 0) return tt.full;
    return null;
  })();

  return (
    <div>
      <p className="label flex items-center gap-3 text-detail">
        <span>{t(tt.slotsFor, { date: fmtDate(date, locale, { weekday: "long", day: "numeric", month: "long" }) })}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${date}-${slots ? "ready" : "loading"}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mt-5"
        >
          {message ? (
            <p className="py-6 font-display text-[1.5rem] italic leading-snug text-muted">{message}</p>
          ) : !slots ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label={tt.loading} role="status">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-14 animate-pulse bg-ink/[0.05]" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : (
            <div className="grid gap-7" role="radiogroup" aria-label={dict.booking.steps[2]}>
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="label mb-3 text-muted">{g.label}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {g.items.map((s) => {
                      const on = state.start === s.start;
                      return (
                        <button
                          key={s.start}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setTime(s.start)}
                          aria-label={`${formatTime(s.start)}, ${t(tt.until, { time: formatTime(s.start + d.durationMin) })}`}
                          className={`flex h-14 flex-col items-center justify-center border transition-colors duration-300 ${
                            on ? "border-oxblood bg-oxblood text-bone" : "border-line hover:border-fg"
                          }`}
                        >
                          <span className="font-display text-[1.3rem] leading-none tnum">{formatTime(s.start)}</span>
                          <span className={`mt-1 text-[0.625rem] tnum tracking-wide ${on ? "text-bone/75" : "text-muted"}`}>
                            {t(tt.until, { time: formatTime(s.start + d.durationMin) })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function StepDateTime() {
  const { dict, locale } = useI18n();
  const { state, catalog, setDate } = useBooking();
  const days = useCalendar();
  const d = useDerived();
  const today = todayInSalon().date;
  const last = addDays(today, catalog.salon.horizonDays);

  const map = useMemo(() => new Map((days ?? []).map((x) => [x.date, x])), [days]);
  const max = useMemo(() => Math.max(1, ...(days ?? []).map((x) => x.slotCount)), [days]);

  // Land on the first day that actually has room.
  useEffect(() => {
    if (!days) return;
    const current = state.date ? map.get(state.date) : undefined;
    if (current?.status === "open") return;
    const first = days.find((x) => x.status === "open");
    if (first) setDate(first.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div>
      <StepHeading index={2} title={dict.booking.time.title} hint={t(dict.booking.time.hint, { duration: formatDuration(d.durationMin, locale) })} />
      {!days ? (
        <div role="status" className="grid gap-3">
          <p className="label text-muted">{dict.booking.time.loading}</p>
          <div className="h-72 animate-pulse bg-ink/[0.04]" />
        </div>
      ) : days.every((x) => x.status !== "open") ? (
        <Notice tone="warn">{dict.booking.time.full}</Notice>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-12">
          <div className="hidden md:block">
            <MonthGrid map={map} max={max} today={today} last={last} />
          </div>
          <div className="md:hidden">
            <DayStrip days={days.filter((x) => x.status !== "past" || x.date === today)} max={max} />
          </div>
          {state.date && <SlotList date={state.date} map={map} />}
        </div>
      )}
    </div>
  );
}
