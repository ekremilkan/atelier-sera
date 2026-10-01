"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { BookButton } from "@/components/ui/BookButton";
import { Photo } from "@/components/ui/Photo";
import { CURTAIN, EASE, FadeUp, RevealImage, RevealLines } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useDialog } from "@/components/ui/useDialog";
import type { Stylist } from "@/lib/booking/types";
import { TEAM_MEDIA } from "@/lib/content";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";

type MemberKey = keyof ReturnType<typeof useI18n>["dict"]["team"]["members"];

/** Desktop composition: staggered, asymmetric — no two portraits share a size or baseline. */
const LAYOUT: Record<string, { cell: string; ratio: string }> = {
  mara: { cell: "lg:col-start-1 lg:col-span-5 lg:row-start-1", ratio: "aspect-[3/4]" },
  jonas: { cell: "lg:col-start-8 lg:col-span-4 lg:row-start-1 lg:mt-56", ratio: "aspect-[4/5]" },
  ines: { cell: "lg:col-start-2 lg:col-span-4 lg:row-start-2 lg:mt-24", ratio: "aspect-[4/5]" },
  yuki: { cell: "lg:col-start-7 lg:col-span-5 lg:row-start-2 lg:mt-72", ratio: "aspect-[3/4]" },
};

function Member({
  stylist,
  index,
  onOpen,
}: {
  stylist: Stylist;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { dict, locale } = useI18n();
  const reduce = useReducedMotion();
  const media = TEAM_MEDIA[stylist.id];
  const copy = dict.team.members[stylist.id as MemberKey];
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0);
  const first = stylist.name.split(" ")[0];

  // While hovered, the portrait gives way to a slow slideshow of their work.
  useEffect(() => {
    if (!hover || reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(id);
  }, [hover, reduce]);
  const frame = hover && !reduce ? (tick % media.work.length) + 1 : 0;

  const layout = LAYOUT[stylist.id];
  return (
    <article className={`w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto ${layout.cell}`}>
      <button
        type="button"
        data-cursor={dict.team.viewWork}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => onOpen(stylist.id)}
        className="group block w-full text-left"
        aria-haspopup="dialog"
        aria-label={`${stylist.name} — ${stylist.role[locale]}. ${dict.team.viewWork}`}
      >
        <RevealImage delay={index * 0.08} className={`relative overflow-hidden bg-ink-2 ${layout.ratio}`}>
          <Photo src={media.portrait} alt={copy.alt} sizes="(min-width:1024px) 40vw, 78vw" position={media.position} />
          {media.work.map((src, i) => (
            <motion.div
              key={src}
              aria-hidden
              className="absolute inset-0"
              initial={false}
              animate={{ clipPath: frame === i + 1 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
              transition={{ duration: 0.9, ease: CURTAIN }}
            >
              <Image src={src} alt="" fill sizes="40vw" className="graded object-cover" />
            </motion.div>
          ))}
          <span className="label absolute right-4 top-4 tnum text-bone/80">
            {frame === 0 ? `0${index + 1}` : `0${frame} / 0${media.work.length}`}
          </span>
        </RevealImage>

        {/* Name overlaps the bottom edge of the frame */}
        <div className="relative z-10 -mt-[0.55em] pl-4 font-display text-big lg:pl-6">
          <span className="block transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:translate-x-3">
            {first}
            <em className="text-champagne">.</em>
          </span>
        </div>
      </button>
      <div className="mt-5 grid gap-3 pl-4 lg:pl-6">
        <p className="label flex items-center gap-3 text-detail">
          <span>{stylist.name}</span>
          <span aria-hidden className="h-px w-6 bg-current opacity-60" />
          <span>{stylist.role[locale]}</span>
        </p>
        <p className="max-w-xs font-display text-[1.25rem] italic leading-snug text-fg/90">{copy.line}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
          <BookButton variant="line" options={{ stylistId: stylist.id }}>
            {t(dict.team.bookWith, { name: first })}
          </BookButton>
          <button
            type="button"
            onClick={() => onOpen(stylist.id)}
            className="label h-11 text-muted underline decoration-line-strong underline-offset-8 hover:text-fg lg:hidden"
          >
            {dict.team.viewWork}
          </button>
        </div>
      </div>
    </article>
  );
}

function MemberPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { dict, locale } = useI18n();
  const { catalog } = useBooking();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const stylist = catalog.stylists.find((s) => s.id === id)!;
  const media = TEAM_MEDIA[id];
  const copy = dict.team.members[id as MemberKey];
  const first = stylist.name.split(" ")[0];
  useDialog(ref, true, onClose);

  return (
    <motion.div className="fixed inset-0 z-[60]" initial="hidden" animate="show" exit="hidden">
      <motion.button
        type="button"
        aria-label={dict.team.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/70"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        transition={{ duration: 0.6 }}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-title"
        data-theme="light"
        className="absolute inset-0 overflow-y-auto overscroll-contain lg:left-auto lg:w-[min(64rem,62vw)]"
        variants={
          reduce
            ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
            : { hidden: { clipPath: "inset(0 0 0 100%)" }, show: { clipPath: "inset(0 0 0 0%)" } }
        }
        transition={{ duration: 0.9, ease: CURTAIN }}
      >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-bone px-4 sm:px-6 lg:h-20 lg:px-10">
          <SectionLabel index={dict.team.index} label={dict.team.label} />
          <button type="button" onClick={onClose} data-autofocus className="label -mr-2 flex h-11 items-center gap-3 px-2">
            {dict.team.close}
            <span aria-hidden className="relative block h-4 w-4">
              <span className="absolute left-0 top-1/2 h-px w-4 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-px w-4 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="grid gap-10 px-4 pb-32 pt-8 sm:px-6 lg:grid-cols-12 lg:gap-x-10 lg:px-10 lg:pb-16 lg:pt-12">
          <div className="relative aspect-[3/4] overflow-hidden lg:col-span-5">
            <Photo src={media.portrait} alt={copy.alt} sizes="(min-width:1024px) 26vw, 100vw" position={media.position} />
          </div>
          <div className="flex flex-col lg:col-span-7">
            <p className="label text-detail">{stylist.role[locale]}</p>
            <h2 id="member-title" className="mt-4 font-display text-huge">
              {first}
              <em className="text-oxblood">.</em>
            </h2>
            <p className="label mt-2 text-muted">{stylist.name}</p>
            <p className="mt-8 font-display text-[1.6rem] italic leading-snug">{copy.line}</p>
            <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-muted">{copy.bio}</p>
            <div className="mt-10 hidden lg:block">
              <BookButton size="lg" options={{ stylistId: id }} onBeforeOpen={onClose}>
                {t(dict.team.bookWith, { name: first })}
              </BookButton>
            </div>
          </div>

          <div className="lg:col-span-12">
            <p className="label mb-5 flex items-center gap-3 text-detail">
              <span>{dict.team.selected}</span>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
              {media.work.map((src, i) => (
                <motion.div
                  key={src}
                  className={`relative overflow-hidden ${
                    i === 0 ? "col-span-2 aspect-[4/3] lg:col-span-6 lg:aspect-[4/5]" : "aspect-[3/4] lg:col-span-3 lg:mt-24"
                  }`}
                  variants={{ hidden: { opacity: 0, y: reduce ? 0 : 30 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 1, ease: EASE, delay: 0.45 + i * 0.1 }}
                >
                  <Image src={src} alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="graded object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: thumb-reachable CTA */}
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bone p-4 sm:px-6 lg:hidden">
          <BookButton size="lg" options={{ stylistId: id }} onBeforeOpen={onClose} className="w-full justify-between">
            {t(dict.team.bookWith, { name: first })}
          </BookButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Team() {
  const { dict } = useI18n();
  const { catalog } = useBooking();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="artists" data-theme="dark" className="relative overflow-hidden py-24 lg:py-40">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionLabel index={dict.team.index} label={dict.team.label} />
            <RevealLines text={dict.team.title} className="mt-6 font-display text-mega" />
          </div>
          <FadeUp className="max-w-sm text-[0.975rem] leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:pb-4">
            {dict.team.intro}
          </FadeUp>
        </div>
      </div>

      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:mt-28 lg:grid lg:max-w-[110rem] lg:snap-none lg:grid-cols-12 lg:items-start lg:gap-x-10 lg:gap-y-0 lg:overflow-visible lg:px-10">
        {catalog.stylists.map((s, i) => (
          <Member key={s.id} stylist={s} index={i} onOpen={setOpenId} />
        ))}
      </div>

      <AnimatePresence>{openId && <MemberPanel key={openId} id={openId} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </section>
  );
}
