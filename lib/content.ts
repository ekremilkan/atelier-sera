/** Site-level content that isn't copy: imagery, contact data, studio credit. */

/** Change this to your studio's name — it appears in the footer credit. */
export const STUDIO_NAME = "[Your Studio]";

export const SITE_URL = "https://atelier-sera.example";

export const CONTACT = {
  phone: "+49 40 1234 5678",
  phoneHref: "tel:+494012345678",
  email: "hello@atelier-sera.example",
  instagram: "@ateliersera",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Lehmweg+21+20251+Hamburg",
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

/** Curated Unsplash photography — all graded together via the `graded` utility. */
export const IMG = {
  hero: u("1535579710123-3c0f261c474e"),
  interior: u("1600948836101-f9ffda59d250"),
  transformation: u("1455824116325-29097b5f6366"),
  menuOpen: u("1574015974293-817f0ebebb74"),

  // Services hover imagery
  cut: u("1700760934268-8aa0ef52ce0a"),
  cutBob: u("1519713594620-c57c92a493c0"),
  cutDry: u("1647462741268-e5724e5886c0"),
  blowout: u("1633381521050-26bb467d9d5a"),
  colorFoil: u("1712213396688-c6f2d536671f"),
  colorBalayage: u("1554519934-e32b1629d9ee"),
  colorCopper: u("1614020863825-28a0bb7e3c3c"),
  colorTexture: u("1620939391250-eb822ac0818a"),
  colorBronze: u("1620939391272-b03c1ccdd10c"),
  wash: u("1634449571010-02389ed0f9b0"),
  braid: u("1560879311-6e94c5c61500"),
  bridalPearl: u("1782776852521-77b0aed8831d"),
  bridalWave: u("1672788725446-c303ec2b318e"),
  bridalBraid: u("1623428455512-264b33ca8cec"),
  bridalStars: u("1769869174682-19e960909bdb"),
  bridalUpdo: u("1672788709547-6d7f239972c3"),
  browEye: u("1516220362602-dba5272034e7"),
  browGreen: u("1597826322461-9b11d306d08f"),
  browBold: u("1557296387-5358ad7997bb"),
  skin: u("1752245818739-890854ca3b81"),
  skinLight: u("1551184451-76b762941ad6"),

  // Journal extras
  windHair: u("1567582173070-228d1cd84c72"),
  monoWaves: u("1633381521050-26bb467d9d5a"),
  curlsTexture: u("1560264641-1b5191cc63e2"),
  curlIron: u("1629397685944-7073f5589754"),
  monoShort: u("1495914510314-ba3164b1321f"),
  fringe: u("1672794444732-e007954a177c"),
  shortCurls: u("1536180838057-b604200e6f36"),
};

export const SERVICE_IMAGES: Record<string, string> = {
  "signature-cut": IMG.cut,
  "transformation-cut": IMG.cutBob,
  blowout: IMG.blowout,
  fringe: IMG.fringe,
  gloss: IMG.colorTexture,
  "root-color": IMG.colorFoil,
  "full-color": IMG.colorBronze,
  balayage: IMG.colorBalayage,
  "color-correction": IMG.colorCopper,
  "bond-repair": IMG.braid,
  "scalp-ritual": IMG.wash,
  "gloss-mask": IMG.curlsTexture,
  "bridal-trial": IMG.bridalBraid,
  "bridal-day": IMG.bridalPearl,
  "occasion-updo": IMG.bridalUpdo,
  "brow-sculpt": IMG.browEye,
  "brow-lamination": IMG.browBold,
  "lash-lift": IMG.browGreen,
  "signature-facial": IMG.skin,
};

export const TEAM_MEDIA: Record<string, { portrait: string; work: string[]; position?: string }> = {
  mara: {
    portrait: u("1636208640803-6a443f9676d4"),
    work: [IMG.colorFoil, IMG.colorBalayage, IMG.colorTexture],
    position: "50% 72%",
  },
  jonas: {
    portrait: u("1558730234-d8b2281b0d00"),
    work: [IMG.cutDry, IMG.cutBob, IMG.shortCurls],
    position: "50% 25%",
  },
  ines: {
    portrait: u("1634510979979-4be6881d31bb"),
    work: [IMG.bridalPearl, IMG.bridalWave, IMG.bridalBraid],
    position: "50% 20%",
  },
  yuki: {
    portrait: u("1562901169-5bf47e283c3a"),
    work: [IMG.browEye, IMG.browBold, IMG.skin],
    position: "50% 30%",
  },
};

/** Journal strip: image + aspect ratio, captions come from the dictionary. */
export const JOURNAL = [
  { src: IMG.colorTexture, ratio: "4/5", no: 31 },
  { src: IMG.monoShort, ratio: "3/4", no: 30 },
  { src: IMG.cutBob, ratio: "1/1", no: 29 },
  { src: IMG.windHair, ratio: "4/5", no: 28 },
  { src: IMG.browGreen, ratio: "1/1", no: 27 },
  { src: IMG.curlIron, ratio: "3/4", no: 26 },
  { src: IMG.bridalStars, ratio: "4/5", no: 25 },
  { src: IMG.fringe, ratio: "3/4", no: 24 },
];
