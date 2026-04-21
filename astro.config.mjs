// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://events.purduehackers.com",
  adapter: vercel({
    isr: {
      expiration: 60 * 60 * 24,
      exclude: ['/api/events', '/api/rsvps']
    },
    imageService: true,
    imagesConfig: {
      sizes: [400, 800, 1200, 1600, 2400],
      domains: ['cms.purduehackers.com'],
    },
  }),
  image: {
    domains: ['cms.purduehackers.com'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
