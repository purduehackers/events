import { useState, useEffect, useMemo } from "react";
import type { EventType, SemesterType } from "@/types";
import SemesterEvents from "@/components/SemesterEvents";
import { getSemestersNewestFirst, getEventsInSemester, getSemesterFromDate, isKnownCategory, getSemesterDateRange } from "@/utilities/helpers";
import SkeletonSemesterEvents from "./SkeletonLoader";

interface CurrentEventsProps {
    apiUrl: string
}

const INITIAL_PAGE = 1;

export default function CurrentEvents({ apiUrl }: CurrentEventsProps) {
    const [events, setEvents] = useState<EventType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<SemesterType | null>(null);

    // Helper for building fetch params
    const buildFetchParams = (pageNum: number, category: string | null, query: string | null) => {
        const params = new URLSearchParams();
        params.set("sort", "start");
        const now = new Date();

        // If current semester selected, filter for it
        if (selectedSemester) {
            const currentSemester = getSemesterFromDate(new Date());
            const isCurrent = selectedSemester.season === currentSemester.season && selectedSemester.year === currentSemester.year;

            if (isCurrent) {
                // Future events starting after now
                params.set("where[start][greater_than]", now.toISOString());
                // Cap to the semester end if known
                const { end } = getSemesterDateRange(selectedSemester);
                if (isFinite(end.getTime())) {
                    params.set("where[start][less_than]", new Date(Math.max(now.getTime(), Math.min(end.getTime(), end.getTime()))).toISOString());
                }
            } else {
                // Selected semester is not the current semester: force no results by setting a far-future lower bound
                params.set("where[start][greater_than]", new Date(3000, 0, 1).toISOString());
            }
        } else {
            // Default to all future events.
            params.set("where[start][greater_than]", now.toISOString());
        }

        params.set("where[published][equals]", "true");
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
        const handleCategoryChange = (event: Event) => {
            setSelectedCategory((event as CustomEvent<string | null>).detail ?? "");
        };

        const handleSearchQueryChange = (event: Event) => {
            setSearchQuery((event as CustomEvent<string>).detail ?? "");
        };

        const handleSemesterChange = (event: Event) => {
            const detail = (event as CustomEvent<any>).detail;
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
                setSelectedSemester(null);
                return;
            }

            setSelectedSemester(detail ?? null);
        };

        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSelectedCategory(params.get("cat") ?? "");
            setSearchQuery(params.get("query") ?? "");
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

        window.addEventListener("categoryChange", handleCategoryChange as EventListener);
        window.addEventListener("searchQueryChange", handleSearchQueryChange as EventListener);
        window.addEventListener("semesterChange", handleSemesterChange as EventListener);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("categoryChange", handleCategoryChange as EventListener);
            window.removeEventListener("searchQueryChange", handleSearchQueryChange as EventListener);
            window.removeEventListener("semesterChange", handleSemesterChange as EventListener);
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // Fetch events data
    useEffect(() => {
        const fetchEvents = async (pageNum: number, category: string | null, query: string | null) => {
            setIsLoading(true);

            // If a semester is selected but it's not the current semester, return nothing
            if (selectedSemester) {
                const isCurrent = selectedSemester.season === currentSemester.season && selectedSemester.year === currentSemester.year;
                if (!isCurrent) {
                    setEvents([]);
                    setIsLoading(false);
                    return null;
                }
            }

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
            setIsLoading(false);

            return data;
        }

        fetchEvents(INITIAL_PAGE, selectedCategory || null, searchQuery || null);
    }, [selectedCategory, searchQuery, selectedSemester]);

    const latestDate = new Date();
    latestDate.setFullYear(latestDate.getFullYear() + 1);
    const allSemesters = getSemestersNewestFirst(getSemesterFromDate(latestDate));
    const currentSemester = getSemesterFromDate(new Date());

    // Group events by semester, filter out those with no events
    const semestersWithEvents = useMemo(() => {
        return allSemesters
            .map((semester) => ({
                semester,
                events: getEventsInSemester(events, semester),
            }))
            .filter((item) => (item.events.length > 0 || (item.semester.season === currentSemester.season && item.semester.year === currentSemester.year)));
    }, [allSemesters, events]);

    // If non-current semester selected render nothing 
    if (selectedSemester && !(selectedSemester.season === currentSemester.season && selectedSemester.year === currentSemester.year)) {
        return null;
    }

    if (isLoading) return <SkeletonSemesterEvents numEvents={3} semester={currentSemester} />;

    return (
        <div
            className="w-full flex flex-col text-left gap-y-4 mx-auto"
        >
            <h2 className="sm:mb-4 text-3xl sm:text-3xl font-mono font-black m-0">Upcoming</h2>
            {(semestersWithEvents.length > 0) ? 
                semestersWithEvents.map(({ semester, events }, idx) => {
                    const isCurrentSemester = semester.season === currentSemester.season && semester.year === currentSemester.year;
                    return (
                        <section key={`${semester.season}-${semester.year}`}>
                            <SemesterEvents events={events} semester={semester} currentSemester={isCurrentSemester} idx={idx} />
                        </section>
                    );
                })
            :   
                <div className="w-full text-base font-pixel text-gray-500">
                    No upcoming events found.
                </div>
            }
        </div>
    );
}