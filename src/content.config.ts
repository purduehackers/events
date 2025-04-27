import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const events = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    datetime: z.coerce.date(),
    end_datetime: z.coerce.date().optional(),
    location: z.string().optional(),
    location_url: z.string().optional(),
  }),
});

export const collections = { events };
