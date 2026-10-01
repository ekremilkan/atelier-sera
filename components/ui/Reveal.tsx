"use client";

import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useRef, type ElementType } from "react";
import { Rich, plain } from "./Rich";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const CURTAIN = [0.76, 0, 0.24, 1] as const;

/**
 * Headline that rises line by line out of a mask.
 * `text` uses `|` for line breaks and `*word*` for the italic accent.
 */
export function RevealLines({
  text,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  lineClassName?: (index: number) => string | undefined;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const show = immediate || inView;
  const lines = text.split("|");

  return (
    <Tag ref={ref} className={className} aria-label={plain(text)}>
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          // Generous padding so italic overhangs and descenders aren't clipped by the mask.
          className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] px-[0.06em] -mx-[0.06em] ${lineClassName?.(i) ?? ""}`}
        >
          <motion.span
            className="block will-change-transform"
            initial={reduce ? { opacity: 0 } : { y: "108%", rotate: 1.5 }}
            animate={show ? (reduce ? { opacity: 1 } : { y: "0%", rotate: 0 }) : undefined}
            transition={{ duration: reduce ? 0.4 : 1.1, ease: EASE, delay: delay + i * stagger }}
          >
            <Rich text={line} />
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Image frame that opens with a vertical clip wipe while the photo settles from a slow zoom. */
export function RevealImage({
  children,
  className,
  delay = 0,
  from = "bottom",
  immediate = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right";
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const show = immediate || inView;
  const hidden = {
    bottom: "inset(100% 0% 0% 0%)",
    top: "inset(0% 0% 100% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];

  // Same element tree either way (keeps hydration stable); reduced motion just fades.
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduce ? { opacity: 0 } : { clipPath: hidden }}
      animate={show ? (reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }) : undefined}
      transition={{ duration: reduce ? 0.5 : 1.3, ease: CURTAIN, delay: reduce ? 0 : delay }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduce ? 1 : 1.14 }}
        animate={show ? { scale: 1 } : undefined}
        transition={{ duration: 1.9, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Small text block that fades up once in view. */
export function FadeUp({
  children,
  delay = 0,
  className,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself from left to right. */
export function Rule({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={`hairline origin-left ${className}`}
      initial={{ scaleX: reduce ? 1 : 0 }}
      animate={inView ? { scaleX: 1 } : undefined}
      transition={{ duration: 1.4, ease: CURTAIN, delay }}
    />
  );
}
