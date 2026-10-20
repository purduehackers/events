import type { APIRoute } from "astro";
import { fetchEventsFromCMS } from "@/utilities/cms";

export const prerender = false;

export const GET: APIRoute = async () => {
  const params = new URLSearchParams({
    "where[eventType][equals]": "hack-night",
    "where[start][greater_than]": new Date().toISOString(),
    sort: "start",
    limit: "1",
    depth: "0",
    "select[slug]": "true",
  });
  const data = await fetchEventsFromCMS(params);
  const slug = data?.docs[0]?.slug;

  return new Response(null, {
    status: 302,
    headers: {
      Location: slug ? `/events/hack-night/${encodeURIComponent(slug)}` : "/",
      "Cache-Control": "no-store",
    },
  });
};
