import type { Category, SalonConfig, Service, Stylist, TimeRange } from "./types";

const h = (start: string, end: string): TimeRange => {
  const toMin = (s: string) => {
    const [hh, mm] = s.split(":").map(Number);
    return hh * 60 + mm;
  };
  return { start: toMin(start), end: toMin(end) };
};

export const SALON: SalonConfig = {
  timeZone: "Europe/Berlin",
  // Sunday (0) is absent → closed.
  openingHours: {
    1: h("10:00", "19:00"),
    2: h("10:00", "19:00"),
    3: h("10:00", "19:00"),
    4: h("10:00", "20:00"),
    5: h("10:00", "20:00"),
    6: h("09:00", "18:00"),
  },
  slotStepMin: 30,
  leadTimeMin: 30,
  horizonDays: 60,
};

export const CATEGORIES: Category[] = [
  { id: "cut", name: { en: "Cut & Style", de: "Schnitt & Styling" } },
  { id: "color", name: { en: "Colour", de: "Farbe" } },
  { id: "treatment", name: { en: "Treatments", de: "Pflege" } },
  { id: "bridal", name: { en: "Bridal", de: "Braut" } },
  { id: "brows", name: { en: "Brows & Skin", de: "Brauen & Haut" } },
];

export const SERVICES: Service[] = [
  // Cut & Style
  {
    id: "signature-cut",
    category: "cut",
    name: { en: "Signature Cut", de: "Signature Cut" },
    description: {
      en: "Consultation, wash, a precision cut built around how you actually wear your hair, and a finish.",
      de: "Beratung, Wäsche und ein Präzisionsschnitt, der zu deinem Alltag passt – nicht nur zum Spiegel.",
    },
    durationMin: 75,
    priceEUR: 95,
  },
  {
    id: "transformation-cut",
    category: "cut",
    name: { en: "Transformation Cut", de: "Typveränderung" },
    description: {
      en: "Long to short, or a shape you've never dared. Extra time to talk it through first.",
      de: "Von lang zu kurz oder eine Form, die du dich bisher nicht getraut hast. Mit Zeit fürs Vorgespräch.",
    },
    durationMin: 105,
    priceEUR: 135,
  },
  {
    id: "blowout",
    category: "cut",
    name: { en: "Blow-dry & Finish", de: "Föhnen & Finish" },
    description: {
      en: "Volume, polish or undone — finished to last the evening.",
      de: "Volumen, Glanz oder bewusst lässig – gemacht für einen langen Abend.",
    },
    durationMin: 45,
    priceEUR: 55,
  },
  {
    id: "fringe",
    category: "cut",
    name: { en: "Fringe Refresh", de: "Pony nachschneiden" },
    description: {
      en: "Between cuts. Fifteen minutes, back to sharp.",
      de: "Zwischen zwei Terminen. Fünfzehn Minuten, wieder in Form.",
    },
    durationMin: 15,
    priceEUR: 20,
  },
  // Color
  {
    id: "gloss",
    category: "color",
    name: { en: "Gloss & Tone", de: "Glossing & Tönung" },
    description: {
      en: "Refreshes faded tone and adds a mirror finish. No commitment, all shine.",
      de: "Frischt verblasste Nuancen auf und bringt Spiegelglanz. Unverbindlich, aber sichtbar.",
    },
    durationMin: 60,
    priceEUR: 85,
  },
  {
    id: "root-color",
    category: "color",
    name: { en: "Root Colour", de: "Ansatzfarbe" },
    description: {
      en: "Seamless regrowth coverage, matched to your lengths under daylight.",
      de: "Nahtlose Ansatzfarbe, bei Tageslicht exakt auf deine Längen abgestimmt.",
    },
    durationMin: 90,
    priceEUR: 110,
  },
  {
    id: "full-color",
    category: "color",
    name: { en: "Full Head Colour", de: "Komplettfarbe" },
    description: {
      en: "One considered shade from root to tip, glazed for depth.",
      de: "Eine durchdachte Nuance vom Ansatz bis in die Spitzen, mit Glossing für Tiefe.",
    },
    durationMin: 135,
    priceEUR: 165,
  },
  {
    id: "balayage",
    category: "color",
    name: { en: "Hand-painted Balayage", de: "Balayage, freihand" },
    description: {
      en: "Painted light that grows out softly. Toner and finish included.",
      de: "Von Hand gemaltes Licht, das weich herauswächst. Inklusive Toner und Finish.",
    },
    durationMin: 210,
    priceEUR: 270,
  },
  {
    id: "color-correction",
    category: "color",
    name: { en: "Colour Correction", de: "Farbkorrektur" },
    description: {
      en: "Box dye, banding, brass. We assess first and plan it in honest stages.",
      de: "Drogeriefarbe, Streifen, Gelbstich. Wir analysieren zuerst und planen ehrlich in Etappen.",
    },
    durationMin: 240,
    priceEUR: 320,
    priceFrom: true,
  },
  // Treatments
  {
    id: "bond-repair",
    category: "treatment",
    name: { en: "Bond Repair Ritual", de: "Bond-Repair-Ritual" },
    description: {
      en: "Rebuilds what bleach and heat take away. Best added to any colour service.",
      de: "Baut auf, was Blondierung und Hitze nehmen. Ideal zu jeder Farbbehandlung.",
    },
    durationMin: 30,
    priceEUR: 45,
  },
  {
    id: "scalp-ritual",
    category: "treatment",
    name: { en: "Scalp Detox & Massage", de: "Kopfhaut-Detox & Massage" },
    description: {
      en: "Exfoliation, steam and twenty unhurried minutes of pressure-point massage.",
      de: "Peeling, Dampf und zwanzig Minuten Druckpunktmassage ohne Eile.",
    },
    durationMin: 45,
    priceEUR: 60,
  },
  {
    id: "gloss-mask",
    category: "treatment",
    name: { en: "Deep Gloss Mask", de: "Intensiv-Glanzmaske" },
    description: {
      en: "A heated mask for weight, softness and movement.",
      de: "Eine Wärmemaske für Gewicht, Geschmeidigkeit und Bewegung.",
    },
    durationMin: 30,
    priceEUR: 40,
  },
  // Bridal
  {
    id: "bridal-trial",
    category: "bridal",
    name: { en: "Bridal Trial", de: "Braut-Probetermin" },
    description: {
      en: "Two looks, photographed in natural light, refined until it feels like you.",
      de: "Zwei Looks, bei Tageslicht fotografiert und verfeinert, bis sie sich nach dir anfühlen.",
    },
    durationMin: 120,
    priceEUR: 180,
  },
  {
    id: "bridal-day",
    category: "bridal",
    name: { en: "Bridal Hair & Make-up", de: "Brautstyling, Haar & Make-up" },
    description: {
      en: "The day itself, in the salon's private room. Touch-up kit included.",
      de: "Der große Tag, im separaten Raum des Salons. Inklusive Touch-up-Kit.",
    },
    durationMin: 180,
    priceEUR: 390,
  },
  {
    id: "occasion-updo",
    category: "bridal",
    name: { en: "Occasion Updo", de: "Hochsteckfrisur" },
    description: {
      en: "For guests, galas and the opera. Pinned to hold, styled to move.",
      de: "Für Gäste, Galas und die Oper. Hält den ganzen Abend und bleibt trotzdem lebendig.",
    },
    durationMin: 60,
    priceEUR: 95,
  },
  // Brows & Skin
  {
    id: "brow-sculpt",
    category: "brows",
    name: { en: "Brow Sculpt & Tint", de: "Brauen formen & färben" },
    description: {
      en: "Mapped to your bone structure, not a stencil.",
      de: "Nach deiner Knochenstruktur geformt, nicht nach Schablone.",
    },
    durationMin: 45,
    priceEUR: 55,
  },
  {
    id: "brow-lamination",
    category: "brows",
    name: { en: "Brow Lamination", de: "Brow Lifting" },
    description: {
      en: "Brushed-up, fuller brows that hold for six weeks.",
      de: "Gebürstete, vollere Brauen, die sechs Wochen halten.",
    },
    durationMin: 60,
    priceEUR: 75,
  },
  {
    id: "lash-lift",
    category: "brows",
    name: { en: "Lash Lift & Tint", de: "Wimpernlifting & Färben" },
    description: {
      en: "Your own lashes, lifted and darkened. No extensions, no upkeep.",
      de: "Deine eigenen Wimpern, geschwungen und getönt. Ohne Extensions, ohne Pflegeaufwand.",
    },
    durationMin: 60,
    priceEUR: 80,
  },
  {
    id: "signature-facial",
    category: "brows",
    name: { en: "Sera Signature Facial", de: "Sera Signature Facial" },
    description: {
      en: "Cleanse, enzyme peel, lymphatic massage. Skin that looks slept-on, in the good way.",
      de: "Reinigung, Enzympeeling, Lymphmassage. Haut, die nach acht Stunden Schlaf aussieht.",
    },
    durationMin: 75,
    priceEUR: 120,
  },
];

