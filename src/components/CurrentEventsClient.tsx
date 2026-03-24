import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { EVENT_CATEGORIES, type EventType } from "@/types";
import Card from "@/components/Card";
import { getLocalizedEventTimes } from "@/utilities/helpers";
import type { SemesterType } from "@/types";

interface CurrentEventsClientProps {
    initialEvents: EventType[];
    currentSemester: SemesterType;
}

function getCategoryFromUrl(): string | null {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("cat")?.trim().toLowerCase();
    return raw || null;
}

function isKnownCategory(category: string | null) {
    return Boolean(category && EVENT_CATEGORIES.map((c) => c.toLowerCase()).includes(category));
}

export default function CurrentEventsClient({ initialEvents, currentSemester }: CurrentEventsClientProps) {
    const [events] = useState<EventType[]>(initialEvents);
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
            className="[--line-card-gap:25px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] lg:container flex flex-col mb-0 pt-6 sm:pt-14 px-4 sm:px-12 md:px-18 xl:px-28 text-left gap-y-4 lg:max-w-screen-2xl mx-auto"
            id={`current-events-sec`}
        >
            <h2 className="sm:mb-2 text-3xl sm:text-4xl font-mono font-black m-0">Upcoming</h2>
            
            {/* Semester label */}
            <div className="z-50 sticky top-24 w-fit">
                <div className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark "
                    style={{gap: "calc(var(--line-card-gap) - var(--sem-icon-size))"}}
                >
                    <div
                        data-sentinel={`#current-events-sec`}
                        className="relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) bg-gray-300 dark:bg-zinc-600 data-[past-sentinel=true]:bg-yellow-400 flex items-center justify-center"
                        style={{left: "calc(-1 * var(--sem-icon-size) / 2)"}}
                    >
                        <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900"></div>
                    </div>
                    <h3 className="text-base sm:text-base font-normal leading-none p-0 m-0 uppercase font-pixel">
                        {currentSemester.season} {currentSemester.year}
                    </h3>
                </div>
            </div>

            {/* Event cards */}
            <div className="pl-(--line-card-gap) border-l-1 border-gray-300">
                {(filteredEvents.length > 0 || selectedCategory === "hack-night") ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:auto-cols-fr">
                        {(!selectedCategory || selectedCategory === "hack-night") &&
                            <div className="w-full flex justify-start items-center">
                                <a className="w-full" href="https://discord.com/invite/5paFjKzdPE" target="_blank" rel="noreferrer">
                                    <div className="w-full md:w-fit rounded-sm bg-black text-white p-4 flex flex-col justify-center gap-y-3">
                                        <p className="font-pixel text-purple-400 uppercase text-sm">--weekly--</p>
                                        <h2 className="font-mono text-yellow text-left text-xl sm:text-2xl font-bold">
                                            Come to Hack Night!!
                                        </h2>
                                        <p className="font-subtext">Every Friday 8pm at the Bechtel Center.</p>
                                        <button className="hidden cursor-pointer w-fit px-2 uppercase text-sm font-pixel font-normal text-white bg-black rounded-sm">
                                            Check it out {'>>'}
                                        </button>
                                    </div>
                                </a>
                            </div>
                        }
                        {filteredEvents.map((event) => {
                            const { localizedStart, localizedStartTime, localizedEndTime } = getLocalizedEventTimes(event);

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
                :
                    <div className="w-full text-base font-pixel text-gray-500">
                        No upcoming events found. Check back again soon!
                    </div>
                }
            </div>

            {(!selectedCategory || selectedCategory === "hack-night") &&
                <div className="hidden w-full flex justify-start items-center">
                    <a className="w-full" href="https://lu.ma/user/purduehackers" target="_blank" rel="noreferrer">
                        <div className="w-full md:w-fit rounded-sm bg-yellow dark:text-black p-4 flex flex-col justify-center gap-y-3">
                            <p className="font-pixel uppercase text-sm">--weekly--</p>
                            <h2 className="font-mono text-left text-xl sm:text-2xl font-bold">
                                Come to Hack Night!!
                            </h2>
                            <p className="font-subtext">Every Friday 8pm at the Bechtel Center.</p>
                            <button className="cursor-pointer w-fit px-2 uppercase text-sm font-pixel font-normal text-white bg-black rounded-sm">
                                Check it out {'>>'}
                            </button>
                        </div>
                    </a>
                </div>
            }
        </div>
    );
}
