import type { MetadataRoute } from "next";

// Concept project: nothing to index.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
