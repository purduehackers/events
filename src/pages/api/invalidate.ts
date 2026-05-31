export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ url, request }) => {
  const body = await request.json();
  // Get the route we want to invalidate from the request body
  const route = body.route ?? "/";

  // Send head request to the route we want to invalidate
  const res = await fetch(`https://${url.host}${route}`, {
    method: "HEAD",
    headers: {
      // test bypass token provided to the Vercel adapter
      "x-prerender-revalidate": import.meta.env.ISR_REVALIDATION_TOKEN,
    },
  });

  // checking the response header to make sure the route was revalidated
  const wasInvalidated = res.headers.get("X-Vercel-Cache") === "REVALIDATED";

  return new Response(JSON.stringify({ wasInvalidated }));
};