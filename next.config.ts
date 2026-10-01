import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo lives inside a larger directory tree that has its own lockfile.
  turbopack: { root: __dirname },
  images: {
    // Images are served straight from Unsplash's CDN (imgix) at the right size.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
