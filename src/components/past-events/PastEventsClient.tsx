import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType, type SemesterType } from "@/types";
import Card from "@/components/Card";
import { CMS_URL } from "@/utilities/constants";
import { getEventsInSemester, getLocalizedEventTimes } from "@/utilities/helpers";

interface PastEventsClientProps {
  initialEvents: EventType[];
  initialSemesters: SemesterType[];
  initialPage: number;
  limit: number;
  initialHasNextPage: boolean;
}

function getCategoryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("cat")?.trim().toLowerCase();
  return raw || null;
}

function isKnownCategory(category: string | null) {
  return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}

export default function PastEventsClient({
  initialEvents,
  initialSemesters,
  initialPage,
  limit,
  initialHasNextPage,
}: PastEventsClientProps) {
    const [events, setEvents] = useState<EventType[]>(initialEvents);
    const [page, setPage] = useState(initialPage);
    const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Use semesters computed at build time so server render matches hydration
    const allSemesters = useMemo(() => initialSemesters, [initialSemesters]);

    // Apply category filter 
    useEffect(() => {
        const category = getCategoryFromUrl();
        setSelectedCategory(category);

        // If the user has a known category selected on load, reload the first page
        // from the API so our initial list matches the category selection.
        if (isKnownCategory(category)) {
            (async () => {
                setIsLoading(true);

                const params = new URLSearchParams();
                params.set("sort", "-start");
                params.set("where[start][less_than]", new Date().toISOString());
                params.set("limit", String(limit));
                params.set("page", String(1));
                params.set("where[eventType][equals]", category as string);

                const baseUrl = import.meta.env.DEV ? "/api/events" : `${CMS_URL}/api/events`;
                const res = await fetch(`${baseUrl}?${params.toString()}`);
                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }

                const data = (await res.json()) as {
                    docs: EventType[];
                    hasNextPage: boolean;
                };

                setEvents(data.docs);
                setPage(1);
                setHasNextPage(Boolean(data.hasNextPage));
                setIsLoading(false);
            })();
        }
    }, [limit]);

    // Listen for category changes emitted by the selector (to keep client-side filtering in sync)
    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setSelectedCategory(detail);

            if (isKnownCategory(detail)) {
                (async () => {
                    setIsLoading(true);

                    const params = new URLSearchParams();
                    params.set("sort", "-start");
                    params.set("where[start][less_than]", new Date().toISOString());
                    params.set("limit", String(limit));
                    params.set("page", String(1));
                    params.set("where[eventType][equals]", detail as string);

                    const baseUrl = import.meta.env.DEV ? "/api/events" : `${CMS_URL}/api/events`;
                    const res = await fetch(`${baseUrl}?${params.toString()}`);
                    if (!res.ok) {
                        setIsLoading(false);
                        return;
                    }

                    const data = (await res.json()) as {
                        docs: EventType[];
                        hasNextPage: boolean;
                    };

                    setEvents(data.docs);
                    setPage(1);
                    setHasNextPage(Boolean(data.hasNextPage));
                    setIsLoading(false);
                })();
            } else {
                // Reset to the initial list when selecting "all" or "other".
                setEvents(initialEvents);
                setPage(initialPage);
                setHasNextPage(initialHasNextPage);
            }
        };

        window.addEventListener("pastEvents:categoryChange", handler as EventListener);
        return () => window.removeEventListener("pastEvents:categoryChange", handler as EventListener);
    }, [initialEvents, initialHasNextPage, initialPage, limit]);

    const isOtherCategory = selectedCategory === "other";
    const isKnown = isKnownCategory(selectedCategory);
    const categoryFilter = selectedCategory && (isKnown || isOtherCategory) ? selectedCategory : null;

    const filteredEvents = useMemo(() => {
        if (!categoryFilter) return events;

        if (isOtherCategory) {
            const knownLower = new Set(EVENT_CATEGORIES.map((c) => c.toLowerCase()));
            return events.filter((e) => !knownLower.has(e.eventType?.toLowerCase?.() ?? ""));
        }

        return events.filter((e) => e.eventType?.toLowerCase?.() === categoryFilter);
    }, [events, categoryFilter, isOtherCategory]);

    const loadMore = async () => {
        if (!hasNextPage || isLoading) return;

        setIsLoading(true);
        let nextPage = page + 1;
        const baseUrl = import.meta.env.DEV ? "/api/events" : `${CMS_URL}/api/events`;

        const accumulatedEvents: EventType[] = [];
        let finalHasNextPage: boolean = hasNextPage;

        const shouldFetchTightly = isOtherCategory;
        const knownLower = new Set(EVENT_CATEGORIES.map((c) => c.toLowerCase()));

        const shouldCountAsOther = (event: EventType) => {
            const cat = event.eventType?.toLowerCase?.() ?? "";
            return cat !== "" && !knownLower.has(cat);
        };

        let foundOther = false;

        while (true) {
            const params = new URLSearchParams();
            params.set("sort", "-start");
            params.set("where[start][less_than]", new Date().toISOString());
            params.set("limit", String(limit));
            params.set("page", String(nextPage));

            if (isKnown) {
                params.set("where[eventType][equals]", categoryFilter as string);
            }

            const res = await fetch(`${baseUrl}?${params.toString()}`);
            if (!res.ok) {
                finalHasNextPage = false;
                break;
            }

            const data = (await res.json()) as {
                docs: EventType[];
                hasNextPage: boolean;
            };

            accumulatedEvents.push(...data.docs);

            if (shouldFetchTightly) {
                if (data.docs.some(shouldCountAsOther)) {
                    foundOther = true;
                }
            }

            finalHasNextPage = Boolean(data.hasNextPage);

            nextPage += 1;

            // If we're not doing the tight "other" loop, just fetch a single page.
            if (!shouldFetchTightly) break;

            // For "other", keep fetching until we find at least one other event or we run out of pages.
            if (foundOther || !finalHasNextPage) break;
        }

        setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newEvents = accumulatedEvents.filter((e) => !existingIds.has(e.id));
            return [...prev, ...newEvents];
        });

        setPage(nextPage - 1);
        setHasNextPage(finalHasNextPage);
        setIsLoading(false);
    };

    // Group events by semester, filter out those with no events
    const semestersWithEvents = useMemo(() => {
        return allSemesters
            .map((semester) => ({
                semester,
                events: getEventsInSemester(filteredEvents, semester),
            }))
            .filter((item) => item.events.length > 0);
    }, [allSemesters, filteredEvents]);

    return (
        <>
        {semestersWithEvents.map(({ semester, events }, idx) => {
            return (
                <section
                    key={`${semester.season}-${semester.year}`}
                    className="[--line-card-gap:25px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] flex flex-col gap-4"
                    style={{ paddingLeft: "calc((var(--sem-icon-size) / 2))" }}
                    id={`sem-sec-${idx}`}
                    data-sem-key={`${semester.season}-${semester.year}`}
                >
                    <div className="z-50 sticky top-24 w-fit">
                        <div
                            className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark"
                            style={{ gap: "calc(var(--line-card-gap) - var(--sem-icon-size))" }}
                        >
                            <div
                                data-sentinel={`#sem-sec-${idx}`}
                                data-past-sentinel="false"
                                className="relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) bg-gray-300 dark:bg-zinc-600 data-[past-sentinel=true]:bg-yellow flex items-center justify-center"
                                style={{ left: "calc(-1 * var(--sem-icon-size) / 2)" }}
                            >
                                <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900" />
                            </div>
                            <h3 className="text-base sm:text-base font-normal leading-none p-0 m-0 uppercase font-pixel">
                            {semester.season} {semester.year}
                            </h3>
                        </div>
                    </div>

                    <div className="pl-(--line-card-gap) border-l-1 border-gray-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:auto-cols-fr text-center">
                            {events.map((event) => {
                                const { localizedStart, localizedStartTime, localizedEndTime } =
                                    getLocalizedEventTimes(event);

                                return (
                                    <Card key={event.id}
                                        date={format(localizedStart, "MMM d")}
                                        time={`${localizedStartTime}${localizedEndTime ? ` - ${localizedEndTime}` : ""}`}     
                                        location={event.location_name}
                                        name={event.name}
                                        link={`/events/${event.id}`}
                                        category={event.eventType}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            );
        })}

        <button
            className="cursor-pointer w-fit m-auto mt-4 font-pixel text-sm font-bold text-purple-700 dark:text-amber-400"
            onClick={loadMore}
            disabled={!hasNextPage || isLoading}
        >
            {isLoading ? "Loading..." : hasNextPage ? "Load more ..." : ""}
        </button>
        </>
    );
}
