export const prerender = false;

import ical from 'ical-generator';
import { getVtimezoneComponent } from '@touch4it/ical-timezones';
import { CMS_URL, SITE_URL } from "@/utilities/constants";
import { getCategorySlug, getEventEnd, setCardSelectParams } from "@/utilities/helpers";
import { EVENT_CATEGORIES, type EventType } from '@/types';
const FEED_TIMEZONE = "America/Indiana/Indianapolis";
const PAST_WINDOW_DAYS = 60;

const FEED_CATEGORIES = {
    "hack-night": { label: "Hack Nights", filename: "purdue-hackers-hack-nights.ics" },
    workshop: { label: "Workshops", filename: "purdue-hackers-workshops.ics" },
    show: { label: "Shows", filename: "purdue-hackers-shows.ics" },
    other: { label: "Other Events", filename: "purdue-hackers-other.ics" },
} as const;
type FeedCategory = keyof typeof FEED_CATEGORIES;

export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const catParam = url.searchParams.get("cat");

    if (catParam !== null && !(catParam in FEED_CATEGORIES)) {
        return new Response(
            JSON.stringify({ error: `Unknown category: ${catParam}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    const cat = catParam as FeedCategory | null;

    // Fetch events from CMS
    let cmsEvents: EventType[] = [];
    try {
        // Filter for published only
        const params = new URLSearchParams();
        params.set("where[published][equals]", "true");
        params.set("depth", "0");
        setCardSelectParams(params); // images come back as bare ids at depth 0

        if (slug) {
            params.set("where[slug][equals]", slug);
            params.set("limit", "1");
        } else {
            // All upcoming events plus a trailing window of recent ones
            const windowStart = new Date(Date.now() - PAST_WINDOW_DAYS * 24 * 60 * 60 * 1000);
            params.set("sort", "start");
            params.set("where[start][greater_than]", windowStart.toISOString());
            params.set("pagination", "false");

            if (cat === "other") {
                params.set("where[eventType][not_in]", EVENT_CATEGORIES.join(","));
            } else if (cat) {
                params.set("where[eventType][equals]", cat);
            }
        }

        // Make authorized fetch request
        const baseUrl = `${CMS_URL}/api/events?${params.toString()}`;
        const apiKey = import.meta.env.PAYLOAD_API_KEY;
        const cmsRes = await fetch(baseUrl, {
            headers: {
                Authorization: `service-accounts API-Key ${apiKey}`,
            },
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
        const calendarName = slug
            ? cmsEvents?.[0]?.name ?? 'Purdue Hackers Events'
            : cat
                ? `Purdue Hackers — ${FEED_CATEGORIES[cat].label}`
                : 'Purdue Hackers Events';
        const calendar = ical({ name: calendarName });
        // VTIMEZONE so recurring entries keep Eastern wall time across DST
        calendar.timezone({ name: FEED_TIMEZONE, generator: getVtimezoneComponent });

        // Loop through events and add them to the calendar
        const eventsToInclude = slug ? cmsEvents.slice(0, 1) : cmsEvents;
        eventsToInclude.forEach((event: EventType) => {
            calendar.createEvent({
                // Stable UID per event so subscriptions never duplicate entries
                id: `${event.id}@events.purduehackers.com`,
                summary: event.name,
                description: event.name,
                start: new Date(event.start),
                end: getEventEnd(event),
                timezone: FEED_TIMEZONE,
                location: event.location_name,
                url: `${SITE_URL}/events/${getCategorySlug(event.eventType)}/${event.slug}`,
            });
        });

        const filename = slug
            ? `${cmsEvents?.[0]?.name}.ics`
            : cat
                ? FEED_CATEGORIES[cat].filename
                : 'ph-events.ics';

        // Return compiled .ics content
        return new Response(calendar.toString(), {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch(e) {
        return new Response(
            JSON.stringify({ error: 'Failed to generate calendar file' }),
            { status: 500 }
        );
    }
}
