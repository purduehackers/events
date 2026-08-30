// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://events.purduehackers.com",
  adapter: vercel({
    isr: {
      expiration: 60 * 60,
      bypassToken: process.env.ISR_REVALIDATION_TOKEN || "",
      // API routes manage their own CDN caching via Cache-Control headers
      exclude: [/^\/api\/.+/],
    },
    // Serve image transforms from Vercel's edge optimizer instead of running
    // sharp inside our function. sizes must match OPTIMIZED_WIDTHS in
    // src/utilities/helpers.ts.
    imageService: true,
    imagesConfig: {
      sizes: [192, 368, 400, 640, 800, 1200, 1600],
      domains: ["cms.purduehackers.com"],
      // CMS media lives in Vercel Blob and is served from its public host
      remotePatterns: [
        { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ],
    },
  }),
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.purduehackers.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
