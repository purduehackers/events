import { format } from "date-fns";

export function getEventSlug(path: string) {
    return path.split('/').slice(2).slice(0, -1).join('/');
}

export function getTime(time: string | undefined) {
    return time ? format(time, "hh:mm a") : "???";
}