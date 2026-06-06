import { useState, useEffect } from "react";
import type { EventType } from "@/types";
import SemesterEvents from "@/components/SemesterEvents";
import { getSemesterFromDate, isKnownCategory } from "@/utilities/helpers";
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

    const currentSemester = getSemesterFromDate(new Date());

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

    return (
        <div
            className="lg:container mb-0 pt-6 sm:pt-14 px-4 sm:px-12 md:px-18 xl:px-28 text-left lg:max-w-screen-2xl mx-auto"
        >
            <h2 className="sm:mb-4 text-3xl sm:text-3xl font-mono font-black m-0">Upcoming</h2>
            {isLoading ?
                <SkeletonSemesterEvents numEvents={5} semester={currentSemester} />
            :
                <SemesterEvents events={events} semester={currentSemester} currentSemester={true} idx={0} />
            }
        </div>
    );
}