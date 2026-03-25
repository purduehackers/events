export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";

export const GET: APIRoute = async ({ url }) => {
    try {
        console.log("url:", url);
        console.log("query:", url.search);

        const baseUrl = `${CMS_URL}/api/events${url.search}`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;

        const cmsRes = await fetch(baseUrl, {
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
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