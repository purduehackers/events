// Turn an event's location_url into something the Google Maps embed can
// actually render.
//
// Organizers paste whatever the Maps share sheet hands them, which today is a
// maps.app.goo.gl short link. Those carry no query at all — they 302 to a
// /maps/place/<name>/@lat,lng,zoom URL — so the embed used to fall back to the
// venue name ("CL50 224"). Google can't geocode a room code, and the embed
// renders a zoomed-out world map instead of an error. We resolve the short
// link server-side and embed the coordinates from the redirect target.
//
// Why coordinates and not the place name: the embed's `q=` search has no
// location bias, so a generic name like "Memorial Mall" lands in Kansas.
// `q=lat,lng` is the only form that is deterministic.

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);

export interface MapTarget {
  /** Value for the embed's `q=` — coordinates when we have them, else a search string. */
  query: string;
  coords?: { lat: number; lng: number };
}

const COORD = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
// Marker position inside the data= blob: …!8m2!3d40.4282417!4d-86.9223556!…
const MARKER_RE = new RegExp(String.raw`!3d${COORD}!4d${COORD}`);
// Viewport centre in the path: /maps/place/<name>/@40.4263482,-86.9176362,17z/…
const VIEWPORT_RE = new RegExp(String.raw`/@${COORD},${COORD}`);

/** Pull an embeddable target out of a full Google Maps URL, or null if it has none. */
export function parseGoogleMapsUrl(raw: string): MapTarget | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  // The marker is where the pin actually is; the @viewport is just wherever
  // the map happened to be scrolled when the link was shared. Prefer the pin,
  // and accept the viewport when the link carries no marker.
  const path = url.pathname + url.search;
  const m = path.match(MARKER_RE) ?? path.match(VIEWPORT_RE);
  if (m) {
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { query: `${lat},${lng}`, coords: { lat, lng } };
    }
  }

  // https://www.google.com/maps/search/?api=1&query=… or legacy ?q=…
  const q = url.searchParams.get("q") ?? url.searchParams.get("query");
  if (q) return { query: q };

  return null;
}

// Successful resolutions are memoized per function instance. ISR already caps
// renders to one an hour per page, and Fluid Compute reuses instances, so this
// mostly saves the round trip when several events share a venue link.
const resolved = new Map<string, MapTarget>();

/**
 * Resolve a CMS location_url into a map target. Follows Google short links
 * (one hop, HEAD only) to read the coordinates off the redirect. Returns null
 * for anything it can't make sense of so the caller can fall back to the
 * venue name.
 */
export async function resolveMapTarget(
  locationUrl: string | null | undefined,
): Promise<MapTarget | null> {
  if (!locationUrl) return null;

  const cached = resolved.get(locationUrl);
  if (cached) return cached;

  const direct = parseGoogleMapsUrl(locationUrl);
  if (direct) {
    resolved.set(locationUrl, direct);
    return direct;
  }

  let host: string;
  try {
    host = new URL(locationUrl).hostname;
  } catch {
    return null;
  }
  if (!SHORT_LINK_HOSTS.has(host)) return null;

  try {
    const res = await fetch(locationUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
    });
    const location = res.headers.get("location");
    const target = location ? parseGoogleMapsUrl(location) : null;
    if (target) resolved.set(locationUrl, target);
    return target;
  } catch {
    // Network hiccup or timeout: don't cache, the next render can retry.
    return null;
  }
}
