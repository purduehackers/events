export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";

// Get events
export const GET: APIRoute = async ({ url }) => {
    try {
        // Filter for published only
        url.searchParams.set("where[published][equals]", "true");

        // Make authorized fetch request
        const baseUrl = `${CMS_URL}/api/events${url.search}`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;
        const cmsRes = await fetch(baseUrl, {
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
            cache: 'no-store',
        });

        const text = await cmsRes.text();

        return new Response(text, {
            status: cmsRes.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Failed to fetch events' }),
            { status: 500 }
        );
    }
};