"use client";

import { BookButton } from "@/components/ui/BookButton";
import { RevealLines } from "@/components/ui/Reveal";
import { STUDIO_NAME } from "@/lib/content";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";

export function Footer() {
  const { dict } = useI18n();
  return (
    <footer data-theme="blood" className="relative overflow-hidden">
      <div className="mx-auto max-w-[110rem] px-4 pt-24 sm:px-6 lg:px-10 lg:pt-36">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <RevealLines text={dict.footer.cta} className="font-display text-huge" />
          <BookButton variant="bone" size="lg" className="w-full justify-between sm:w-auto">
            {dict.footer.book}
          </BookButton>
        </div>
      </div>

      {/* Full-bleed wordmark */}
      <p
        aria-hidden
        className="mt-20 select-none whitespace-nowrap text-center font-display leading-[0.8] tracking-[-0.045em] text-bone/95 lg:mt-28"
        style={{ fontSize: "clamp(4rem, 19.2vw, 26rem)" }}
      >
        Atelier <em>Sera</em>
      </p>

      <div className="mx-auto mt-10 flex max-w-[110rem] flex-col gap-4 border-t border-line px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <p className="label text-muted">{t(dict.footer.note, { studio: STUDIO_NAME })}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <p className="label text-muted">{dict.footer.credits}</p>
          <p className="label text-muted">© 2026</p>
          <a href="#top" className="label inline-flex h-11 items-center hover:text-champagne">
            {dict.footer.top} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
