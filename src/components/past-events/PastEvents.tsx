import { useEffect, useMemo, useState } from "react";

import { EVENT_CATEGORIES, type EventType } from "@/types";
import SemesterEvents from "../SemesterEvents";
import SkeletonSemesterEvents from "../SkeletonLoader";
import { getEventsInSemester, getSemestersNewestFirst, isKnownCategory } from "@/utilities/helpers";

interface PastEventsProps {
  limit: number;
  apiUrl: string;
}

const INITIAL_PAGE = 1;

export default function PastEvents({
  limit,
  apiUrl
}: PastEventsProps) {
    const [events, setEvents] = useState<EventType[]>([]);
    const [page, setPage] = useState(INITIAL_PAGE);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

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

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setSelectedCategory(params.get("cat") ?? "");
        setSearchQuery(params.get("query") ?? "");
    }, []);

    // Listen for and apply filtering/searching updates
    useEffect(() => {
        const handleCategoryChange = (event: Event) => {
            setSelectedCategory((event as CustomEvent<string | null>).detail ?? "");
        };

        const handleSearchQueryChange = (event: Event) => {
            setSearchQuery((event as CustomEvent<string>).detail ?? "");
        };

        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSelectedCategory(params.get("cat") ?? "");
            setSearchQuery(params.get("query") ?? "");
        };

        window.addEventListener("categoryChange", handleCategoryChange as EventListener);
        window.addEventListener("searchQueryChange", handleSearchQueryChange as EventListener);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("categoryChange", handleCategoryChange as EventListener);
            window.removeEventListener("searchQueryChange", handleSearchQueryChange as EventListener);
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // Fetch events data
    useEffect(() => {
        const fetchEvents = async (pageNum: number, category: string | null, query: string | null) => {
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
        }

        fetchEvents(INITIAL_PAGE, selectedCategory || null, searchQuery || null);
    }, [selectedCategory, searchQuery]);

    const allSemesters = getSemestersNewestFirst();
    const isOtherCategory = selectedCategory === "other";

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
                events: getEventsInSemester(events, semester),
            }))
            .filter((item) => item.events.length > 0);
    }, [allSemesters, events]);

    return (
        <>
        {isLoading &&
            <SkeletonSemesterEvents numEvents={5} semester={{season: "fall", year: 2026}} />
        }
        {semestersWithEvents.length > 0 ? 
            semestersWithEvents.map(({ semester, events }, idx) => {
                return (
                    <section key={`${semester.season}-${semester.year}`}>
                        {!isLoading &&
                            <SemesterEvents events={events} semester={semester} idx={idx} />
                        }
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
