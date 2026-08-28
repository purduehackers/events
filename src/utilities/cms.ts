import { CMS_URL } from "./constants";
import type { EventType, PayloadResponse } from "@/types";

export function jsonResponse(
  body: unknown,
  status = 200,
  cacheControl = "no-store",
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cacheControl },
  });
}

// Strip events down to what the cards render before serializing them into
// island props — the full docs carry Lexical descriptions and entire photo
// galleries that would otherwise double the HTML payload.
export function slimEventsForCards(events: EventType[]): EventType[] {
  return events.map((event) => {
    const firstImage = event.images?.[0];
    return {
      ...event,
      description: undefined,
      stats: undefined,
      images: firstImage
        ? [
            {
              id: firstImage.id,
              image: {
                id: firstImage.image?.id,
                url: firstImage.image?.url,
                width: firstImage.image?.width,
                height: firstImage.image?.height,
                alt: firstImage.image?.alt,
              },
            },
          ]
        : [],
    } as unknown as EventType;
  });
}

// Server-side only: fetches events directly from Payload with the API key.
// Returns null on any failure so callers can fall back to client-side fetching.
export async function fetchEventsFromCMS(
  params: URLSearchParams,
): Promise<PayloadResponse<EventType> | null> {
  params.set("where[published][equals]", "true");
  try {
    const res = await fetch(`${CMS_URL}/api/events?${params.toString()}`, {
      headers: {
        Authorization: `service-accounts API-Key ${import.meta.env.PAYLOAD_API_KEY}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as PayloadResponse<EventType>;
  } catch {
    return null;
  }
}
