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
      expiration: 60 * 60 * 24,
      bypassToken: process.env.ISR_REVALIDATION_TOKEN || "",
      exclude: ["/", /^\/api\/.+/] 
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    /*server: {
      proxy: {
        // Proxy API requests during local dev to avoid CORS issues
        "/api/events": {
          target: process.env.PUBLIC_CMS_URL ?? "https://cms.purduehackers.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/events/, "/api/events"),
        },
      },
    },*/
  },
  integrations: [react()],
});