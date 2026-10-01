"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { Arrow } from "@/components/ui/BookButton";
import { CURTAIN, FadeUp, RevealImage, RevealLines, Rule } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatDuration } from "@/lib/booking/time";
import { SERVICE_IMAGES } from "@/lib/content";
import { formatPrice, t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";

export function Services() {
  const { dict, locale } = useI18n();
  const { catalog, open, state } = useBooking();
  const reduce = useReducedMotion();
  const [active, setActive] = useState("signature-cut");
  const activeService = catalog.services.find((s) => s.id === active)!;

  return (
    <section id="menu" data-theme="light" className="relative">
      <div className="mx-auto grid max-w-[110rem] grid-cols-[minmax(0,1fr)] gap-y-12 px-4 pb-24 pt-24 sm:px-6 lg:grid-cols-12 lg:gap-x-10 lg:px-10 lg:pb-40 lg:pt-0">
        {/* Left: sticky title + image that follows the hovered service */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:pb-10 lg:pt-28">
            <SectionLabel index={dict.services.index} label={dict.services.label} />
            <RevealLines text={dict.services.title} className="mt-6 font-display text-huge" />
            <FadeUp className="mt-8 max-w-sm text-[0.975rem] leading-relaxed text-muted lg:hidden">{dict.services.intro}</FadeUp>

            <div className="relative mt-auto hidden self-start lg:block">
              <RevealImage className="relative aspect-[4/5] h-[min(46vh,30rem)] overflow-hidden bg-bone-2">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
                    animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.9, ease: CURTAIN }}
                  >
                    <Image
                      src={SERVICE_IMAGES[active]}
                      alt=""
                      fill
                      sizes="26rem"
                      className="graded object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </RevealImage>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="label text-muted" aria-hidden>
                  {activeService.name[locale]}
                </p>
                <p className="label tnum text-detail" aria-hidden>
                  {formatDuration(activeService.durationMin, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: the menu */}
        <div className="lg:col-span-7 lg:col-start-6 lg:pt-32 xl:col-span-6 xl:col-start-7">
          {/* Mobile category index */}
          <nav
            aria-label={dict.services.label}
            className="no-scrollbar sticky top-16 z-10 -mx-4 mb-8 flex gap-2 overflow-x-auto border-y border-line bg-bone px-4 py-3 sm:-mx-6 sm:px-6 lg:hidden"
          >
            {catalog.categories.map((c, i) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="label flex h-10 shrink-0 items-center gap-2 border border-line px-4 text-fg"
              >
                <span className="tnum text-detail">0{i + 1}</span>
                {c.name[locale]}
              </a>
            ))}
          </nav>

          <FadeUp className="mb-16 hidden max-w-md text-[1.05rem] leading-relaxed text-muted lg:block">{dict.services.intro}</FadeUp>

          {catalog.categories.map((cat, ci) => {
            const items = catalog.services.filter((s) => s.category === cat.id);
            return (
              <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-36 pb-16 last:pb-0 lg:scroll-mt-28 lg:pb-24">
                {/* Mobile: a cropped band of imagery per category */}
                <RevealImage className="relative mb-6 aspect-[5/2] overflow-hidden lg:hidden">
                  <Image src={SERVICE_IMAGES[items[0].id]} alt="" fill sizes="100vw" className="graded object-cover" />
                </RevealImage>
                <div className="flex items-end justify-between gap-6 pb-5">
                  <h3 className="flex items-baseline gap-4">
                    <span className="label tnum text-detail">0{ci + 1}</span>
                    <span className="font-display text-[2.25rem] leading-none sm:text-[2.75rem]">{cat.name[locale]}</span>
                  </h3>
                  <span className="label tnum text-muted">
                    {items.length}
                  </span>
                </div>
                <Rule className="bg-line-strong!" />
                <ul>
                  {items.map((s) => {
                    const price = formatPrice(s.priceEUR, locale, s.priceFrom, dict.services.from);
                    const duration = formatDuration(s.durationMin, locale);
                    const inBasket = state.serviceIds.includes(s.id);
                    return (
                      <li key={s.id} className="border-b border-line">
                        <button
                          type="button"
                          data-cursor={dict.services.book}
                          onMouseEnter={() => setActive(s.id)}
                          onFocus={() => setActive(s.id)}
                          onClick={() => open({ serviceIds: [s.id] })}
                          aria-label={t(dict.services.rowAria, { name: s.name[locale], duration, price })}
                          className="group grid w-full grid-cols-[1fr_auto] items-start gap-x-6 py-6 text-left lg:py-7"
                        >
                          <span className="min-w-0">
                            <span className="flex items-center">
                              <span
                                aria-hidden
                                className={`h-px shrink-0 bg-oxblood transition-[width,margin] duration-500 ease-[var(--ease-editorial)] ${
                                  inBasket ? "mr-3 w-6" : "mr-0 w-0 group-hover:mr-3 group-hover:w-6"
                                }`}
                              />
                              <span className="font-display text-[1.5rem] leading-tight transition-transform duration-500 sm:text-[1.875rem]">
                                {s.name[locale]}
                              </span>
                            </span>
                            <span className="mt-2 block max-w-md text-[0.9rem] leading-relaxed text-muted">
                              {s.description[locale]}
                            </span>
                          </span>
                          <span className="flex flex-col items-end gap-2 pt-1">
                            <span className="font-display text-[1.5rem] leading-none tnum sm:text-[1.75rem]">{price}</span>
                            <span className="label tnum text-detail">{duration}</span>
                            <span className="label mt-2 hidden items-center gap-3 text-oxblood opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 lg:inline-flex">
                              {dict.services.book}
                              <Arrow />
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <p className="mt-10 max-w-md text-[0.8125rem] leading-relaxed text-muted">{dict.services.footnote}</p>
        </div>
      </div>
    </section>
  );
}
