export const prerender = false;

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { format } from "date-fns";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

import { fetchEventsFromCMS } from "@/utilities/cms";
import { getCategorySlug, getLocalizedEventTimes, truncate } from "@/utilities/helpers";
import { SITE_URL as SITE } from "@/utilities/constants";
import type { EventType } from "@/types";

const PAST_ITEM_COUNT = 20;
const EXCERPT_MAX_CHARS = 300;

// The feed renders 6 scalar fields + the description blob; skip the populated
// media relations entirely
const FEED_SELECT = [
    "name", "slug", "eventType", "start", "end", "location_name", "createdAt", "description",
];
function setFeedParams(params: URLSearchParams) {
    for (const field of FEED_SELECT) params.set(`select[${field}]`, "true");
    params.set("depth", "0");
}

function buildDescription(event: EventType): string {
    const { localizedStart, localizedStartTime, localizedEndTime } =
        getLocalizedEventTimes(event);
    const when = `${localizedStartTime} – ${localizedEndTime} ET on ${format(localizedStart, "EEEE, MMMM do, yyyy")}`;
    const where = event.location_name ? ` @ ${event.location_name}` : "";

    let excerpt = "";
    try {
        excerpt = convertLexicalToPlaintext({ data: event.description }) ?? "";
    } catch {
        // events without a rich-text description still get the time/place line
    }
    excerpt = truncate(excerpt, EXCERPT_MAX_CHARS);

    return [when + where, excerpt].filter(Boolean).join("\n\n");
}

export async function GET(context: APIContext) {
    const now = new Date().toISOString();

    const upcomingParams = new URLSearchParams({
        sort: "start",
        limit: "50",
        "where[start][greater_than]": now,
    });
    const pastParams = new URLSearchParams({
        sort: "-start",
        limit: String(PAST_ITEM_COUNT),
        "where[start][less_than]": now,
    });

    setFeedParams(upcomingParams);
    setFeedParams(pastParams);
    const [upcoming, past] = await Promise.all([
        fetchEventsFromCMS(upcomingParams),
        fetchEventsFromCMS(pastParams),
    ]);
    if (!upcoming && !past) {
        return new Response("Failed to build feed", { status: 500 });
    }

    const events = [...(upcoming?.docs ?? []), ...(past?.docs ?? [])]
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    const feed = await rss({
        title: "Purdue Hackers Events",
        description:
            "Hack Nights, workshops, and shows from Purdue Hackers. All events are free.",
        site: context.site ?? SITE,
        items: events.map((event) => ({
            title: event.name,
            link: `/events/${getCategorySlug(event.eventType)}/${event.slug}`,
            pubDate: new Date(event.createdAt),
            description: buildDescription(event),
        })),
        customData: "<language>en-us</language>",
    });

    return new Response(await feed.text(), {
        status: 200,
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
