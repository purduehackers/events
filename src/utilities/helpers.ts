import { EVENT_CATEGORIES } from "@/types";
import type { EventType, SemesterType, SemesterSeason } from "@/types";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

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

export function isKnownCategory(category: string | null) {
  return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}