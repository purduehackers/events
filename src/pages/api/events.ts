export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";

// Only the query params the site's own clients send are forwarded to Payload.
// Anything else is rejected, which keeps the CDN cache key space bounded and
// stops arbitrary queries from being tunneled through this authenticated proxy.
const SELECTABLE_FIELDS = new Set([
    "name", "slug", "eventType", "start", "end", "location_name", "published", "images",
]);

const WHERE_PARAMS: Record<string, (value: string) => boolean> = {
    "where[start][greater_than]": isValidDate,
    "where[start][less_than]": isValidDate,
    "where[eventType][equals]": isShortString,
    "where[eventType][not_in]": isShortString,
};

function isValidDate(value: string) {
    return value.length <= 40 && !Number.isNaN(Date.parse(value));
}

function isShortString(value: string) {
    return value.length > 0 && value.length <= 100;
}

function validateParam(key: string, value: string): boolean {
    if (key === "q") return isShortString(value);
    if (key === "sort") return value === "start" || value === "-start";
    if (key === "limit") return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100;
    if (key === "page") return /^\d+$/.test(value) && Number(value) >= 1;
    if (key === "depth") return value === "0";
    if (key === "pagination") return value === "false";
    const selectMatch = key.match(/^select\[([a-zA-Z_]+)\]$/);
    if (selectMatch?.[1]) return SELECTABLE_FIELDS.has(selectMatch[1]) && value === "true";
    return WHERE_PARAMS[key]?.(value) ?? false;
}

// Slugs of events whose indexed content (title/excerpt — i.e. description and
// location text) matches the query, from the CMS search-plugin collection.
// Best-effort: until the CMS deploys its search beforeSync and reindexes, the
// index rejects these clauses and the plain or-search stands alone.
async function fetchSearchIndexSlugs(q: string): Promise<string[]> {
    try {
        const params = new URLSearchParams({
            "where[or][0][title][like]": q,
            "where[or][1][excerpt][like]": q,
            "where[published][equals]": "true",
            "where[eventSlug][exists]": "true",
            "select[eventSlug]": "true",
            limit: "50",
            depth: "0",
        });
        const res = await fetch(`${CMS_URL}/api/search?${params.toString()}`, {
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
            },
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { docs?: { eventSlug?: string | null }[] };
        const slugs = (data.docs ?? [])
            .map((doc) => doc.eventSlug)
            .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
        return [...new Set(slugs)];
    } catch {
        return [];
    }
}

// Get events
export const GET: APIRoute = async ({ url }) => {
    try {
        const params = new URLSearchParams();
        for (const [key, value] of url.searchParams.entries()) {
            if (!validateParam(key, value)) {
                return jsonResponse({ error: `Unsupported query param: ${key}` }, 400);
            }
            params.set(key, value);
        }

        // Full-doc dumps must stay bounded; allow pagination=false only with select
        if (params.get("pagination") === "false" && ![...params.keys()].some((k) => k.startsWith("select["))) {
            return jsonResponse({ error: "pagination=false requires select[...] fields" }, 400);
        }

        // Search orchestration lives server-side: one client param expands to
        // the or-clauses, so clients never carry Payload query shapes
        const q = params.get("q");
        if (q) {
            params.delete("q");
            params.set("where[or][0][name][like]", q);
            params.set("where[or][1][location_name][like]", q);
            const indexSlugs = await fetchSearchIndexSlugs(q);
            if (indexSlugs.length > 0) {
                params.set("where[or][2][slug][in]", indexSlugs.join(","));
            }
        }

        // Filter for published only
        params.set("where[published][equals]", "true");

        // Make authorized fetch request
        const cmsRes = await fetch(`${CMS_URL}/api/events?${params.toString()}`, {
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
            },
        });

        return new Response(await cmsRes.text(), {
            status: cmsRes.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': cmsRes.ok
                    ? 'public, s-maxage=300, stale-while-revalidate=86400'
                    : 'no-store',
            },
        });
    } catch {
        return jsonResponse({ error: 'Failed to fetch events' }, 500);
    }
};
