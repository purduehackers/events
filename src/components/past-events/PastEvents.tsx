import { useEffect, useMemo, useState } from "react";

import { EVENT_CATEGORIES, type EventType, type SemesterType } from "@/types";
import SemesterEvents from "../SemesterEvents";
import SkeletonSemesterEvents from "../SkeletonLoader";
import { getSemesterFromDate, getEventsInSemester, getSemestersNewestFirst, getSemesterDateRange, isKnownCategory } from "@/utilities/helpers";

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
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<SemesterType | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Helper for building fetch params
    const buildFetchParams = (pageNum: number, category: string | null, query: string | null) => {
        const params = new URLSearchParams();
        params.set("sort", "-start");
        params.set("where[published][equals]", "true");
        params.set("limit", String(limit));
        params.set("page", String(pageNum));

        // Add semester date range filtering if semester is selected
        if (selectedSemester) {
            const { start, end } = getSemesterDateRange(selectedSemester);
            const now = new Date();

            if (isFinite(start.getTime())) {
                params.set("where[start][greater_than]", start.toISOString());
            }

            // Use the smaller of now and end if end is valid; otherwise use now
            if (isFinite(end.getTime())) {
                const upper = Math.min(now.getTime(), end.getTime());
                params.set("where[start][less_than]", new Date(upper).toISOString());
            } else {
                params.set("where[start][less_than]", now.toISOString());
            }
        } else {
            // Default: only show past events
            params.set("where[start][less_than]", new Date().toISOString());
        }

        // Add filter/search query params
        if (isKnownCategory(category)) {
            params.set("where[eventType][equals]", category as string);
        }
        if (query && query.length > 0) {
            params.set("where[name][like]", query);
        }
        return params;
    };

    // Get initial url query params
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setSelectedCategory(params.get("cat") ?? "");
        setSearchQuery(params.get("query") ?? "");

        // Parse semester from string (e.g. sem=fall-2024)
        const semSlug = params.get("sem");
        if (semSlug) {
            const parts = semSlug.split("-");
            if (parts.length === 2) {
                const seasonRaw = parts[0]?.toLowerCase();
                const yearNum = Number(parts[1]);
                const validSeasons = ["spring", "summer", "fall"];
                
                if (seasonRaw && validSeasons.includes(seasonRaw) && Number.isInteger(yearNum) && !Number.isNaN(yearNum)) {
                    setSelectedSemester({
                        year: yearNum,
                        season: seasonRaw as SemesterType["season"]
                    });
                }
            }
        }
    }, []);

    // Listen for and apply filtering/searching updates
    useEffect(() => {
        const handleSemesterChange = (event: Event) => {
            const detail = (event as CustomEvent<any>).detail;
            // Support both string slug and SemesterType object
            if (typeof detail === "string") {
                const parts = detail.split("-");
                if (parts.length === 2) {
                    const seasonRaw = parts[0]?.toLowerCase();
                    const yearNum = Number(parts[1]);
                    const validSeasons = ["spring", "summer", "fall"];

                    if (seasonRaw && validSeasons.includes(seasonRaw) && Number.isInteger(yearNum) && !Number.isNaN(yearNum)) {
                        setSelectedSemester({ year: yearNum, season: seasonRaw as SemesterType["season"] });
                        return;
                    }
                }
                // Invalid string, clear selection
                setSelectedSemester(null);
                return;
            }

            setSelectedSemester(detail ?? null);
        };

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
            // Update semester selection from URL as well
            const semSlug = params.get("sem");
            if (semSlug) {
                const parts = semSlug.split("-");
                if (parts.length === 2) {
                    const seasonRaw = parts[0]?.toLowerCase();
                    const yearNum = Number(parts[1]);
                    const validSeasons = ["spring", "summer", "fall"];

                    if (seasonRaw && validSeasons.includes(seasonRaw) && Number.isInteger(yearNum) && !Number.isNaN(yearNum)) {
                        setSelectedSemester({ year: yearNum, season: seasonRaw as SemesterType["season"] });
                        return;
                    }
                }
            }
            setSelectedSemester(null);
        };

        window.addEventListener("semesterChange", handleSemesterChange as EventListener);
        window.addEventListener("categoryChange", handleCategoryChange as EventListener);
        window.addEventListener("searchQueryChange", handleSearchQueryChange as EventListener);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("semesterChange", handleSemesterChange as EventListener);
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
            const res = await fetch(`${apiUrl}?${params.toString()}`);
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
    }, [selectedCategory, searchQuery, selectedSemester]);

    const allSemesters = getSemestersNewestFirst();
    const currentSemester = getSemesterFromDate(new Date());
    const isOtherCategory = selectedCategory === "other";

    const loadMore = async () => {
        if (!hasNextPage || isLoadingMore) return;

        setIsLoadingMore(true);
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
            const params = buildFetchParams(nextPage, selectedCategory || null, searchQuery);
            const url = `${apiUrl}?${params.toString()}`;
            const res = await fetch(url);
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
        setIsLoadingMore(false);
    };

    // Group events by semester, filter out those with no events
    const semestersWithEvents = useMemo(() => {
        if (selectedSemester) {
            return [{
                semester: selectedSemester,
                events: getEventsInSemester(events, selectedSemester)
            }];
        }

        return allSemesters
            .map((semester) => ({
                semester,
                events: getEventsInSemester(events, semester),
            }))
            .filter((item) => item.events.length > 0);
    }, [allSemesters, events, selectedSemester]);

    return (
        <div
            id="past-events"
            className="w-full flex flex-col mb-14 text-left gap-y-4 mx-auto"
        >
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-3xl sm:text-3xl font-mono font-black m-0">Past events</h2>
            </div>

            {isLoading ?
                <SkeletonSemesterEvents numEvents={8} semester={selectedSemester || currentSemester} />
            :
                <div className="w-full flex flex-col items-center">
                    {semestersWithEvents.length > 0 ? 
                        semestersWithEvents.map(({ semester, events }, idx) => {
                            return (
                                <SemesterEvents key={idx} events={events} semester={semester} idx={idx} />
                            );
                        })
                    :
                        <div className="w-full text-base font-pixel text-gray-500">
                            No past events found.
                        </div>
                    }

                    <button
                        className="cursor-pointer w-fit m-auto my-4 sm:my-6 font-pixel text-base font-bold text-purple-700 dark:text-yellow"
                        onClick={loadMore}
                        disabled={!hasNextPage || isLoadingMore}
                    >
                        {isLoadingMore ? "Loading..." : hasNextPage ? "Load more ..." : ""}
                    </button>
                </div>
            }
        </div>
    );
}
