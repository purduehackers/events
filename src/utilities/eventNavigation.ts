import { format } from "date-fns";
import { getLocalizedDate } from "./helpers";

export const EVENT_DATE_SELECT = "eventDateSelect";

// Match the day printed on the card, including events after midnight UTC.
export function getEventDateKey(date: string | Date): string {
  return format(getLocalizedDate(typeof date === "string" ? date : date.toISOString()), "yyyy-MM-dd");
}

export function scrollToEventDate(date: string): void {
  const card = document.querySelector<HTMLElement>(`[data-event-date="${date}"]`);
  card?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
}
