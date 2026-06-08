import { useState, useEffect, useMemo } from "react";
import type { EventType } from "@/types";
import SemesterEvents from "@/components/SemesterEvents";
import { getSemestersNewestFirst, getEventsInSemester, getSemesterFromDate, isKnownCategory } from "@/utilities/helpers";
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

    // Helper for building fetch params
    const buildFetchParams = (pageNum: number, category: string | null, query: string | null) => {
        const params = new URLSearchParams();
        params.set("sort", "start");
        params.set("where[start][greater_than]", new Date().toISOString());
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
    }, [selectedCategory, searchQuery]);

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
    console.log(semestersWithEvents)

    if (isLoading) return <SkeletonSemesterEvents numEvents={3} semester={currentSemester} />;

    return (
        (semestersWithEvents.length > 0) ? 
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
    );
}