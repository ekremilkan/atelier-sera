import { notFound } from "next/navigation";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Journal } from "@/components/sections/Journal";
import { Services } from "@/components/sections/Services";
import { Team } from "@/components/sections/Team";
import { Testimonials } from "@/components/sections/Testimonials";
import { Transformation } from "@/components/sections/Transformation";
import { Visit } from "@/components/sections/Visit";
import { SALON } from "@/lib/booking/data";
import { CONTACT, IMG, SITE_URL } from "@/lib/content";
import { getDictionary, hasLocale } from "@/lib/i18n";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "Atelier Sera",
    description: dict.meta.description,
    url: `${SITE_URL}/${lang}`,
    image: IMG.hero,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "€€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lehmweg 21",
      postalCode: "20251",
      addressLocality: "Hamburg",
      addressCountry: "DE",
    },
    openingHoursSpecification: Object.entries(SALON.openingHours).map(([wd, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY[Number(wd)],
      opens: hhmm(h!.start),
      closes: hhmm(h!.end),
    })),
  };

  return (
    <>
      <main id="main">
        <Hero />
        <Services />
        <Team />
        <Transformation />
        <Journal />
        <Testimonials />
        <Visit />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
