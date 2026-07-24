export const prerender = false;

import ical from 'ical-generator';
import { CMS_URL } from "@/utilities/constants";
import type { EventType } from '@/types';

export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    // Fetch events from CMS
    let cmsEvents: EventType[] = [];
    try {
        // Filter for published only
        const params = new URLSearchParams();
        params.set("where[published][equals]", "true");

        if (slug) {
            params.set("where[slug][equals]", slug);
            params.set("limit", "1");
        } else {
            params.set("sort", "-start");
            params.set("limit", "30");
        }

        // Make authorized fetch request
        const baseUrl = `${CMS_URL}/api/events?${params.toString()}`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;
        const cmsRes = await fetch(baseUrl, {
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
            cache: 'no-store',
        });

        const data = await cmsRes.json();
        cmsEvents = data?.docs || [];

    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Failed to fetch events' }),
            { status: 500 }
        );
    }

    if (slug && cmsEvents.length === 0) {
        return new Response(
            JSON.stringify({ error: 'Event not found' }),
            { status: 404 }
        );
    }

    // Generate calendar output
    try {
        // Initialize the calendar
        const calendar = ical({
            name: slug ? cmsEvents?.[0]?.name ?? 'Purdue Hackers Events' : 'Purdue Hackers Events',
            timezone: 'UTC'
        });

        // Loop through events and add them to the calendar
        const eventsToInclude = slug ? cmsEvents.slice(0, 1) : cmsEvents;
        eventsToInclude.forEach((event: EventType) => {
            const category = event.eventType.replaceAll(" ", "-").toLowerCase();
            const endDate = event.end ?? new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
            calendar.createEvent({
                summary: event.name,
                description: event.name,
                start: new Date(event.start),
                end: new Date(endDate),
                location: event.location_name,
                url: `https://events.purduehackers.com/events/${category}/${event.slug}`,
            });
        });

        // Return compiled .ics content
        return new Response(calendar.toString(), {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${slug ? `${cmsEvents?.[0]?.name}.ics` : 'ph-events.ics'}"`
            }
        });
    } catch(e) {
        return new Response(
            JSON.stringify({ error: 'Failed to generate calendar file' }),
            { status: 500 }
        );
    }
}
