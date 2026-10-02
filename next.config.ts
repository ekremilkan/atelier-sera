import type { NextConfig } from "next";

// Set in CI for GitHub Pages (e.g. "/atelier-sera"); empty locally so `npm run dev` serves at "/".
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: deployable to GitHub Pages or any static host.
  output: "export",
  trailingSlash: true,
  basePath,
  // The repo lives inside a larger directory tree that has its own lockfile.
  turbopack: { root: __dirname },
  images: {
    // Images are served straight from Unsplash's CDN (imgix) at the right size.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
