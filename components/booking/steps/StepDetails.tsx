"use client";

import { useState } from "react";
import { validateDetails, type CustomerDetails, type DetailsErrors } from "@/lib/booking";
import { useI18n } from "@/lib/i18n/provider";
import { useBooking } from "../BookingProvider";
import { Notice, StepHeading } from "./StepHeading";

export const DETAILS_FORM_ID = "booking-details";

type Field = "name" | "email" | "phone";

export function StepDetails({ onSubmit, error }: { onSubmit: () => void; error: string | null }) {
  const { dict } = useI18n();
  const { state, setDetails } = useBooking();
  const b = dict.booking.details;
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const errors: DetailsErrors = validateDetails(state.details);
  const show = (k: keyof CustomerDetails) => (submitted || touched[k]) && errors[k];
  const message = (k: keyof CustomerDetails) => {
    const e = errors[k];
    if (!e) return "";
    if (k === "consent") return b.errors.consent;
    return b.errors[e];
  };

  const fields: { k: Field; type: string; autoComplete: string; inputMode?: "email" | "tel" }[] = [
    { k: "name", type: "text", autoComplete: "name" },
    { k: "email", type: "email", autoComplete: "email", inputMode: "email" },
    { k: "phone", type: "tel", autoComplete: "tel", inputMode: "tel" },
  ];

  return (
    <form
      id={DETAILS_FORM_ID}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        const first = (["name", "email", "phone", "note", "consent"] as const).find((k) => errors[k]);
        if (first) {
          document.getElementById(`f-${first}`)?.focus();
          return;
        }
        onSubmit();
      }}
    >
      <StepHeading index={3} title={b.title} hint={b.hint} />
      {error && <Notice tone="warn">{error}</Notice>}

      <div className="grid max-w-xl gap-8">
        {fields.map((f) => (
          <div key={f.k}>
            <label htmlFor={`f-${f.k}`} className="label text-detail">
              {b[f.k]}
            </label>
            <input
              id={`f-${f.k}`}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              value={state.details[f.k]}
              onChange={(e) => setDetails({ [f.k]: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, [f.k]: true }))}
              aria-invalid={Boolean(show(f.k))}
              aria-describedby={show(f.k) ? `e-${f.k}` : undefined}
              aria-required
              className={`mt-2 block h-14 w-full border-b bg-transparent font-display text-[1.5rem] outline-none transition-[border-color,box-shadow] placeholder:text-muted/50 focus:border-fg focus:shadow-[inset_0_-1px_0_var(--fg)] ${
                show(f.k) ? "border-oxblood" : "border-line-strong"
              }`}
            />
            {show(f.k) && (
              <p id={`e-${f.k}`} className="mt-2 text-[0.85rem] text-oxblood">
                {message(f.k)}
              </p>
            )}
          </div>
        ))}

        <div>
          <label htmlFor="f-note" className="label flex justify-between text-detail">
            <span>{b.note}</span>
            <span className="text-muted">{b.optional}</span>
          </label>
          <textarea
            id="f-note"
            rows={3}
            maxLength={500}
            value={state.details.note}
            placeholder={b.notePlaceholder}
            onChange={(e) => setDetails({ note: e.target.value })}
            aria-invalid={Boolean(show("note"))}
            className="mt-2 block w-full resize-none border-b border-line-strong bg-transparent py-3 text-[1rem] leading-relaxed outline-none placeholder:text-muted/70 focus:border-fg focus:shadow-[inset_0_-1px_0_var(--fg)]"
          />
        </div>

        <div>
          <label htmlFor="f-consent" className="flex cursor-pointer items-start gap-4">
            <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
              <input
                id="f-consent"
                type="checkbox"
                checked={state.details.consent}
                onChange={(e) => setDetails({ consent: e.target.checked })}
                aria-invalid={Boolean(show("consent"))}
                aria-describedby={show("consent") ? "e-consent" : undefined}
                className={`peer absolute inset-0 h-6 w-6 cursor-pointer appearance-none border checked:border-oxblood checked:bg-oxblood ${
                  show("consent") ? "border-oxblood" : "border-line-strong"
                }`}
              />
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden className="pointer-events-none relative text-bone opacity-0 peer-checked:opacity-100">
                <path d="m1 4.5 3.2 3L11 1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="text-[0.85rem] leading-relaxed text-muted">{b.consent}</span>
          </label>
          {show("consent") && (
            <p id="e-consent" className="mt-2 pl-10 text-[0.85rem] text-oxblood">
              {message("consent")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
