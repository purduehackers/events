import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export function getEventSlug(path: string) {
    return path.split('/').slice(2).slice(0, -1).join('/');
}

export function getTime(time: TZDate | string | undefined) {
    return time ? format(time, "hh:mm a") : "???";
}

export function getLocalizedDate(date: string): TZDate {
    return new TZDate(date, "America/Indiana/Indianapolis");
}