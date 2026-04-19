export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";

// Create new rsvp
export const POST: APIRoute = async ({ request }) => {
    try {
        const baseUrl = `${CMS_URL}/api/rsvps`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;
        const body = await request.json();

        const cmsRes = await fetch(baseUrl, {
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
            method: "POST",
            body
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
            JSON.stringify({ error: 'Failed to create rsvp' }),
            { status: 500 }
        );
    }
};