import type { MetadataRoute } from "next";

// Concept project: nothing to index.
// Generated once at build time (static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
