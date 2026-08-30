export const prerender = false;

import { createHash } from "node:crypto";
import type { APIRoute } from "astro";
import { PKPass } from "passkit-generator";
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";
import { getCategorySlug, getEventEnd } from "@/utilities/helpers";
import { isWalletConfigured } from "@/utilities/wallet-config";
import { WALLET_ICONS, WALLET_LOGOS } from "@/utilities/wallet-images";
import { buildThumbnails } from "@/utilities/wallet-thumbnail";

// Vercel env vars store multiline PEMs with literal \n sequences
function pem(value: string) {
    return value.replace(/\\n/g, "\n");
}

const EVENT_TZ = "America/Indiana/Indianapolis";

// Passes wear the site's category colors — a yellow Hack Night ticket is
// unmistakably a Hack Night ticket from across the room.
const PASS_STYLES: Record<
    string,
    { bg: string; fg: string; label: string; logo: "yellow" | "black" }
> = {
    "hack-night": { bg: "rgb(253, 211, 74)", fg: "rgb(0, 0, 0)", label: "rgb(0, 0, 0)", logo: "black" },
    workshop: { bg: "rgb(239, 185, 255)", fg: "rgb(0, 0, 0)", label: "rgb(0, 0, 0)", logo: "black" },
    show: { bg: "rgb(255, 166, 0)", fg: "rgb(0, 0, 0)", label: "rgb(0, 0, 0)", logo: "black" },
    default: { bg: "rgb(125, 59, 255)", fg: "rgb(255, 255, 255)", label: "rgb(253, 250, 74)", logo: "yellow" },
};

function inEventTz(iso: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TZ, ...options }).format(
        new Date(iso),
    );
}

function linkField(key: string, label: string, url: string, text: string) {
    return {
        key,
        label,
        value: url,
        attributedValue: `<a href="${url}">${text}</a>`,
    };
}

