"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { Arrow } from "@/components/ui/BookButton";
import { Photo } from "@/components/ui/Photo";
import { FadeUp, RevealImage, RevealLines, Rule } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { addDays, formatTime, weekdayOf, type Weekday } from "@/lib/booking";
import { CONTACT, IMG } from "@/lib/content";
import { todayInSalon, weekdayLong } from "@/lib/format";
import { t } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";

const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
// Any Monday works as an anchor to name weekdays in the current locale.
const dateFor = (wd: Weekday) => addDays("2026-01-05", (wd + 6) % 7);

function useStatus() {
  const { catalog } = useBooking();
  const { dict, locale } = useI18n();
  const [state, setState] = useState<{ today: Weekday; text: string; open: boolean } | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = todayInSalon();
      const wd = weekdayOf(now.date);
      const hours = catalog.salon.openingHours;
      const h = hours[wd];
      if (h && now.minutes >= h.start && now.minutes < h.end) {
        setState({ today: wd, open: true, text: t(dict.visit.openNow, { time: formatTime(h.end) }) });
        return;
      }
      // Find the next opening.
      for (let i = 0; i < 8; i++) {
        const date = addDays(now.date, i);
        const dwd = weekdayOf(date);
        const dh = hours[dwd];
        if (!dh || (i === 0 && now.minutes >= dh.start)) continue;
        const day = i === 0 ? "" : i === 1 ? dict.visit.tomorrow : weekdayLong(date, locale);
        setState({
          today: wd,
          open: false,
          text: t(dict.visit.closedNow, { day, time: formatTime(dh.start) }).replace("  ", " "),
        });
        return;
      }
    };
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [catalog, dict, locale]);
  return state;
}

function MapArt({ label }: { label: string }) {
  const font = { fontFamily: "var(--font-manrope)" };
  return (
    <svg viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className="h-full w-full">
      <rect width="1000" height="420" className="fill-ink-2" />
      {/* Water: Isebek canal and a bend of the Alster */}
      <path d="M-20 330 C 160 300, 300 268, 470 262 S 760 236, 1020 150" className="fill-none stroke-ink-3" strokeWidth="24" />
      <path d="M820 440 C 850 360, 930 330, 1020 318" className="fill-none stroke-ink-3" strokeWidth="56" />
      {/* Minor streets */}
      <g className="fill-none stroke-champagne/20" strokeWidth="1">
        <path d="M120 -10 L 300 430" />
        <path d="M-20 110 L 1020 40" />
        <path d="M240 -10 C 300 120, 520 190, 1020 250" />
        <path d="M640 -10 L 590 430" />
        <path d="M-20 400 L 1020 330" />
        <path d="M820 -10 L 730 430" />
        <path d="M-20 30 L 420 -10" />
        <path d="M190 430 L 330 220" />
        <path d="M430 -10 L 470 430" />
        <path d="M900 -10 L 990 430" />
      </g>
      {/* Main roads */}
      <g className="fill-none stroke-champagne/40" strokeWidth="1.5">
        <path d="M300 -10 L 360 430" />
        <path d="M-20 214 L 1020 160" />
      </g>
      {/* Lehmweg, highlighted */}
      <path d="M560 200 L 640 -10" className="fill-none stroke-champagne" strokeWidth="2" />
      {/* Labels */}
      <g className="fill-champagne/60 text-[10px] uppercase tracking-[0.24em]" style={font}>
        <text x="604" y="70" transform="rotate(-69 604 70)">Lehmweg</text>
        <text x="40" y="318" transform="rotate(-6 40 318)">Isebekkanal</text>
        <text x="318" y="60" transform="rotate(82 318 60)">Hoheluftchaussee</text>
        <text x="700" y="186" transform="rotate(-3 700 186)">Eppendorfer Weg</text>
        <text x="880" y="400">Alster</text>
      </g>
      {/* U-Bahn */}
      <g transform="translate(408 199)">
        <rect width="20" height="20" className="fill-bone" />
        <text x="10" y="14.5" textAnchor="middle" className="fill-ink text-[11px] font-bold" style={font}>
          U
        </text>
        <text x="-6" y="40" className="fill-bone/70 text-[9px] uppercase tracking-[0.22em]" style={font}>
          Eppendorfer Baum
        </text>
      </g>
      {/* Walking route */}
      <path d="M430 207 L 560 201" className="fill-none stroke-bone/80" strokeWidth="1.2" strokeDasharray="3 5" />
      <text x="470" y="194" className="fill-bone/60 text-[9px] uppercase tracking-[0.22em]" style={font}>
        4 min
      </text>
      {/* Pin */}
      <g transform="translate(560 201)">
        <circle r="26" className="fill-oxblood/25" />
        <circle r="9" className="fill-oxblood" />
        <circle r="3" className="fill-bone" />
        <text x="22" y="40" className="fill-bone text-[22px] italic" style={{ fontFamily: "var(--font-bodoni)" }}>
          Atelier Sera
        </text>
      </g>
    </svg>
  );
}

