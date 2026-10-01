"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookButton } from "@/components/ui/BookButton";
import { Photo } from "@/components/ui/Photo";
import { EASE, FadeUp, RevealImage, RevealLines, Rule } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IMG } from "@/lib/content";
import { useI18n } from "@/lib/i18n/provider";

function CompareSlider() {
  const { dict } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });

  // A single, slow hint sweep the first time it scrolls into view.
  useEffect(() => {
    if (!inView || reduce || touched) return;
    const frames = [50, 28, 72, 50];
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= frames.length) return clearInterval(id);
      setPos(frames[i]);
    }, 900);
    return () => clearInterval(id);
  }, [inView, reduce, touched]);

  const fromPointer = useCallback((clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] cursor-ew-resize touch-pan-y select-none overflow-hidden bg-ink lg:aspect-auto lg:h-[min(88vh,62rem)]"
      onPointerDown={(e) => {
        setTouched(true);
        setDragging(true);
        (e.target as Element).setPointerCapture?.(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging && fromPointer(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <RevealImage className="absolute inset-0">
        {/* After */}
        <Photo src={IMG.transformation} alt={dict.transformation.alt} sizes="(min-width:1024px) 55vw, 100vw" position="40% 40%" />
        {/* Before — the same frame, graded down to flat box-dye black */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          transition={dragging ? { duration: 0 } : { duration: touched ? 0.25 : 0.9, ease: EASE }}
        >
          <Photo
            src={IMG.transformation}
            alt=""
            sizes="(min-width:1024px) 55vw, 100vw"
            position="40% 40%"
            className="[filter:grayscale(1)_brightness(.5)_contrast(1.35)_sepia(.12)]!"
          />
        </motion.div>
      </RevealImage>

      {/* Labels */}
      <span className="label pointer-events-none absolute left-4 top-4 bg-ink/60 px-2 py-1 text-bone">{dict.transformation.before}</span>
      <span className="label pointer-events-none absolute right-4 top-4 bg-ink/60 px-2 py-1 text-bone">{dict.transformation.after}</span>

      {/* Divider + handle */}
      <motion.div
        className="absolute inset-y-0 w-px bg-bone/90"
        animate={{ left: `${pos}%` }}
        transition={dragging ? { duration: 0 } : { duration: touched ? 0.25 : 0.9, ease: EASE }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={dict.transformation.sliderLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% ${dict.transformation.before}`}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 4;
            if (["ArrowLeft", "ArrowDown"].includes(e.key)) setPos((p) => Math.max(0, p - step));
            else if (["ArrowRight", "ArrowUp"].includes(e.key)) setPos((p) => Math.min(100, p + step));
            else if (e.key === "Home") setPos(0);
            else if (e.key === "End") setPos(100);
            else return;
            e.preventDefault();
            setTouched(true);
          }}
          className="absolute top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-champagne bg-ink/70 text-champagne backdrop-blur-[2px] focus-visible:outline-bone"
        >
          <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden>
            <path d="M5 1 1 5l4 4M21 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export function Transformation() {
  const { dict } = useI18n();
  const tr = dict.transformation;
  return (
    <section id="work" data-theme="light" className="relative py-24 lg:py-40">
      <div className="mx-auto grid max-w-[110rem] gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-x-10 lg:px-10">
        <div className="lg:col-span-7">
          <CompareSlider />
          <p className="label mt-3 text-[0.625rem] text-muted">{tr.note}</p>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:pl-6">
          <SectionLabel index={tr.index} label={tr.label} />
          <RevealLines text={tr.title} className="mt-6 font-display text-big" />
          <FadeUp className="mt-8 max-w-md text-[0.975rem] leading-relaxed text-muted">{tr.intro}</FadeUp>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-line py-5">
            {tr.meta.map((m) => (
              <div key={m.k}>
                <dt className="label text-detail">{m.k}</dt>
                <dd className="mt-2 font-display text-[1.15rem] leading-tight sm:text-[1.35rem]">{m.v}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-10 grid gap-0">
            {tr.steps.map((s, i) => (
              <li key={s.t}>
                <FadeUp delay={i * 0.08} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                  <span className="font-display text-[2rem] italic leading-none text-oxblood tnum">{i + 1}</span>
                  <div>
                    <p className="font-display text-[1.5rem] leading-none">{s.t}</p>
                    <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{s.d}</p>
                  </div>
                </FadeUp>
                {i < tr.steps.length - 1 && <Rule />}
              </li>
            ))}
          </ol>

          <div className="mt-10 lg:mt-auto lg:pt-10">
            <BookButton size="lg" options={{ serviceIds: ["color-correction"], stylistId: "mara" }} className="w-full justify-between sm:w-auto">
              {tr.cta}
            </BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}
