import { TZDate } from "@date-fns/tz";
import type { RenderedContent } from "astro:content";
import { format } from "date-fns";

// Academic semester: Spring (Jan–May), Summer (June–July), Fall (Aug–Dec) 
export type SemesterSeason = "spring" | "summer" | "fall";
export interface Semester {
  year: number;
  season: SemesterSeason;
}

// Earliest semester constant
export const EARLIEST_SEMESTER: Semester = { year: 2021, season: "spring" };

// Return academic semester for given date
export function getSemesterFromDate(date: Date): Semester {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1–12
  if (month >= 8) return { year, season: "fall" };
  if (month >= 6) return { year, season: "summer" };
  return { year, season: "spring" };
}

// Current semester based on today's date. 
export function getCurrentSemester(): Semester {
  return getSemesterFromDate(new Date());
}

// Sort by newest semester within a year
const SEMESTERS_NEWEST_FIRST: SemesterSeason[] = ["fall", "summer", "spring"];

// Get all semesters from current to earliest, newest first
export function getSemestersNewestFirst(): Semester[] {
  const current = getCurrentSemester();
  const list: Semester[] = [];

  // Iterate thru semesters starting from current year
  for (let y = current.year; y >= EARLIEST_SEMESTER.year; y--) {
    let semOrder = SEMESTERS_NEWEST_FIRST;
    for (const season of semOrder) {
      if (
        y === current.year &&
        semOrder.indexOf(season) > semOrder.indexOf(current.season)
      )
        // Skip nonexistent future semesters this year
        continue;
      if (
        y === EARLIEST_SEMESTER.year &&
        semOrder.indexOf(season) < semOrder.indexOf(EARLIEST_SEMESTER.season)
      )
        // Skip nonexistent past semesters from earliest year
        continue;
      list.push({ year: y, season });
    }
  }

  return list;
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

export function getEventMetadata(event: {
  id?: string;
  body?: string;
  collection?: "events";
  data: any;
  rendered?: RenderedContent;
  filePath?: string;
}): {
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
