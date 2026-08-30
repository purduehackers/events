export const prerender = false;

import type { APIRoute } from "astro";
import { PKPass } from "passkit-generator";
import { CMS_URL } from "@/utilities/constants";
import { jsonResponse } from "@/utilities/cms";
import { getCategorySlug, getEventEnd } from "@/utilities/helpers";
import { isWalletConfigured } from "@/utilities/wallet-config";
import { WALLET_IMAGES } from "@/utilities/wallet-images";

// Vercel env vars store multiline PEMs with literal \n sequences
function pem(value: string) {
    return value.replace(/\\n/g, "\n");
}

// Signed Apple Wallet event ticket for a published event. The serial number
// is the slug, so re-downloading updates the existing pass in Wallet instead
// of stacking duplicates.
export const GET: APIRoute = async ({ params, url }) => {
    const slug = params.slug ?? "";
    if (!/^[a-zA-Z0-9.-]{1,120}$/.test(slug)) {
        return jsonResponse({ error: "Invalid slug" }, 400);
    }
    if (!isWalletConfigured()) {
        return jsonResponse({ error: "Wallet passes are not configured" }, 503);
    }

    try {
        const query = new URLSearchParams({
            "where[slug][equals]": slug,
            "where[published][equals]": "true",
            limit: "1",
            depth: "0",
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
              }
            | undefined;
        if (!event) {
            return jsonResponse({ error: "Event not found" }, 404);
        }

        const env = import.meta.env as Record<string, string>;
        const eventEnd = getEventEnd(event);
        const eventUrl = new URL(
            `/events/${getCategorySlug(event.eventType)}/${event.slug}`,
            url.origin,
        ).toString();

        const passJson = {
            formatVersion: 1,
            passTypeIdentifier: env.WALLET_PASS_TYPE_ID,
            teamIdentifier: env.WALLET_TEAM_ID,
            serialNumber: `ph-${event.slug}`,
            organizationName: "Purdue Hackers",
            description: `${event.name} — Purdue Hackers`,
            logoText: "Purdue Hackers",
            backgroundColor: "rgb(16, 16, 19)",
            foregroundColor: "rgb(255, 255, 255)",
            labelColor: "rgb(253, 250, 74)",
            relevantDate: new Date(event.start).toISOString(),
            expirationDate: new Date(
                eventEnd.getTime() + 24 * 60 * 60 * 1000,
            ).toISOString(),
            eventTicket: {
                primaryFields: [{ key: "event", label: "EVENT", value: event.name }],
                secondaryFields: [
                    {
                        key: "when",
                        label: "WHEN",
                        value: new Date(event.start).toISOString(),
                        dateStyle: "PKDateStyleMedium",
                        timeStyle: "PKDateStyleShort",
                    },
                    ...(event.location_name
                        ? [{ key: "where", label: "WHERE", value: event.location_name }]
                        : []),
                ],
                backFields: [{ key: "page", label: "EVENT PAGE", value: eventUrl }],
            },
        };

        const pass = new PKPass(
            {
                "pass.json": Buffer.from(JSON.stringify(passJson)),
                ...Object.fromEntries(
                    Object.entries(WALLET_IMAGES).map(([name, b64]) => [
                        name,
                        Buffer.from(b64, "base64"),
                    ]),
                ),
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
            messageEncoding: "iso-8859-1",
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
