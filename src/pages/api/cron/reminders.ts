export const prerender = false;

import type { APIRoute } from "astro";
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";

// Hourly Vercel cron. The CMS owns the whole reminder pipeline (finding due
// events, composing the branded email, sending, and marking remindersSent) —
// this route only authenticates the cron tick and triggers it.
export const GET: APIRoute = async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return jsonResponse({ error: "Reminders not configured (CRON_SECRET unset)" }, 503);
    }
    if (request.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    try {
        const cmsRes = await fetch(`${CMS_URL}/api/events/send-reminders`, {
            method: "POST",
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
            },
        });
        return jsonResponse(await cmsRes.json(), cmsRes.status);
    } catch {
        return jsonResponse({ error: "Reminder trigger failed" }, 502);
    }
};
