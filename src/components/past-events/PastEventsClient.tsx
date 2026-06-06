import { useCallback, useEffect, useMemo, useState } from "react";

import { EVENT_CATEGORIES, type EventType } from "@/types";
import SemesterEvents from "../SemesterEvents";
import { getEventsInSemester, getSemestersNewestFirst } from "@/utilities/helpers";

interface PastEventsClientProps {
  limit: number;
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

const INITIAL_PAGE = 1;

export default function PastEventsClient({
  limit,
  apiUrl
}: PastEventsClientProps) {
    const [events, setEvents] = useState<EventType[]>([]);
    const [page, setPage] = useState(INITIAL_PAGE);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);

    const baseUrl = apiUrl;

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

    const allSemesters = getSemestersNewestFirst();

    const fetchEvents = useCallback(async (pageNum: number, category: string | null, query: string | null) => {
        setIsLoading(true);
        const params = buildFetchParams(pageNum, category, query);
        const res = await fetch(`${baseUrl}?${params.toString()}`);

        if (!res.ok) {
            setIsLoading(false);
            return null;
        }

        const data = (await res.json()) as {
            docs: EventType[];
            hasNextPage: boolean;
        };

        const docs = data.docs.filter((e) => e.published);
        setEvents(docs);
        setPage(pageNum);
        setHasNextPage(Boolean(data.hasNextPage));
        setIsLoading(false);

        return data;
    }, [baseUrl, limit]);

    // Load the first page on client mount with any URL filters
    useEffect(() => {
        const category = getCategoryFromUrl();
        const query = getQueryFromUrl();
        setSelectedCategory(category);
        setSearchQuery(query);
        fetchEvents(INITIAL_PAGE, category, query);
    }, [fetchEvents]);

    // Listen for category/search events and reload the list
    useEffect(() => {
        const catHandler = async (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setSelectedCategory(detail);

            if (isKnownCategory(detail) || (detail === "other" && searchQuery && searchQuery.length > 0)) {
                await fetchEvents(INITIAL_PAGE, detail, searchQuery);
            } else {
                await fetchEvents(INITIAL_PAGE, null, null);
            }
        };

        const searchHandler = async (event: Event) => {
            const query = (event as CustomEvent<string | null>).detail;
            setSearchQuery(query);

            if (query && query.length > 0) {
                await fetchEvents(INITIAL_PAGE, selectedCategory, query);
            } else {
                await fetchEvents(INITIAL_PAGE, null, null);
            }
        };

        window.addEventListener("categoryChange", catHandler as EventListener);
        window.addEventListener("searchQueryChange", searchHandler as EventListener);
        return () => {
            window.removeEventListener("categoryChange", catHandler as EventListener);
            window.removeEventListener("searchQueryChange", searchHandler as EventListener);
        };
    }, [fetchEvents, searchQuery, selectedCategory]);

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
            const params = buildFetchParams(nextPage, selectedCategory, searchQuery);
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
                        <SemesterEvents events={events} semester={semester} idx={idx} />
                    </section>
                );
            })
        : !isLoading &&
            <div className="w-full text-base font-pixel text-gray-500">
                No past events found.
            </div>
        }

        <button
            className="cursor-pointer w-fit m-auto my-4 sm:my-6 font-pixel text-base font-bold text-purple-700 dark:text-yellow"
            onClick={loadMore}
            disabled={!hasNextPage || isLoading}
        >
            {isLoading ? "Loading..." : hasNextPage ? "Load more ..." : ""}
        </button>
        </>
    );
}
