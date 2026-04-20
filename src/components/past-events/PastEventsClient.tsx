import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType, type SemesterType } from "@/types";
import Card from "@/components/Card";
import { getEventsInSemester, getLocalizedEventTimes } from "@/utilities/helpers";

interface PastEventsClientProps {
  initialEvents: EventType[];
  initialSemesters: SemesterType[];
  initialPage: number;
  limit: number;
  initialHasNextPage: boolean;
  apiUrl: string;
}

// Get search query param from url
function getQueryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("query")?.trim().toLowerCase();
  return raw || null;
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
  apiUrl
}: PastEventsClientProps) {
    const [events, setEvents] = useState<EventType[]>(initialEvents);
    const [page, setPage] = useState(initialPage);
    const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);

    const baseUrl = apiUrl; // astro api route "/api/events"
    console.log(apiUrl)

    // Helper for building fetch params
    const buildFetchParams = (pageNum: number, category: string | null, query: string | null) => {
        const params = new URLSearchParams();
        params.set("sort", "-start");
        params.set("where[start][less_than]", new Date().toISOString());
        params.set("where[published][equals]", "true");
        params.set("limit", String(limit));
        params.set("page", String(pageNum));

        // Add filter/search query params
        if (isKnownCategory(category)) {
            params.set("where[eventType][equals]", category as string);
        }
        if (query && query.length > 0) {
            params.set("where[name][like]", query);
        }
        return params;
    };

    // Use semesters computed at build time so server render matches hydration
    const allSemesters = useMemo(() => initialSemesters, [initialSemesters]);

    // Apply category filter and search query
    useEffect(() => {
        const category = getCategoryFromUrl();
        setSelectedCategory(category);
        const query = getQueryFromUrl();
        setSearchQuery(query);

        // If category or query selected on load, reload the first page
        if (isKnownCategory(category) || (query && query.length > 0)) {
            (async () => {
                setIsLoading(true);
                const params = buildFetchParams(1, category, query);
                const res = await fetch(`${baseUrl}?${params.toString()}`);
                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }

                const data = (await res.json()) as {
                    docs: EventType[];
                    hasNextPage: boolean;
                };

                setEvents(data.docs.filter((e) => e.published));
                setPage(1);
                setHasNextPage(Boolean(data.hasNextPage));
                setIsLoading(false);
            })();
        }
    }, [limit]);

    // Listen for category changes emitted by the selector (to keep client-side filtering in sync)
    useEffect(() => {
        const catHandler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setSelectedCategory(detail);

            if (isKnownCategory(detail) || (detail === "other" && searchQuery && searchQuery.length > 0)) {
                (async () => {
                    setIsLoading(true);

                    const params = buildFetchParams(1, detail, searchQuery);

                    const res = await fetch(`${baseUrl}?${params.toString()}`);
                    if (!res.ok) {
                        setIsLoading(false);
                        return;
                    }

                    const data = (await res.json()) as {
                        docs: EventType[];
                        hasNextPage: boolean;
                    };

                    setEvents(data.docs.filter((e) => e.published));
                    setPage(1);
                    setHasNextPage(Boolean(data.hasNextPage));
                    setIsLoading(false);
                })();
            } else {
                // Reset to the initial list when selecting "all" or "other" without a search query
                setEvents(initialEvents);
                setPage(initialPage);
                setHasNextPage(initialHasNextPage);
            }
        };

        const searchHandler = (event: Event) => {
            const query = (event as CustomEvent<string | null>).detail;
            setSearchQuery(query);

            if (query && query.length > 0) {
                (async () => {
                    setIsLoading(true);

                    const params = buildFetchParams(1, selectedCategory, query);

                    const res = await fetch(`${baseUrl}?${params.toString()}`);
                    if (!res.ok) {
                        setIsLoading(false);
                        return;
                    }

                    const data = (await res.json()) as {
                        docs: EventType[];
                        hasNextPage: boolean;
                    };

                    setEvents(data.docs.filter((e) => e.published));
                    setPage(1);
                    setHasNextPage(Boolean(data.hasNextPage));
                    setIsLoading(false);
                })();
            } else {
                // Reset to the initial list when clearing search
                setEvents(initialEvents);
                setPage(initialPage);
                setHasNextPage(initialHasNextPage);
            }
        };

        window.addEventListener("categoryChange", catHandler as EventListener);
        window.addEventListener("searchQueryChange", searchHandler as EventListener);
        return () => {
            window.removeEventListener("categoryChange", catHandler as EventListener);
            window.removeEventListener("searchQueryChange", searchHandler as EventListener);
        }
    }, [initialEvents, initialHasNextPage, initialPage, limit, selectedCategory, searchQuery]);

    const isOtherCategory = selectedCategory === "other";
    const isKnown = isKnownCategory(selectedCategory);
    const categoryFilter = selectedCategory && (isKnown || isOtherCategory) ? selectedCategory : null;

    const filteredEvents = useMemo(() => {
        if (!selectedCategory && !searchQuery) return events;

        let filtered = events;

        // Apply category filters
        if (isOtherCategory) {
            const knownLower = new Set(EVENT_CATEGORIES.map((c) => c.toLowerCase()));
            filtered = events.filter((e) => !knownLower.has(e.eventType?.toLowerCase?.() ?? ""));
        } else if (isKnown) {
            filtered = events.filter((e) => e.eventType?.toLowerCase?.() === selectedCategory);
        }

        // Apply search query
        if (searchQuery && searchQuery.length > 0) {
            filtered = filtered.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return filtered;
    }, [events, categoryFilter, isOtherCategory, searchQuery]);

    const loadMore = async () => {
        if (!hasNextPage || isLoading) return;

        setIsLoading(true);
        let nextPage = page + 1;

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
            if (searchQuery && searchQuery.length > 0) {
                params.set("where[name][like]", searchQuery);
            }

            const url = `${baseUrl}?${params.toString()}`;
            console.log(url)
            const res = await fetch(url);
            console.log(res)
            if (!res.ok) {
                finalHasNextPage = false;
                break;
            }

            const data = (await res.json()) as {
                docs: EventType[];
                hasNextPage: boolean;
            };
            console.log(data)

            const pageResults = shouldFetchTightly ? data.docs.filter(shouldCountAsOther) : data.docs;
            accumulatedEvents.push(...pageResults);

            if (shouldFetchTightly) {
                if (pageResults.length > 0) {
                    foundOther = true;
                }
            }

            finalHasNextPage = Boolean(data.hasNextPage);

            nextPage += 1;

            // If not doing the tight "other" loop, just fetch a single page
            if (!shouldFetchTightly) break;

            // For "other", keep fetching until at least one other event found or run out of pages
            if (foundOther || !finalHasNextPage) break;
        }

        setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newEvents = accumulatedEvents.filter((e) => e.published && !existingIds.has(e.id));
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
        {semestersWithEvents.length > 0 ? 
            semestersWithEvents.map(({ semester, events }, idx) => {
                return (
                    <section
                        key={`${semester.season}-${semester.year}`}
                        className="[--line-card-gap:25px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] flex flex-col gap-4"
                        style={{ paddingLeft: "calc((var(--sem-icon-size) / 2))" }}
                        id={`sem-sec-${idx}`}
                        data-sem-key={`${semester.season}-${semester.year}`}
                    >
                        <div className="z-50 sticky top-34 sm:top-24 w-fit">
                            <div
                                className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark"
                                style={{ gap: "calc(var(--line-card-gap) - var(--sem-icon-size))" }}
                            >
                                <div
                                    data-sentinel={`#sem-sec-${idx}`}
                                    data-past-sentinel="false"
                                    className="relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) bg-gray-300 dark:bg-zinc-600 data-[past-sentinel=true]:bg-yellow-400 flex items-center justify-center"
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
            })
        : !isLoading &&
            <div className="w-full text-base font-pixel text-gray-500">
                No past events found.
            </div>
        }

        <button
            className="cursor-pointer w-fit m-auto my-4 sm:my-6 font-pixel text-base font-bold text-purple-700 dark:text-amber-400"
            onClick={loadMore}
            disabled={!hasNextPage || isLoading}
        >
            {isLoading ? "Loading..." : hasNextPage ? "Load more ..." : ""}
        </button>
        </>
    );
}
