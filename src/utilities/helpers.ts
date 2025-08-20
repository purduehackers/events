import { TZDate } from "@date-fns/tz";
import type { RenderedContent } from "astro:content";
import { format } from "date-fns";

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
