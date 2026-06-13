export const prerender = false;

import ical, { ICalCalendar } from 'ical-generator';
import { CMS_URL } from "@/utilities/constants";
import type { EventType } from '@/types';

export async function GET() {
    // Fetch events from CMS
    let cmsEvents = [];
    try {
        // Filter for published only
        const params = new URLSearchParams();
        params.set("where[published][equals]", "true");
        //params.set("where[start][greater_than]", new Date().toISOString());

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
        console.log(data);
        cmsEvents = data?.docs || [];

    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Failed to fetch events' }),
            { status: 500 }
        );
    }
    
    // Generate calendar output
    try {
        // Initialize the calendar
        const calendar = ical({
            name: 'Purdue Hackers Events',
            timezone: 'UTC'
        });

        // Loop through CMS events and add them to calendar
        cmsEvents.forEach((event: EventType) => {
            const category = event.eventType.replaceAll(" ", "-").toLowerCase();
            calendar.createEvent({
                id: event.id,
                summary: event.name,
                description: event.description,
                start: new Date(event.start),
                end: new Date(event.end),
                location: event.location_name,
                url: `https://events.purduehackers.com/events/${category}/${event.slug}`,
            });
        });

        // Return compiled .ics content
        return new Response(calendar.toString(), {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="ph-events.ics"'
            }
        });
    } catch(e) {
        return new Response(
            JSON.stringify({ error: 'Failed to generate calendar file' }),
            { status: 500 }
        );
    }
}
