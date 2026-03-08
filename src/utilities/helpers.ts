import type { EventType, SemesterType, SemesterSeason } from "@/types";
import { TZDate } from "@date-fns/tz";
import type { RenderedContent } from "astro:content";
import { format } from "date-fns";

export interface Event {
  id?: string;
  body?: string;
  collection?: "events";
  data: any;
  rendered?: RenderedContent;
  filePath?: string;
}

// Earliest semester constant
export const EARLIEST_SEMESTER: SemesterType = { year: 2022, season: "spring" };

// Get date range given semester
export function getSemesterDateRange(semester: SemesterType): { start: Date; end: Date } {
  const { year, season } = semester;
  let start: Date, end: Date;
  if (season === "spring") {
    start = new Date(year, 0, 1); // Jan 1
    end = new Date(year, 5, 30); // June 30
  } else { // fall
    start = new Date(year, 6, 1); // July 1
    end = new Date(year, 11, 31); // Dec 31
  }
  return { start, end };
}

// Get academic semester for given date
export function getSemesterFromDate(date: Date): SemesterType {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1–12
  if (month >= 7) return { year, season: "fall" };
  return { year, season: "spring" };
}

// Current semester based on today's date
export function getCurrentSemester(): SemesterType {
  return getSemesterFromDate(new Date());
}

// Sort by newest semester within a year
const SEMESTERS_NEWEST_FIRST: SemesterSeason[] = ["fall", "spring"];

// Get all semesters from current to earliest, newest first
export function getSemestersNewestFirst(): SemesterType[] {
  const current = getCurrentSemester();
  const list: SemesterType[] = [];

  // Iterate thru semesters starting from current year
  for (let y = current.year; y >= EARLIEST_SEMESTER.year; y--) {
    let semOrder = SEMESTERS_NEWEST_FIRST;
    for (const season of semOrder) {
      if (y === current.year && semOrder.indexOf(season) < semOrder.indexOf(current.season)) {
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

export function getEventMetadata(event: Event): {
  name: string;
  localizedStart: TZDate;
  localizedStartTime: string;
  localizedEnd: TZDate | undefined;
  localizedEndTime: string;
} {
  const name = event.data.name;
  const start = event.data.start;
  const localizedStart = getLocalizedDate(start);
  const localizedStartTime = format(localizedStart, "hh:mm a");
  const localizedEnd = event.data.end
    ? getLocalizedDate(event.data.end)
    : undefined;
  const localizedEndTime = getTime(localizedEnd);

  return {
    name,
    localizedStart,
    localizedStartTime,
    localizedEnd,
    localizedEndTime,
  };
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