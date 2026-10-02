import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

// Generated once at build time (static export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["en", "de"].map((l) => ({
    url: `${SITE_URL}/${l}`,
    alternates: { languages: { en: `${SITE_URL}/en`, de: `${SITE_URL}/de` } },
  }));
}
