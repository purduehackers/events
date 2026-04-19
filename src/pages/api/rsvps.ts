export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";

// Create new rsvp
export const POST: APIRoute = async ({ request }) => {
    try {
        const baseUrl = `${CMS_URL}/api/rsvps`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;
        const body = await request.json();
        console.log("body: ", body)

        const cmsRes = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
            body
        });

        const text = await cmsRes.text();
        console.log("text: ", text)

        return new Response(text, {
            status: cmsRes.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.log("Failed to create rsvp: ", err)
        return new Response(
            JSON.stringify({ error: `Failed to create rsvp: ${err}` }),
            { status: 500 }
        );
    }
};