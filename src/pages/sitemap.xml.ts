export const prerender = false;

import type { APIRoute } from "astro";
import { fetchEventsFromCMS } from "@/utilities/cms";
import { getCategorySlug } from "@/utilities/helpers";
import { SITE_URL as SITE } from "@/utilities/constants";

function xmlEscape(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async () => {
    const params = new URLSearchParams({
        "select[slug]": "true",
        "select[eventType]": "true",
        "select[updatedAt]": "true",
        depth: "0",
        pagination: "false",
    });
    const data = await fetchEventsFromCMS(params);
    if (!data) {
        return new Response("Failed to build sitemap", { status: 500 });
    }

    const urls = [
        `  <url>\n    <loc>${SITE}/</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
        ...data.docs.map((event) => {
            const loc = `${SITE}/events/${getCategorySlug(event.eventType)}/${event.slug}`;
            const lastmod = event.updatedAt
                ? `\n    <lastmod>${new Date(event.updatedAt).toISOString()}</lastmod>`
                : "";
            return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod}\n  </url>`;
        }),
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
    });
};
