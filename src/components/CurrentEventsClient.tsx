import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType } from "@/types";
import Card from "@/components/Card";
import { getLocalizedEventTimes } from "@/utilities/helpers";

interface CurrentEventsClientProps {
  initialEvents: EventType[];
}

function getCategoryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("cat")?.trim().toLowerCase();
  return raw || null;
}

function isKnownCategory(category: string | null) {
  return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}

export default function CurrentEventsClient({ initialEvents }: CurrentEventsClientProps) {
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const category = getCategoryFromUrl();
    setSelectedCategory(category);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail;
      setSelectedCategory(detail);
    };

    window.addEventListener("pastEvents:categoryChange", handler as EventListener);
    return () => window.removeEventListener("pastEvents:categoryChange", handler as EventListener);
  }, []);

  const isOther = selectedCategory === "other";
  const isKnown = isKnownCategory(selectedCategory);

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events;

    if (isOther) {
      const knownLower = new Set(EVENT_CATEGORIES.map((c) => c.toLowerCase()));
      return events.filter((e) => !knownLower.has(e.eventType?.toLowerCase?.() ?? ""));
    }

    if (isKnown) {
      return events.filter((e) => e.eventType?.toLowerCase?.() === selectedCategory);
    }

    return events;
  }, [events, isKnown, isOther, selectedCategory]);

  return (
    <div
      data-category-section="current-events"
      className="lg:container flex flex-col mb-0 sm:pt-14 px-4 sm:px-12 md:px-18 xl:px-28 text-left gap-y-4 lg:max-w-screen-2xl mx-auto"
    >
      <h2 className="text-3xl sm:text-4xl font-mono font-black m-0">Upcoming events</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:auto-cols-fr text-center">
        {filteredEvents.map((event) => {
          const { localizedStart, localizedStartTime, localizedEndTime } = getLocalizedEventTimes(event);

          return (
<Card date={format(localizedStart, "MMMM d, yyyy")}
              time={`${localizedStartTime}${localizedEndTime ? ` - ${localizedEndTime}` : ""}`}     
              location={event.location_name}
              name={event.name}
              link={`/events/${event.id}`}
              category={event.eventType}
            />
          );
        })}
      </div>

      <a className="hidden" href="https://lu.ma/user/purduehackers" target="_blank" rel="noreferrer">
        <div className="w-full md:w-fit rounded-sm bg-yellow dark:text-black p-4 flex flex-col justify-center gap-y-3">
          <p className="font-pixel uppercase text-sm">--new--</p>
          <h2 className="font-mono text-left text-2xl sm:text-3xl font-bold">
            Looking for upcoming events?
          </h2>
          <p className="font-subtext">Current and future events are now posted on Luma!</p>
          <button className="cursor-pointer w-fit px-2 uppercase text-sm font-pixel font-normal text-white bg-black rounded-sm">
            Check it out {'>>'}
          </button>
        </div>
      </a>
    </div>
  );
}
