"use client";

import { useBooking, type OpenOptions } from "@/components/booking/BookingProvider";

/**
 * The premium CTA: a sharp oxblood block, small tracked caps, and a hairline
 * arrow that extends on hover. `variant="line"` is the quieter text version.
 */
export function BookButton({
  children,
  options,
  variant = "solid",
  className = "",
  size = "md",
  onBeforeOpen,
}: {
  children: React.ReactNode;
  options?: OpenOptions;
  variant?: "solid" | "line" | "bone";
  className?: string;
  size?: "sm" | "md" | "lg";
  onBeforeOpen?: () => void;
}) {
  const { open } = useBooking();
  const sizes = { sm: "h-10 px-4 gap-3", md: "h-12 px-6 gap-4", lg: "h-14 px-7 gap-5" }[size];
  const styles = {
    solid: "bg-oxblood text-bone hover:bg-oxblood-deep",
    bone: "bg-bone text-ink hover:bg-bone-2",
    line: "text-fg border-b border-line-strong hover:border-fg px-0! h-auto! pb-2",
  }[variant];
  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.();
        open(options);
      }}
      className={`group label inline-flex items-center whitespace-nowrap transition-colors duration-500 ${sizes} ${styles} ${className}`}
    >
      <span>{children}</span>
      <Arrow />
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`relative inline-flex h-px w-6 items-center bg-current transition-[width] duration-500 ease-[var(--ease-editorial)] group-hover:w-10 ${className}`}>
      <span className="absolute right-0 h-[7px] w-[7px] translate-x-[1px] rotate-45 border-r border-t border-current" />
    </span>
  );
}
