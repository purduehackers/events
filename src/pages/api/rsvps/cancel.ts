export const prerender = false;

import type { APIRoute } from 'astro';
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";

// Proxies RSVP cancellation to the CMS's custom collection endpoint. The token
// is the only credential; it is never logged and never echoed back.
export const POST: APIRoute = async ({ request }) => {
    let token = "";
    try {
        const body = await request.json();
        token = typeof body?.token === "string" ? body.token.trim() : "";
    } catch {
        // fall through to validation below
    }

    if (!token || token.length > 100) {
        return jsonResponse({ ok: false, reason: "invalid" }, 400);
    }

    try {
        const cmsRes = await fetch(`${CMS_URL}/api/rsvps/cancel`, {
            method: "POST",
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (!cmsRes.ok) {
            return jsonResponse({ ok: false, reason: "error" }, 502);
        }
        return jsonResponse({ ok: true });
    } catch {
        return jsonResponse({ ok: false, reason: "error" }, 500);
    }
};
