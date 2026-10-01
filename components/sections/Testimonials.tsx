"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { EASE, FadeUp } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useI18n } from "@/lib/i18n/provider";

export function Testimonials() {
  const { dict } = useI18n();
  const reduce = useReducedMotion();
  const items = dict.testimonials.items;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + items.length) % items.length);
  };
  const q = items[i];

  return (
    <section data-theme="light" className="relative overflow-hidden py-24 lg:py-40" aria-roledescription="carousel" aria-label={dict.testimonials.label}>
      <div className="mx-auto grid max-w-[110rem] gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-x-10 lg:px-10">
        <div className="flex flex-col justify-between gap-10 lg:col-span-3">
          <SectionLabel index={dict.testimonials.index} label={dict.testimonials.label} />
          <FadeUp className="hidden items-center gap-6 lg:flex">
            <Controls i={i} total={items.length} go={go} />
          </FadeUp>
        </div>

        <div className="relative lg:col-span-9">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-16 select-none font-display text-[10rem] leading-none text-oxblood sm:-top-24 sm:text-[14rem] lg:-left-20 lg:-top-28 lg:text-[18rem]"
          >
            “
          </span>
          <div className="relative min-h-[22rem] sm:min-h-[17rem] lg:min-h-[19rem]" aria-live="polite">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.figure
                key={i}
                custom={dir}
                initial={{ opacity: 0, y: reduce ? 0 : 24 * dir }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -16 * dir }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <blockquote className="font-display text-mid italic">
                  <p>{q.quote}</p>
                </blockquote>
                <figcaption className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="font-display text-[1.25rem]">— {q.name}</span>
                  <span className="label text-muted">{q.place}</span>
                  <span className="label text-detail">· {dict.testimonials.fictional}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-10 flex items-center gap-6 lg:hidden">
            <Controls i={i} total={items.length} go={go} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Controls({ i, total, go }: { i: number; total: number; go: (d: number) => void }) {
  const { dict } = useI18n();
  const btn =
    "flex h-12 w-12 items-center justify-center rounded-full border border-line-strong transition-colors duration-500 hover:border-fg hover:bg-ink hover:text-bone";
  return (
    <>
      <span className="label tnum">
        0{i + 1} <span className="text-muted">/ 0{total}</span>
      </span>
      <div className="flex gap-2">
        <button type="button" className={btn} onClick={() => go(-1)} aria-label={dict.testimonials.prev}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path d="M5 1 1 5l4 4M1 5h13" stroke="currentColor" />
          </svg>
        </button>
        <button type="button" className={btn} onClick={() => go(1)} aria-label={dict.testimonials.next}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path d="m9 1 4 4-4 4M13 5H0" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </>
  );
}
