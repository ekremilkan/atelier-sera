"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { BookButton } from "@/components/ui/BookButton";
import { CURTAIN, EASE } from "@/components/ui/Reveal";
import { IMG } from "@/lib/content";
import { useI18n } from "@/lib/i18n/provider";

type Theme = "dark" | "light" | "blood";

/** Which section sits under the header? The header adopts its colours. */
function useThemeUnderHeader(offset = 36) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      const sections = document.querySelectorAll<HTMLElement>("main [data-theme], footer[data-theme]");
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= offset && r.bottom > offset) {
          setTheme((s.dataset.theme as Theme) ?? "dark");
          return;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [offset]);
  return { theme, scrolled };
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display whitespace-nowrap ${className}`}>
      Atelier <em className="italic">Sera</em>
    </span>
  );
}

function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, dict } = useI18n();
  const other = locale === "en" ? "de" : "en";
  return (
    <Link
      href={`/${other}`}
      scroll={false}
      hrefLang={other}
      aria-label={dict.nav.switchTo}
      className={`label h-11 items-center gap-1.5 ${className}`}
    >
      <span className={locale === "en" ? "opacity-100" : "opacity-45"}>EN</span>
      <span aria-hidden className="opacity-40">/</span>
      <span className={locale === "de" ? "opacity-100" : "opacity-45"}>DE</span>
    </Link>
  );
}

export function Header() {
  const { dict } = useI18n();
  const { state } = useBooking();
  const { theme, scrolled } = useThemeUnderHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const button = menuButton.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      button?.focus();
    };
  }, [menuOpen]);

  // Over the oxblood footer the CTA flips to bone so it doesn't vanish.
  const onBlood = theme === "blood" && !menuOpen;
  // While the booking overlay is open the header steps back.
  const hidden = state.open;

  return (
    <>
      <motion.header
        data-theme={menuOpen ? "dark" : theme}
        className="fixed inset-x-0 top-0 z-50 bg-transparent! transition-colors duration-500"
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: CURTAIN }}
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
      >
        <div
          className={`relative flex items-center justify-between px-4 transition-[height] duration-500 sm:px-6 lg:px-10 ${
            scrolled ? "h-16" : "h-16 lg:h-24"
          }`}
        >
          {/* Hairline + backdrop appear once we leave the hero */}
          <div
            aria-hidden
            className={`absolute inset-0 -z-10 border-b border-line bg-bg transition-opacity duration-500 ${
              scrolled && !menuOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <Link href="#top" className="text-[1.5rem] leading-none text-fg lg:text-[1.75rem]" aria-label="Atelier Sera — top">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-10">
              {dict.nav.links.map((l, i) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="group label flex items-baseline gap-2 text-fg">
                    <span className="tnum text-detail">0{i + 1}</span>
                    <span className="relative">
                      {l.label}
                      <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:origin-left group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 text-fg sm:gap-5">
            <LangSwitch className="hidden sm:flex" />
            <span className="lg:hidden">
              <BookButton size="sm" variant={onBlood ? "bone" : "solid"}>
                {dict.nav.bookShort}
              </BookButton>
            </span>
            <span className="hidden lg:block">
              <BookButton size="md" variant={onBlood ? "bone" : "solid"}>
                {dict.nav.book}
              </BookButton>
            </span>
            <button
              ref={menuButton}
              type="button"
              className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={`block h-px w-6 bg-current transition-transform duration-500 ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-6 bg-current transition-transform duration-500 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            data-theme="dark"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.openMenu}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto px-4 pb-8 pt-24 sm:px-6 lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: CURTAIN }}
          >
            <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[44%] w-[56%] opacity-50">
              <Image src={IMG.menuOpen} alt="" fill sizes="50vw" className="graded object-cover" />
            </div>
            <nav aria-label="Mobile" className="relative">
              <ul className="border-t border-line">
                {dict.nav.links.map((l, i) => (
                  <li key={l.id} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={`#${l.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline gap-4 py-4"
                      initial={reduce ? false : { y: "100%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.07 }}
                    >
                      <span className="label tnum text-detail">0{i + 1}</span>
                      <span className="font-display text-[3rem] leading-none">{l.label}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="relative mt-auto flex items-end justify-between pt-10">
              <p className="label max-w-[12rem] text-muted">{dict.nav.menuFooter}</p>
              <LangSwitch className="flex" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
