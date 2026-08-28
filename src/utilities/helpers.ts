import { EVENT_CATEGORIES } from "@/types";
import type { EventType, SemesterType, SemesterSeason } from "@/types";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { CMS_URL } from "@/utilities/constants";

// The card lists only render these fields; fetching just them keeps list
// responses (and serialized island props) small.
const CARD_SELECT_FIELDS = [
  "name",
  "slug",
  "eventType",
  "start",
  "end",
  "location_name",
  "published",
  "images",
] as const;

export function setCardSelectParams(params: URLSearchParams) {
  for (const field of CARD_SELECT_FIELDS) {
    params.set(`select[${field}]`, "true");
  }
}

// Canonical URL segment for an event's category — the one slugification every
// surface (cards, links, feeds) must agree on. Also used as the badge label
// (badges render uppercase, so case is irrelevant there).
export function getCategorySlug(eventType: string): string {
  return eventType.replaceAll(" ", "-").toLowerCase();
}

export function getEventThumbnail(event: EventType): string | undefined {
  return event.images?.[0]?.image?.url ?? undefined;
}

// Route CMS-hosted images through Vercel's edge image optimizer so full-res
// originals are resized/re-encoded at the CDN instead of shipped to the
// client (or transformed in our own function). Callers crop with CSS
// object-cover; the optimizer only resizes by width.
// Must match imagesConfig.sizes in astro.config.mjs.
const OPTIMIZED_WIDTHS = [192, 368, 400, 640, 800, 1200, 1600];

function isOptimizableHost(hostname: string): boolean {
  return (
    hostname === new URL(CMS_URL).hostname ||
    hostname.endsWith(".public.blob.vercel-storage.com")
  );
}

export function getOptimizedImageUrl(
  src: string | null | undefined,
  width: number,
): string | undefined {
  if (!src) return undefined;
  try {
    if (!isOptimizableHost(new URL(src).hostname)) return src;
  } catch {
    return src;
  }
  // /_vercel/image only exists on deployments
  if (import.meta.env.DEV) return src;
  const w = OPTIMIZED_WIDTHS.find((allowed) => allowed >= width) ?? OPTIMIZED_WIDTHS.at(-1);
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

export function getOptimizedSrcset(
  src: string | null | undefined,
  widths: number[],
): string | undefined {
  const entries = widths
    .map((w) => {
      const url = getOptimizedImageUrl(src, w);
      return url && url !== src ? `${url} ${w}w` : null;
    })
    .filter(Boolean);
  return entries.length > 0 ? entries.join(", ") : undefined;
}

// Earliest semester constant
export const EARLIEST_SEMESTER: SemesterType = { year: 2022, season: "spring" };

// Get date range given semester
export function getSemesterDateRange(semester: SemesterType): { start: Date; end: Date } {
  const { year, season } = semester;
  let start: Date, end: Date;
  if (season === "spring") {
    start = new Date(year, 0, 1); // Jan 1
    end = new Date(year, 4, 31); // May 31
  } else { // fall
    start = new Date(year, 5, 1); // June 1
    end = new Date(year, 11, 31); // Dec 31
  }
  return { start, end };
}

// Get academic semester for given date
export function getSemesterFromDate(date: Date): SemesterType {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1–12
  if (month >= 6) return { year, season: "fall" };
  return { year, season: "spring" };
}

// Sort by newest semester within a year
const SEMESTERS_NEWEST_FIRST: SemesterSeason[] = ["fall", "spring"];

// Get all semesters from current to earliest, newest first
export function getSemestersNewestFirst(latest?: SemesterType ): SemesterType[] {
  if (!latest) latest = getSemesterFromDate(new Date());
  const list: SemesterType[] = [];

  // Iterate thru semesters starting from current year
  for (let y = latest.year; y >= EARLIEST_SEMESTER.year; y--) {
    let semOrder = SEMESTERS_NEWEST_FIRST;
    for (const season of semOrder) {
      if (y === latest.year && semOrder.indexOf(season) < semOrder.indexOf(latest.season)) {
        // Skip nonexistent future semesters this year
        continue;
      }
      if (y === EARLIEST_SEMESTER.year && semOrder.indexOf(season) > semOrder.indexOf(EARLIEST_SEMESTER.season)) {
        // Skip nonexistent past semesters from earliest year
        continue;
      }
      list.push({ year: y, season });
    }
  }

  return list;
}

// Get all events of a given semester
export function getEventsInSemester(events: EventType[], semester: SemesterType) {
  return events
    .filter((event) => {
      const s = getSemesterFromDate(new Date(event.start));
      return s.year === semester.year && s.season === semester.season;
    })
    .sort((a, b) =>
      // Sort by newest 
      new Date(b.start).getTime() - new Date(a.start).getTime()
    );
}

export function getEventSlug(path: string) {
  return path.split("/").slice(2).slice(0, -1).join("/");
}

export function getTime(time: TZDate | string | undefined) {
  return time ? format(time, "hh:mm a") : "???";
}

export function getLocalizedDate(date: string): TZDate {
  return new TZDate(date, "America/Indiana/Indianapolis");
}

export function getLocalizedEventTimes(event: EventType): {
  localizedStart: TZDate;
  localizedStartTime: string;
  localizedEnd: TZDate | undefined;
  localizedEndTime: string;
} {
  const start = event.start;
  const localizedStart = getLocalizedDate(start);
  const localizedStartTime = format(localizedStart, "hh:mm a");
  const localizedEnd = event.end
    ? getLocalizedDate(event.end)
    : undefined;
  const localizedEndTime = getTime(localizedEnd);

  return {
    localizedStart,
    localizedStartTime,
    localizedEnd,
    localizedEndTime,
  };
}

/* Event Category Helpers */

export function isKnownCategory(category: string | null) {
  return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}

export function getCategoryColor(category?: string | null): string {
  return EVENT_CATEGORIES.includes(category?.toLowerCase() ?? "") ? (category?.toLowerCase() ?? "other") : "other";
}

export function getCategoryBadgeClasses(categoryColor: string) {
  switch (categoryColor) {
    case "hack-night":
      return "bg-black text-white dark:bg-transparent dark:text-hack-night";
    case "workshop":
      return "bg-workshop text-white dark:bg-transparent dark:text-workshop";
    case "show":
      return "bg-show text-white dark:bg-transparent dark:text-show";
    default:
      return "bg-other text-white dark:bg-transparent dark:text-other";
  }
}

export function getCategoryIconClasses(categoryColor: string) {
  switch (categoryColor) {
    case "hack-night":
      return "group-hover:text-black dark:group-hover:text-hack-night";
    case "workshop":
      return "group-hover:text-workshop";
    case "show":
      return "group-hover:text-show";
    default:
      return "group-hover:text-other";
  }
}