export const prerender = false;

import ical, { ICalEventRepeatingFreq, ICalWeekday } from 'ical-generator';
import { getVtimezoneComponent } from '@touch4it/ical-timezones';
import { TZDate } from '@date-fns/tz';
import { CMS_URL, SITE_URL } from "@/utilities/constants";
import { getCategorySlug, getEventEnd, getSemesterDateRange, getSemesterFromDate, setCardSelectParams } from "@/utilities/helpers";
import { EVENT_CATEGORIES, type EventType } from '@/types';
const FEED_TIMEZONE = "America/Indiana/Indianapolis";
const PAST_WINDOW_DAYS = 60;

// Hack nights are entered in the CMS retroactively (the numbered "5.8"-style
// docs appear around or after the night itself), so a doc-driven feed would
// never show subscribers a future Friday. Instead the feed emits one synthetic
// weekly series (Fri 8-11pm ET, bounded to the current semester) and excludes
// the individual hack-night docs to avoid duplicates. Flip to false to revert
// to doc-driven hack-night entries.
const EMIT_HACK_NIGHT_SERIES = true;

const FEED_CATEGORIES = {
    "hack-night": { label: "Hack Nights", filename: "purdue-hackers-hack-nights.ics" },
    workshop: { label: "Workshops", filename: "purdue-hackers-workshops.ics" },
    show: { label: "Shows", filename: "purdue-hackers-shows.ics" },
    other: { label: "Other Events", filename: "purdue-hackers-other.ics" },
} as const;
type FeedCategory = keyof typeof FEED_CATEGORIES;

// The upcoming Friday 20:00-23:00 in Eastern wall time, as absolute instants
function hackNightSeriesTimes() {
    const nowEt = new TZDate(new Date(), FEED_TIMEZONE);
    const daysUntilFriday = (5 - nowEt.getDay() + 7) % 7;
    const start = new TZDate(
        nowEt.getFullYear(), nowEt.getMonth(), nowEt.getDate() + daysUntilFriday,
        20, 0, 0, FEED_TIMEZONE,
    );
    const end = new TZDate(
        nowEt.getFullYear(), nowEt.getMonth(), nowEt.getDate() + daysUntilFriday,
        23, 0, 0, FEED_TIMEZONE,
    );
    // The series rolls forward: the feed regenerates on every poll, so bounding
    // it to the current semester keeps breaks (winter/summer) out of calendars
    const semesterEnd = getSemesterDateRange(getSemesterFromDate(new Date())).end;
    const until = new TZDate(
        semesterEnd.getFullYear(), semesterEnd.getMonth(), semesterEnd.getDate(),
        23, 59, 59, FEED_TIMEZONE,
    );
    return { start, end, until };
}

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

    // The hack-night feed is the synthetic series alone while it's enabled
    const seriesOnly = EMIT_HACK_NIGHT_SERIES && cat === "hack-night" && !slug;

    // Fetch events from CMS
    let cmsEvents: EventType[] = [];
    if (!seriesOnly) {
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
                } else if (EMIT_HACK_NIGHT_SERIES) {
                    // The series below stands in for the individual docs
                    params.set("where[eventType][not_equals]", "hack-night");
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

        // The weekly Hack Night series (all-events feed and the hack-night feed)
        if (EMIT_HACK_NIGHT_SERIES && !slug && (cat === null || cat === "hack-night")) {
            const { start, end, until } = hackNightSeriesTimes();
            calendar.createEvent({
                id: "hack-night-series@events.purduehackers.com",
                summary: "Hack Night",
                description: "Every Friday 8pm at the Bechtel Center. Come check it out!",
                start,
                end,
                timezone: FEED_TIMEZONE,
                location: "Bechtel Innovation Design Center",
                url: `${SITE_URL}/?cat=hack-night`,
                repeating: {
                    freq: ICalEventRepeatingFreq.WEEKLY,
                    byDay: [ICalWeekday.FR],
                    until,
                },
            });
        }

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
