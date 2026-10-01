"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/sections/Header";
import { Arrow } from "@/components/ui/BookButton";
import { CURTAIN, EASE } from "@/components/ui/Reveal";
import { useDialog } from "@/components/ui/useDialog";
import { ANY_STYLIST, BookingError } from "@/lib/booking";
import { bookingService } from "@/lib/booking/service";
import { plural } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking, type Step } from "./BookingProvider";
import { Summary } from "./Summary";
import { StepDateTime } from "./steps/StepDateTime";
import { DETAILS_FORM_ID, StepDetails } from "./steps/StepDetails";
import { StepDone } from "./steps/StepDone";
import { Notice } from "./steps/StepHeading";
import { StepServices } from "./steps/StepServices";
import { StepStylist } from "./steps/StepStylist";
import { useDerived } from "./useDerived";

export function BookingOverlay() {
  const { state } = useBooking();
  return <AnimatePresence>{state.open && <Overlay key="booking" />}</AnimatePresence>;
}

function Overlay() {
  const { dict } = useI18n();
  const { state, close, goto, confirmed, setTime } = useBooking();
  const d = useDerived();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(1);
  const [sheet, setSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const b = dict.booking;
  const step = state.step;
  const done = step === 4;

  useDialog(ref, true, close);

  const valid: Record<0 | 1 | 2, boolean> = {
    0: d.services.length > 0 && d.capable.length > 0,
    1:
      state.stylist !== null &&
      d.capable.length > 0 &&
      (state.stylist === ANY_STYLIST || d.capable.some((c) => c.id === state.stylist)),
    2: state.date !== null && state.start !== null,
  };
  const reachable = (i: number) => (i === 0 ? true : (Array.from({ length: i }, (_, k) => k as 0 | 1 | 2)).every((k) => valid[k]));

  const go = useCallback(
    (to: Step) => {
      setDir(to > step ? 1 : -1);
      setSheet(false);
      goto(to);
    },
    [goto, step],
  );

  // New step: back to top, and move focus to its heading for screen-reader users.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    const id = setTimeout(() => ref.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(id);
  }, [step]);

  const submit = async () => {
    if (submitting || state.date === null || state.start === null || state.stylist === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookingService.createBooking({
        serviceIds: state.serviceIds,
        stylist: state.stylist,
        date: state.date,
        start: state.start,
        customer: state.details,
      });
      setDir(1);
      confirmed(booking);
    } catch (e) {
      if (e instanceof BookingError && e.code === "slot-unavailable") {
        setError(b.errors["slot-unavailable"]);
        setTime(null);
        go(2);
      } else {
        setError(b.errors.generic);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step < 3) go((step + 1) as Step);
  };

  const continueDisabled = step < 3 ? !valid[step as 0 | 1 | 2] : submitting;
  const continueLabel = step === 3 ? (submitting ? b.confirming : b.confirm) : b.continue;

  // Render function rather than a nested component, so the button keeps focus across renders.
  const continueButton = (className = "") => (
    <button
      type={step === 3 ? "submit" : "button"}
      form={step === 3 ? DETAILS_FORM_ID : undefined}
      onClick={step === 3 ? undefined : next}
      disabled={continueDisabled}
      aria-disabled={continueDisabled}
      className={`group label inline-flex h-14 items-center justify-between gap-6 bg-oxblood px-7 text-bone transition-colors duration-500 hover:bg-oxblood-deep disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/45 ${className}`}
    >
      {continueLabel}
      <Arrow />
    </button>
  );

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={b.dialogLabel}
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-bone lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32vw)]"
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
      animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
      exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.95, ease: CURTAIN }}
    >
      {/* ───────── Main column (bone) ───────── */}
      <div data-theme="light" className="relative flex min-h-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-line px-4 sm:px-6 lg:h-20 lg:px-10">
          <div className="flex items-center gap-6">
            <Wordmark className="hidden text-[1.5rem] leading-none lg:inline" />
            <p className="label tnum lg:hidden" aria-live="polite">
              {done ? (
                <span className="text-detail">{b.done.kicker}</span>
              ) : (
                <>
                  <span className="text-detail">0{step + 1} / 04</span> <span className="ml-2">{b.steps[step]}</span>
                </>
              )}
            </p>
          </div>

          {/* Desktop step index */}
          {!done && (
            <nav aria-label={b.title} className="hidden lg:block">
              <ol className="flex items-center gap-8">
                {b.steps.map((label, i) => {
                  const current = i === step;
                  const can = reachable(i) && !current;
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        disabled={!can}
                        onClick={() => go(i as Step)}
                        aria-current={current ? "step" : undefined}
                        className={`label flex h-11 items-center gap-2 transition-colors ${
                          current ? "text-fg" : i < step ? "text-muted hover:text-fg" : "text-muted/50"
                        }`}
                      >
                        <span className="tnum text-detail">0{i + 1}</span>
                        <span className="relative">
                          {label}
                          {current && <motion.span layoutId="step-underline" className="absolute -bottom-2 left-0 h-px w-full bg-oxblood" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          <button
            type="button"
            onClick={close}
            aria-label={b.close}
            className="label -mr-2 flex h-11 items-center gap-3 px-2 text-fg"
          >
            <span className="hidden sm:inline">{b.close}</span>
            <span aria-hidden className="relative block h-5 w-5">
              <span className="absolute left-0 top-1/2 h-px w-5 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-px w-5 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        {/* Mobile progress + demo note */}
        <div className="shrink-0 lg:hidden">
          <div className="h-[2px] bg-line">
            <motion.div
              className="h-full bg-oxblood"
              animate={{ width: `${((Math.min(step, 3) + 1) / 4) * 100}%` }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          </div>
          <p className="label px-4 py-2 text-center text-[0.6rem] text-muted sm:px-6">{b.demo}</p>
        </div>

        {/* Step content */}
        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:max-w-4xl lg:px-10 lg:pb-24 lg:pt-14">
            {step === 2 && error && <Notice tone="warn">{error}</Notice>}
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                initial={{ opacity: 0, x: reduce ? 0 : 48 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : -32 * dir }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {step === 0 && <StepServices />}
                {step === 1 && <StepStylist />}
                {step === 2 && <StepDateTime />}
                {step === 3 && <StepDetails onSubmit={submit} error={error && step === 3 ? error : null} />}
                {step === 4 && <StepDone />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop footer */}
        {!done && (
          <div className="hidden h-24 shrink-0 items-center justify-between gap-6 border-t border-line px-10 lg:flex">
            <p className="label max-w-xs text-muted">{b.demo}</p>
            <div className="flex items-center gap-8">
              {step > 0 && (
                <button type="button" onClick={() => go((step - 1) as Step)} className="label h-11 text-muted hover:text-fg">
                  {b.back}
                </button>
              )}
              {continueButton()}
            </div>
          </div>
        )}

        {/* Mobile: sticky summary + thumb-reach actions */}
        {!done && (
          <div className="relative z-10 shrink-0 border-t border-line bg-bone pb-[env(safe-area-inset-bottom)] lg:hidden">
            <AnimatePresence>
              {sheet && (
                <motion.div
                  id="booking-sheet"
                  data-theme="dark"
                  className="absolute inset-x-0 bottom-full max-h-[70svh] overflow-y-auto px-4 pb-6 pt-6 sm:px-6"
                  initial={{ y: "100%", opacity: reduce ? 0 : 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: reduce ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: CURTAIN }}
                  style={{ zIndex: -1 }}
                >
                  <Summary />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              aria-expanded={sheet}
              aria-controls="booking-sheet"
              onClick={() => setSheet((s) => !s)}
              className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6"
            >
              <span className="label tnum text-left text-muted">
                {d.services.length ? `${plural(b.summary.count, d.services.length)} · ${d.duration}` : b.summary.empty}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-display text-[1.5rem] leading-none tnum" aria-live="polite">
                  {d.services.length ? d.price : ""}
                </span>
                <span className="sr-only">{sheet ? b.summary.hide : b.summary.show}</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden className={`transition-transform duration-500 ${sheet ? "" : "rotate-180"}`}>
                  <path d="m1 7 5-5 5 5" stroke="currentColor" />
                </svg>
              </span>
            </button>
            <div className="flex gap-2 px-4 pb-4 sm:px-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => go((step - 1) as Step)}
                  aria-label={b.back}
                  className="flex h-14 w-14 shrink-0 items-center justify-center border border-line-strong"
                >
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                    <path d="M5 1 1 5l4 4M1 5h13" stroke="currentColor" />
                  </svg>
                </button>
              )}
              {continueButton("flex-1")}
            </div>
          </div>
        )}
      </div>

      {/* ───────── Summary column (ink) — desktop ───────── */}
      <aside data-theme="dark" aria-label={b.summary.title} className="relative hidden min-h-0 overflow-y-auto px-10 pb-10 pt-28 lg:block">
        <div aria-hidden className="absolute inset-y-0 left-0 w-px bg-line" />
        <Summary />
      </aside>
    </motion.div>
  );
}
