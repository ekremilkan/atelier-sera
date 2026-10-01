# Atelier Sera — Hair & Beauty (concept)

A portfolio concept for a fictional boutique salon in Hamburg, with a fully working
front-end booking flow. EN/DE, mobile-first, built with Next.js 16 (App Router),
TypeScript, Tailwind CSS 4 and Framer Motion.

> Fictional business. The booking is a demo — no real appointment is created.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /de
npm test           # booking engine tests (Vitest)
npm run build && npm start   # production build
```

Requires Node 20.9+.

## Before you show it

- **Studio credit** — set `STUDIO_NAME` in `lib/content.ts` (footer: "Concept project by …").
- **Indexing** — the site is `noindex` and `robots.txt` disallows all, so a fictional
  business never shows up in search. Flip `robots` in `app/[lang]/layout.tsx` and
  `app/robots.ts` if you want the case study indexed.
- **Photography** — curated Unsplash images served via a custom `next/image` loader
  straight from Unsplash's CDN (`lib/image-loader.ts`). The "before" in the
  transformation slider is the "after" photo graded down — real pairs can be dropped in
  via `IMG.transformation` in `lib/content.ts`.

## Structure

```
app/[lang]/            Root layout (fonts, metadata, providers) and the one-page site
proxy.ts               "/" → /en or /de from Accept-Language
lib/booking/           Booking engine — no React, no UI
  types.ts             Domain types (dates as ISO strings, times as minutes, Europe/Berlin)
  data.ts              Salon hours, services, stylists, shifts (mock catalogue)
  availability.ts      Pure slot rules: duration fits shift, no overlaps, no past times…
  mock-bookings.ts     Deterministic seeded diary per stylist + date
  service.ts           BookingService interface + MockBookingService  ← the backend seam
  ics.ts, validation.ts
  booking.test.ts      Edge cases: long services near closing, days off, Sundays, past times, DST
lib/i18n/              Typed dictionaries (en.ts is the shape, de.ts must match)
components/sections/   Header, Hero, Services, Team, Transformation, Journal, Testimonials, Visit, Footer
components/booking/    Overlay shell, steps, live summary, reducer-based state
```

## Connecting a real backend

The UI only talks to `BookingService` (`lib/booking/service.ts`). Implement it against
your API — `getCatalog`, `getCalendar`, `getSlots`, `getNextAvailable`, `createBooking` —
and export your instance as `bookingService`. The availability rules in
`availability.ts` can run server-side unchanged; they take an injected `now` and a
`bookingsFor(stylistId, date)` lookup.
