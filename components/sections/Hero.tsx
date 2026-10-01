"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BookButton } from "@/components/ui/BookButton";
import { Photo } from "@/components/ui/Photo";
import { EASE, RevealImage, RevealLines } from "@/components/ui/Reveal";
import { bookingService } from "@/lib/booking/service";
import { formatTime } from "@/lib/booking/time";
import { IMG } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { useI18n } from "@/lib/i18n/provider";

function NextSlot() {
  const { dict, locale } = useI18n();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    bookingService.getNextAvailable({ serviceIds: ["signature-cut"], stylist: "any" }).then((r) => {
      if (!alive || !r) return;
      const day = relativeDay(r.date, locale, { today: dict.hero.today, tomorrow: dict.hero.tomorrow });
      setLabel(`${day}, ${formatTime(r.slot.start)}`);
    });
    return () => {
      alive = false;
    };
  }, [locale, dict.hero.today, dict.hero.tomorrow]);

  return (
    <div className="flex items-baseline gap-4" aria-live="polite">
      <span className="label text-detail">{dict.hero.nextSlot}</span>
      <span aria-hidden className="h-px flex-1 translate-y-[-0.3em] bg-line-strong" />
      <span className="relative whitespace-nowrap font-display text-[1.6rem] leading-none tnum sm:text-[1.875rem]">
        <span className="absolute -left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-oxblood ring-4 ring-oxblood/25" />
        {label ?? <span className="inline-block w-36 opacity-30">—</span>}
      </span>
    </div>
  );
}

export function Hero() {
  const { dict } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);

  return (
    <section
      id="top"
      ref={ref}
      data-theme="dark"
      className="relative overflow-hidden pb-16 pt-20 lg:min-h-[100svh] lg:pb-0 lg:pt-0"
    >
      {/* Kicker */}
      <motion.p
        className="label relative z-20 px-4 text-detail sm:px-6 lg:absolute lg:left-10 lg:top-32 lg:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
      >
        {dict.hero.kicker}
      </motion.p>

      {/* Portrait */}
      <motion.div
        style={{ y: imgY }}
        className="relative ml-auto mt-6 w-[80%] sm:w-[62%] lg:absolute lg:left-[46%] lg:top-[12vh] lg:mt-0 lg:w-[30vw]"
      >
        <RevealImage immediate delay={0.15} className="relative aspect-[3/4] overflow-hidden lg:h-[74vh] lg:aspect-auto">
          <Photo src={IMG.hero} alt={dict.hero.imageAlt} sizes="(min-width:1024px) 32vw, 80vw" priority position="50% 35%" />
        </RevealImage>
        <motion.p
          className="label mt-3 hidden text-[0.625rem] text-muted lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          {dict.hero.caption}
        </motion.p>
      </motion.div>

      {/* Headline — overlaps the portrait */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 -mt-[38vw] px-4 sm:-mt-[30vw] sm:px-6 lg:absolute lg:left-10 lg:top-[17vh] lg:mt-0 lg:px-0"
      >
        <RevealLines
          as="h1"
          immediate
          delay={0.45}
          stagger={0.11}
          text={dict.hero.headline}
          className="font-display text-mega text-bone max-sm:text-[19vw] lg:text-[clamp(4.25rem,min(15vw,21vh),15rem)]"
          lineClassName={(i) => (i === 1 ? "pl-[14vw] lg:pl-[21vw] text-champagne" : i === 2 ? "pl-[4vw] lg:pl-[9vw]" : undefined)}
        />
      </motion.div>

      {/* Intro: a narrow magazine column beside the portrait on desktop */}
      <motion.p
        className="relative z-20 mt-10 max-w-md px-4 text-[0.975rem] leading-relaxed text-muted sm:px-6 lg:absolute lg:left-[calc(76vw+2.5rem)] lg:top-[12vh] lg:mt-0 lg:w-[14vw] lg:px-0 lg:text-[0.875rem]"
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 1.05 }}
      >
        {dict.hero.intro}
      </motion.p>

      {/* Lower-left: the detail and the call to action */}
      <motion.div
        className="relative z-20 mt-10 grid gap-8 px-4 sm:max-w-md sm:px-6 lg:absolute lg:bottom-[8vh] lg:left-10 lg:mt-0 lg:w-[30vw] lg:max-w-[26rem] lg:px-0"
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 1.15 }}
      >
        <NextSlot />
        <BookButton size="lg" className="w-full justify-between sm:w-auto sm:justify-start sm:self-start">
          {dict.hero.cta}
        </BookButton>
      </motion.div>

      {/* Vertical caption on the right edge */}
      <motion.p
        aria-hidden
        className="label absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-180 text-muted [writing-mode:vertical-rl] lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        {dict.hero.vertical}
      </motion.p>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-[9vh] right-10 hidden items-center gap-4 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <span className="label text-muted">{dict.hero.scroll}</span>
        <span className="relative block h-16 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 block h-1/2 bg-champagne"
            animate={reduce ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, ease: EASE, repeat: Infinity, repeatDelay: 0.4 }}
          />
        </span>
      </motion.div>
    </section>
  );
}