const ids = (cat: string) => SERVICES.filter((s) => s.category === cat).map((s) => s.id);

export const STYLISTS: Stylist[] = [
  {
    id: "mara",
    name: "Mara Lindqvist",
    role: { en: "Colour", de: "Farbe" },
    serviceIds: [...ids("color"), ...ids("treatment"), "blowout", "fringe"],
    shifts: {
      2: h("10:00", "19:00"),
      3: h("10:00", "19:00"),
      4: h("11:00", "20:00"),
      5: h("11:00", "20:00"),
      6: h("09:00", "17:00"),
    },
  },
  {
    id: "jonas",
    name: "Jonas Ebert",
    role: { en: "Cuts", de: "Schnitt" },
    serviceIds: [...ids("cut"), "gloss", "root-color", ...ids("treatment")],
    shifts: {
      1: h("10:00", "19:00"),
      2: h("10:00", "19:00"),
      3: h("10:00", "19:00"),
      4: h("12:00", "20:00"),
      5: h("10:00", "18:00"),
    },
  },
  {
    id: "ines",
    name: "Inès Moreau",
    role: { en: "Bridal & Styling", de: "Braut & Styling" },
    serviceIds: [...ids("bridal"), "blowout", "signature-cut", "gloss-mask", "bond-repair"],
    shifts: {
      3: h("10:00", "18:00"),
      4: h("10:00", "20:00"),
      5: h("10:00", "20:00"),
      6: h("09:00", "18:00"),
    },
  },
  {
    id: "yuki",
    name: "Yuki Tanaka",
    role: { en: "Skin & Brows", de: "Haut & Brauen" },
    serviceIds: [...ids("brows"), "scalp-ritual"],
    shifts: {
      1: h("10:00", "18:00"),
      2: h("10:00", "18:00"),
      4: h("12:00", "20:00"),
      5: h("12:00", "20:00"),
      6: h("09:00", "15:00"),
    },
  },
];
