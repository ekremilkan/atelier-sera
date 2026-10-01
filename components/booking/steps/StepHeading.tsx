import { Rich } from "@/components/ui/Rich";

export function StepHeading({ title, hint, index }: { title: string; hint?: string; index: number }) {
  return (
    <header className="mb-8 lg:mb-12">
      <p className="label tnum text-detail">0{index + 1}</p>
      <h2
        tabIndex={-1}
        data-step-heading
        className="mt-3 font-display text-[2.6rem] leading-[0.95] outline-none sm:text-[3.25rem] lg:text-[4rem]"
      >
        <Rich text={title} />
      </h2>
      {hint && <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted">{hint}</p>}
    </header>
  );
}

export function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors duration-300 ${
        on ? "border-oxblood bg-oxblood text-bone" : "border-line-strong"
      }`}
    >
      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className={on ? "opacity-100" : "opacity-0"}>
        <path d="m1 4.5 3.2 3L11 1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </span>
  );
}

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <p
      role="status"
      className={`mb-6 flex gap-3 border-l-2 py-2 pl-4 text-[0.9rem] leading-relaxed ${
        tone === "warn" ? "border-oxblood text-fg" : "border-champagne-deep text-muted"
      }`}
    >
      {children}
    </p>
  );
}
