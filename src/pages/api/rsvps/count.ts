export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";

// Public going-count for an event, plus the display names of the most recent
// guests for the attendee facepile. Names are what guests chose to enter on a
// public RSVP — emails and everything else never leave this endpoint.
export const GET: APIRoute = async ({ url }) => {
    const eventId = url.searchParams.get("event") ?? "";
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(eventId)) {
        return jsonResponse({ error: "Invalid event id" }, 400);
    }

    try {
        const params = new URLSearchParams({
            "where[event][equals]": eventId,
            "where[cancelled][not_equals]": "true",
            "select[name]": "true",
            sort: "-createdAt",
            limit: "3",
            depth: "0",
        });
        const cmsRes = await fetch(`${CMS_URL}/api/rsvps?${params.toString()}`, {
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
            },
        });
        if (!cmsRes.ok) {
            return jsonResponse({ error: "Failed to fetch count" }, 502);
        }

        const data = (await cmsRes.json()) as {
            totalDocs?: number;
            docs?: { name?: string | null }[];
        };
        const names = (data.docs ?? [])
            .map((doc) => doc.name?.trim())
            .filter((name): name is string => Boolean(name));
        return jsonResponse(
            { count: data.totalDocs ?? 0, names },
            200,
            "public, s-maxage=60, stale-while-revalidate=600",
        );
    } catch {
        return jsonResponse({ error: "Failed to fetch count" }, 500);
    }
};
