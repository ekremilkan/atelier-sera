"use client";

/** next/image loader for Unsplash (imgix): resizes and serves AVIF/WebP at the edge. */
export default function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const url = new URL(src.startsWith("http") ? src : `https://images.unsplash.com/${src}`);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 72));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