// Signed Apple Wallet event ticket, modeled on the anatomy of the best event
// passes (Luma's, chiefly): date+time in the header so stacked passes stay
// tellable apart, the cover art as thumbnail, guest personalization, and a
// back full of the things you actually need on the way to the door.
export const GET: APIRoute = async ({ params, url }) => {
    const slug = params.slug ?? "";
    if (!/^[a-zA-Z0-9.-]{1,120}$/.test(slug)) {
        return jsonResponse({ error: "Invalid slug" }, 400);
    }
    if (!isWalletConfigured()) {
        return jsonResponse({ error: "Wallet passes are not configured" }, 503);
    }

    // Optional personalization from the RSVP hub's remembered profile
    const guest = (url.searchParams.get("guest") ?? "")
        .replace(/[<>&"\p{Cc}]/gu, "")
        .trim()
        .slice(0, 80);

    try {
        const query = new URLSearchParams({
            "where[slug][equals]": slug,
            "where[published][equals]": "true",
            limit: "1",
            depth: "1",
        });
        const cmsRes = await fetch(`${CMS_URL}/api/events?${query.toString()}`, {
            headers: {
                Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
            },
        });
        if (!cmsRes.ok) {
            return jsonResponse({ error: "Failed to fetch event" }, 502);
        }
        const data = (await cmsRes.json()) as { docs?: Record<string, unknown>[] };
        const event = data.docs?.[0] as
            | {
                  name: string;
                  slug: string;
                  eventType?: string | null;
                  start: string;
                  end?: string | null;
                  location_name?: string | null;
                  location_url?: string | null;
                  images?: { image?: { url?: string | null } | null }[] | null;
              }
            | undefined;
        if (!event) {
            return jsonResponse({ error: "Event not found" }, 404);
        }

        const env = import.meta.env as Record<string, string>;
        const eventEnd = getEventEnd(event);
        const style =
            PASS_STYLES[getCategorySlug(event.eventType ?? "")] ?? PASS_STYLES.default;
        const eventUrl = new URL(
            `/events/${getCategorySlug(event.eventType)}/${event.slug}`,
            url.origin,
        ).toString();
        const directionsUrl =
            event.location_url ||
            (event.location_name
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_name)}`
                : null);

        const passJson = {
            formatVersion: 1,
            passTypeIdentifier: env.WALLET_PASS_TYPE_ID,
            teamIdentifier: env.WALLET_TEAM_ID,
            // Stable per guest+event, so re-downloads update instead of duplicating
            serialNumber: guest
                ? `ph-${event.slug}-${createHash("sha256").update(guest).digest("hex").slice(0, 8)}`
                : `ph-${event.slug}`,
            groupingIdentifier: "purdue-hackers-events",
            organizationName: "Purdue Hackers",
            description: `${event.name} ticket`,
            logoText: "Purdue Hackers",
            sharingProhibited: false,
            backgroundColor: style.bg,
            foregroundColor: style.fg,
            labelColor: style.label,
            relevantDate: new Date(event.start).toISOString(),
            expirationDate: new Date(
                eventEnd.getTime() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            semantics: {
                eventName: event.name,
                eventStartDate: new Date(event.start).toISOString(),
                eventEndDate: eventEnd.toISOString(),
                ...(event.location_name ? { venueName: event.location_name } : {}),
            },
            eventTicket: {
                // The header survives pass stacking — it must answer "when?"
                headerFields: [
                    {
                        key: "start",
                        label: inEventTz(event.start, { hour: "numeric", minute: "2-digit" }),
                        value: inEventTz(event.start, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                    },
                ],
                primaryFields: [
                    {
                        key: "event",
                        value: event.name,
                        changeMessage: "Event name changed to %@",
                    },
                ],
                secondaryFields: event.location_name
                    ? [
                          {
                              key: "location",
                              label: "LOCATION",
                              value: event.location_name,
                              changeMessage: "Event location changed to %@",
                          },
                      ]
                    : [],
                auxiliaryFields: [
                    ...(guest ? [{ key: "guest", label: "GUEST", value: guest }] : []),
                    { key: "host", label: "HOST", value: "Purdue Hackers" },
                ],
                backFields: [
                    linkField("page", "Event Page", eventUrl, eventUrl),
                    {
                        key: "start_long",
                        label: "Start Time",
                        value: new Date(event.start).toISOString(),
                        dateStyle: "PKDateStyleLong",
                        timeStyle: "PKDateStyleShort",
                        changeMessage: "Start time changed to %@",
                    },
                    ...(event.location_name
                        ? [{ key: "where", label: "Location", value: event.location_name }]
                        : []),
                    ...(directionsUrl
                        ? [linkField("directions", "Directions", directionsUrl, "Open in Maps")]
                        : []),
                    ...(guest ? [{ key: "guest_back", label: "Guest", value: guest }] : []),
                    {
                        key: "cancel",
                        label: "Can't make it?",
                        value: "Cancel anytime from the event page — your spot frees up instantly.",
                    },
                ],
            },
        };

        const coverUrl = event.images?.[0]?.image?.url ?? null;
        const thumbnails = coverUrl ? await buildThumbnails(coverUrl) : null;

        const pass = new PKPass(
            {
                "pass.json": Buffer.from(JSON.stringify(passJson)),
                ...Object.fromEntries(
                    [
                        ...Object.entries(WALLET_ICONS),
                        ...Object.entries(WALLET_LOGOS[style.logo]),
                    ].map(([name, b64]) => [name, Buffer.from(b64, "base64")]),
                ),
                ...(thumbnails ?? {}),
            },
            {
                wwdr: pem(env.WALLET_WWDR_PEM),
                signerCert: pem(env.WALLET_SIGNER_CERT_PEM),
                signerKey: pem(env.WALLET_SIGNER_KEY_PEM),
                signerKeyPassphrase: env.WALLET_SIGNER_KEY_PASSPHRASE || undefined,
            },
        );
        pass.setBarcodes({
            message: eventUrl,
            format: "PKBarcodeFormatQR",
            messageEncoding: "utf-8",
        });

        return new Response(new Uint8Array(pass.getAsBuffer()), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": `attachment; filename="${event.slug}.pkpass"`,
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
            },
        });
    } catch {
        return jsonResponse({ error: "Failed to generate pass" }, 500);
    }
};
