import { useMemo } from "react";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType, type SemesterType } from "@/types";
import Card, { ListCard } from "@/components/Card";
import {
  getCardLayoutClass,
  getCategorySlug,
  getEventThumbnail,
  getLocalizedEventTimes,
  getOptimizedImageUrl,
  isKnownCategory,
} from "@/utilities/helpers";
import { useUrlFilters } from "@/utilities/useUrlFilters";

interface SemesterEventsProps {
  events: EventType[];
  semester: SemesterType;
  currentSemester?: boolean; // whether this is the upcoming events display
  idx: number;
}

export default function SemesterEvents({
  events,
  semester,
  currentSemester = false,
  idx,
}: SemesterEventsProps) {
  const { category, viewMode } = useUrlFilters();

  // Category bucketing only: it bridges the gap between server-rendered
  // initial data (unfiltered) and the first filtered refetch on shared
  // links. Search results are the server's verdict and are not re-filtered.
  const filteredEvents = useMemo(() => {
    if (!category) return events;
    if (category === "other") {
      const knownLower = new Set(EVENT_CATEGORIES.map((c) => c.toLowerCase()));
      return events.filter((e) => !knownLower.has(e.eventType?.toLowerCase?.() ?? ""));
    }
    if (isKnownCategory(category)) {
      return events.filter((e) => e.eventType?.toLowerCase?.() === category);
    }
    return events;
  }, [events, category]);

  // Card dates/URLs only recompute when the data or layout changes, not on
  // every keystroke of the shared query state
  const cards = useMemo(
    () =>
      filteredEvents.map((event) => {
        const { localizedStart, localizedStartTime, localizedEndTime } =
          getLocalizedEventTimes(event);
        const image = getOptimizedImageUrl(getEventThumbnail(event), 192);
        const link = `/events/${getCategorySlug(event.eventType)}/${event.slug}`;

        return viewMode === "grid" ? (
          <Card
            key={event.id}
            date={format(localizedStart, "MMM d")}
            time={`${localizedStartTime}`}
            location={event.location_name}
            name={event.name}
            link={link}
            category={event.eventType}
          />
        ) : (
          <ListCard
            key={event.id}
            date={format(localizedStart, "MMM d")}
            startTime={localizedStartTime}
            endTime={localizedEndTime ? localizedEndTime : "???"}
            location={event.location_name}
            name={event.name}
            link={link}
            category={event.eventType}
            image={image ?? null}
          />
        );
      }),
    [filteredEvents, viewMode],
  );

  return (
    <div
      data-category-section={
        currentSemester ? "current-events" : `${semester.season}-${semester.year}`
      }
      className="[--line-card-gap:18px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] w-full px-2 flex flex-col gap-y-4"
      id={currentSemester ? "current-events-sec" : `sem-sec-${idx}`}
      data-sem-key={
        currentSemester ? "current-events" : `${semester.season}-${semester.year}`
      }
    >
      {/* Semester label */}
      <div className="z-50 sticky top-34 sm:top-24 w-fit">
        <div
          className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark border-solid border-[0px] border-white dark:border-zinc-700"
          style={{
            gap: "calc(var(--line-card-gap) - var(--sem-icon-size))",
            left: "calc(-1 * var(--sem-icon-size))",
          }}
        >
          <div className="relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) flex items-center justify-center bg-[#9ca3af]">
            <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900"></div>
          </div>
          <h3 className="text-base sm:text-base font-normal leading-none p-0 m-0 uppercase font-pixel">
            {semester.season} {semester.year}
          </h3>
        </div>
      </div>

      {/* Event cards */}
      <div className="pl-(--line-card-gap) border-l-1 border-gray-300">
        {cards.length > 0 ? (
          <div className={getCardLayoutClass(viewMode)}>{cards}</div>
        ) : (
          <div className="w-full text-base font-pixel text-gray-500">
            {currentSemester
              ? "No upcoming events found. Check back again soon!"
              : "No events found for this semester. Try a different filter!"}
          </div>
        )}
      </div>
    </div>
  );
}
