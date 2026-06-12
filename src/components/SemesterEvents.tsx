import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType } from "@/types";
import Card, { ListCard } from "@/components/Card";
import { getLocalizedEventTimes } from "@/utilities/helpers";
import type { SemesterType } from "@/types";

interface SemesterEventsProps {
    events: EventType[];
    semester: SemesterType;
    currentSemester?: boolean; // whether this is the upcoming events display
    idx: number;
}

type ViewMode = "list" | "grid";

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

function getViewModeFromUrl(): ViewMode {
    if (typeof window === "undefined") return "list";
    const raw = new URLSearchParams(window.location.search).get("viewMode")?.trim().toLowerCase();
    return raw === "grid" ? "grid" : "list";
}

function isKnownCategory(category: string | null) {
    return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}

export default function SemesterEvents({ events, semester, currentSemester = false, idx }: SemesterEventsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const sectionTopInView = useInView(sectionRef, {
        amount: 0,
        margin: "-34px 0px 0px 0px",
    });
    //const dotBackground = sectionTopInView ? "#facc15" : "#9ca3af";
    const dotBackground = sectionTopInView ? "#919191" : "#9ca3af";

    useEffect(() => {
        const category = getCategoryFromUrl();
        setSelectedCategory(category);
        const query = getQueryFromUrl();
        setSearchQuery(query);
        setViewMode(getViewModeFromUrl());
    }, []);

    // Listen for and apply filtering/searching updates
    useEffect(() => {
        const catHandler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setSelectedCategory(detail);
        };
        const searchHandler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setSearchQuery(detail);
        };
        const viewModeHandler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setViewMode(detail === "grid" ? "grid" : "list");
        };

        window.addEventListener("categoryChange", catHandler as EventListener);
        window.addEventListener("searchQueryChange", searchHandler as EventListener);
        window.addEventListener("viewModeChange", viewModeHandler as EventListener);
        return () => {
            window.removeEventListener("categoryChange", catHandler as EventListener);
            window.removeEventListener("searchQueryChange", searchHandler as EventListener);
            window.removeEventListener("viewModeChange", viewModeHandler as EventListener);
        };
    }, []);

    const isOther = selectedCategory === "other";
    const isKnown = isKnownCategory(selectedCategory);

    const filteredEvents = useMemo(() => {
        if (!selectedCategory && !searchQuery) return events;

        let filtered = events;

        // Appy cat filters
        if (isOther) {
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
    }, [events, isKnown, isOther, selectedCategory, searchQuery]);

    const cardLayoutClassName = viewMode === "grid"
        ? "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 sm:auto-cols-fr"
        : "flex flex-col gap-2";

    return (
        <div 
            ref={sectionRef}
            data-category-section={currentSemester ? "current-events" : `${semester.season}-${semester.year}`}
            className="[--line-card-gap:25px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] px-2 flex flex-col gap-y-4"
            id={currentSemester ? "current-events-sec" : `sem-sec-${idx}`}
            data-sem-key={currentSemester ? "current-events" : `${semester.season}-${semester.year}`}
        >
            {/* Semester label */}
            <div className="z-50 sticky top-34 sm:top-24 w-fit">
                <div className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark border-solid border-[0px] border-white dark:border-zinc-700"
                    style={{
                        gap: "calc(var(--line-card-gap) - var(--sem-icon-size))",
                        left: "calc(-1 * var(--sem-icon-size))",
                    }}
                >
                    <motion.div
                        className="relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) flex items-center justify-center"
                        style={{
                            backgroundColor: dotBackground,
                        }}
                    >
                        <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900"></div>
                    </motion.div>
                    <h3 className="text-base sm:text-base font-normal leading-none p-0 m-0 uppercase font-pixel">
                        {semester.season} {semester.year}
                    </h3>
                </div>
            </div>

            {/* Event cards */}
            <div className="pl-(--line-card-gap) border-l-1 border-gray-300">
                {(filteredEvents?.length > 0 || (currentSemester && !searchQuery && (!selectedCategory || selectedCategory === "hack-night"))) ?
                    <div className={cardLayoutClassName}>
                        {(currentSemester && !searchQuery && (!selectedCategory || selectedCategory === "hack-night")) &&
                            <a className={`w-full ${viewMode === "list" ? "h-auto" : "h-full"}`} href="https://discord.com/invite/5paFjKzdPE" target="_blank" rel="noreferrer">
                                <div className="w-full h-full bg-black dark:bg-yellow text-white dark:text-black px-6 2xl:px-8 py-5 flex flex-col justify-between gap-y-3">
                                    <p className="w-fit font-pixel text-yellow dark:text-black uppercase text-sm">--weekly--</p>
                                    <h2 className="font-mono text-white dark:text-black text-left text-lg 2xl:text-xl font-black">
                                        Come to Hack Night!!
                                    </h2>  
                                    <p className="font-subtext text-sm"><span className="font-semibold">Every Friday 8pm</span> at the <span className="font-semibold">Bechtel Center</span>. Come check it out!</p>
                                    <button className="hidden cursor-pointer w-fit px-2 uppercase text-sm font-pixel font-normal text-white bg-black rounded-sm">
                                        Check it out {'>>'}
                                    </button>
                                </div>
                            </a>
                        }
                        {filteredEvents?.map((event) => {
                            const { localizedStart, localizedStartTime, localizedEndTime } = getLocalizedEventTimes(event);
                            const image = event.images?.[0]?.image?.thumbnailURL ?? event.images?.[0]?.image?.url ?? undefined;

                            return viewMode === "grid" ? (
                                <Card key={event.id} 
                                    date={format(localizedStart, "MMM d")}
                                    time={`${localizedStartTime}`}     
                                    location={event.location_name}
                                    name={event.name}
                                    link={`/events/${event.eventType}/${event.slug}`}
                                    category={event.eventType}
                                />
                            ) : (
                                <ListCard key={event.id} 
                                    date={format(localizedStart, "MMM d")}
                                    time={`${localizedStartTime}${localizedEndTime ? ` - ${localizedEndTime}` : ""}`}     
                                    location={event.location_name}
                                    name={event.name}
                                    link={`/events/${event.eventType}/${event.slug}`}
                                    category={event.eventType}
                                    image={image ?? null}
                                />
                            );
                        })}
                    </div>
                :
                    <div className="w-full text-base font-pixel text-gray-500">
                        {currentSemester ?
                            "No upcoming events found. Check back again soon!"
                        :
                            "No events found for this semester. Try a different filter!"
                        }
                    </div>
                }
            </div>
        </div>
    );
}