export function Visit() {
  const { dict, locale } = useI18n();
  const { catalog } = useBooking();
  const status = useStatus();
  const v = dict.visit;

  return (
    <section id="visit" data-theme="dark" className="relative overflow-hidden py-24 lg:py-40">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="relative z-10 lg:col-span-9">
            <SectionLabel index={v.index} label={v.label} />
            <RevealLines text={v.title} className="mt-6 font-display text-mega" />
          </div>
          <RevealImage className="relative aspect-[4/3] overflow-hidden lg:col-span-4 lg:col-start-9 lg:-mt-16 lg:aspect-[3/4] lg:row-span-2">
            <Photo src={IMG.interior} alt={v.interiorAlt} sizes="(min-width:1024px) 30vw, 100vw" />
          </RevealImage>

          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-8 lg:row-start-2 lg:mt-10 lg:gap-x-10">
            {/* Address & contact */}
            <FadeUp className="flex flex-col gap-8">
              <address className="not-italic">
                <p className="font-display text-[1.75rem] leading-tight">
                  {v.address[0]}
                  <br />
                  <span className="text-muted">{v.address[1]}</span>
                </p>
                <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-muted">{v.transit}</p>
              </address>
              <div>
                <p className="label text-detail">{v.contact}</p>
                <ul className="mt-3 grid gap-1 text-[0.975rem]">
                  <li>
                    <a href={CONTACT.phoneHref} className="inline-flex h-10 items-center hover:text-champagne">
                      {CONTACT.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${CONTACT.email}`} className="inline-flex h-10 items-center break-all hover:text-champagne">
                      {CONTACT.email}
                    </a>
                  </li>
                </ul>
              </div>
              <a
                href={CONTACT.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="group label inline-flex h-11 items-center gap-4 self-start border-b border-line-strong hover:border-fg"
              >
                {v.directions}
                <Arrow />
              </a>
            </FadeUp>

            {/* Hours */}
            <FadeUp delay={0.1}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="label text-detail">{v.hours}</p>
                {status && (
                  <p className="label flex items-center gap-2 text-right">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.open ? "bg-champagne" : "bg-oxblood"}`} />
                    {status.text}
                  </p>
                )}
              </div>
              <Rule className="mt-4" />
              <table className="w-full text-[0.95rem]">
                <tbody>
                  {ORDER.map((wd) => {
                    const h = catalog.salon.openingHours[wd];
                    const isToday = status?.today === wd;
                    return (
                      <tr key={wd} className={`border-b border-line ${isToday ? "text-fg" : "text-muted"}`}>
                        <th scope="row" className="py-3 text-left font-normal">
                          <span className="flex items-center">
                            <span className={`h-px transition-all ${isToday ? "mr-3 w-4 bg-oxblood" : "w-0"}`} aria-hidden />
                            <span className="capitalize">{weekdayLong(dateFor(wd), locale)}</span>
                          </span>
                        </th>
                        <td className="py-3 text-right tnum">
                          {h ? `${formatTime(h.start)} — ${formatTime(h.end)}` : v.closed}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </FadeUp>
          </div>
        </div>

        <RevealImage from="left" className="relative mt-16 aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:mt-24 lg:aspect-[21/8]">
          <div className="absolute inset-0">
            <MapArt label={v.mapLabel} />
          </div>
        </RevealImage>
      </div>
    </section>
  );
}
