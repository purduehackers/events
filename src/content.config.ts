import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const Stat = z.object({
  data: z.string(),
  label: z.string(),
});
type Stat = z.infer<typeof Stat>;


const events = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/events" }),
  schema: () => z.object({
    name: z.string(),
    start: z.string().datetime({ offset: true }),
    end: z.string().datetime({ offset: true }).optional(),
    location_name: z.string().optional(),
    location_url: z.string().optional(),
    stats: z.array(Stat).optional(),
  }),
});

export const collections = { events };
