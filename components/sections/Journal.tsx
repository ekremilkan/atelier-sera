"use client";

import Image from "next/image";
import { useRef } from "react";
import { FadeUp, RevealImage, RevealLines } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT, JOURNAL } from "@/lib/content";
import { useI18n } from "@/lib/i18n/provider";

/** Native horizontal scroll (snap on touch), plus mouse drag-to-scroll on desktop. */
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ down: false, x: 0, left: 0, moved: false });
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      state.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = state.current;
      if (!s.down || !ref.current) return;
      const dx = e.clientX - s.x;
      if (Math.abs(dx) > 4) s.moved = true;
      ref.current.scrollLeft = s.left - dx;
    },
    onPointerUp: () => {
      state.current.down = false;
    },
    onPointerLeave: () => {
      state.current.down = false;
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (state.current.moved) e.preventDefault();
    },
  };
}

export function Journal() {
  const { dict } = useI18n();
  const drag = useDragScroll();

  return (
    <section data-theme="dark" className="relative overflow-hidden py-24 lg:py-40" aria-labelledby="journal-title">
      <div className="mx-auto grid max-w-[110rem] gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:items-end lg:px-10">
        <div className="lg:col-span-8">
          <SectionLabel index={dict.journal.index} label={dict.journal.label} />
          <div id="journal-title">
            <RevealLines text={dict.journal.title} className="mt-6 font-display text-huge" />
          </div>
        </div>
        <FadeUp className="lg:col-span-4 lg:justify-self-end lg:pb-3">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="label inline-flex h-11 items-center gap-3 border-b border-line-strong text-fg hover:border-fg"
          >
            {dict.journal.follow}
          </a>
        </FadeUp>
      </div>

      <div
        {...drag}
        className="no-scrollbar mt-14 flex cursor-grab snap-x snap-mandatory items-end gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 active:cursor-grabbing sm:gap-6 sm:scroll-px-6 sm:px-6 lg:mt-20 lg:snap-none lg:gap-8 lg:px-10"
        role="region"
        aria-label={dict.journal.label}
        tabIndex={0}
      >
        {JOURNAL.map((item, i) => {
          const copy = dict.journal.items[i];
          const tall = item.ratio === "4/5";
          return (
            <figure
              key={item.no}
              className={`shrink-0 snap-start ${tall ? "w-[64vw] sm:w-[34vw] lg:w-[24vw]" : "w-[52vw] sm:w-[28vw] lg:w-[19vw]"} ${
                i % 3 === 1 ? "lg:mb-24" : ""
              }`}
            >
              <RevealImage
                delay={(i % 4) * 0.08}
                from={i % 2 ? "top" : "bottom"}
                className="relative overflow-hidden bg-ink-2"
                style={{ aspectRatio: item.ratio }}
              >
                  <Image
                    src={item.src}
                    alt={`${copy.title} — ${copy.by}`}
                    fill
                    sizes="(min-width:1024px) 24vw, 64vw"
                    className="graded pointer-events-none object-cover"
                    draggable={false}
                  />
              </RevealImage>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                <span className="font-display text-[1.15rem] italic leading-tight">{copy.title}</span>
                <span className="label shrink-0 tnum text-detail">
                  No. {item.no} · {copy.by}
                </span>
              </figcaption>
            </figure>
          );
        })}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
      <p className="sr-only">{CONTACT.instagram}</p>
    </section>
  );
}
