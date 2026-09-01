import { useEffect, useMemo, useState } from "react";
import Dialog from "@/components/Dialog";
import Calendar from "@/components/Calendar";
import { StarIcon2 } from "@/components/icons/Icons"
import { SITE_URL } from "@/utilities/constants";
import { formatEasternClock } from "@/utilities/helpers";
import { semesterToMonth, useUrlFilters } from "@/utilities/useUrlFilters";

const FEED_OPTIONS = [
    { value: "all", label: "All events" },
    { value: "hack-night", label: "Hack nights" },
    { value: "workshop", label: "Workshops" },
    { value: "show", label: "Shows" },
    { value: "other", label: "Other" },
] as const;
type FeedOption = (typeof FEED_OPTIONS)[number]["value"];

interface ListSidebarProps {
    apiUrl: string;
    /** Server-formatted Eastern time, so SSR and hydration render the same text */
    initialClock: string;
}

export default function ListSidebar({ apiUrl, initialClock }: ListSidebarProps) {
    const { category, semester } = useUrlFilters();

    // Minute precision, so a 30s tick is plenty
    const [clock, setClock] = useState(initialClock);
    useEffect(() => {
        const tick = () => setClock(formatEasternClock());
        tick();
        const id = setInterval(tick, 30 * 1000);
        return () => clearInterval(id);
    }, []);
    const semesterMonth = useMemo(
        () => (semester ? semesterToMonth(semester) : new Date()),
        [semester],
    );
    const [feedCategory, setFeedCategory] = useState<FeedOption>("all");

    const handleCopy = async (url: string) => {
        try {
            // Use the native Clipboard API to copy text
            await navigator.clipboard.writeText(url);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const feedPath = feedCategory === "all"
        ? "/api/events.ics"
        : `/api/events.ics?cat=${feedCategory}`;
    const icalUrl = `${SITE_URL.replace("https://", "webcal://")}${feedPath}`;
    const feedHttpsUrl = `${SITE_URL}${feedPath}`;

    return (
        <aside className="z-50 sticky top-34 w-full"
            style={{ "--sidebar-bg": "#121216" } as React.CSSProperties}
        >
            <div className="w-full bg-(--sidebar-bg) p-0 border border-zinc-800 dark:border-zinc-800 flex flex-col gap-0 items-center">
                <div className="bg-black w-full h-full p-0 text-white font-mono flex items-center justify-between gap-0 border-b-1 border-zinc-300 dark:border-zinc-800">
                    <div className="flex items-center gap-3 pl-3 text-[10px] uppercase tracking-[0.2em]">
                        <StarIcon2 className="w-2 h-2" />
                        Calendar
                    </div>
                    <Dialog
                        title="Subscribe to feed"
                        description="Add to your preferred calendar to stay up to date with upcoming events."
                        trigger={
                            <button className="cursor-pointer w-fit min-w-6 h-6 px-2 bg-purple-700 text-white text-[10px] uppercase tracking-[0.2em] flex items-center justify-center">
                                Add ICal
                            </button>
                        }
                        children={
                            <div className="flex flex-wrap gap-1">
                                {FEED_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFeedCategory(option.value)}
                                        className={`cursor-pointer px-2 py-1 font-pixel uppercase text-[11px] tracking-wider border-1 ${
                                            feedCategory === option.value
                                                ? "bg-yellow text-black border-yellow"
                                                : "bg-transparent text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        }
                        closeNode={
                            <div className="w-full flex flex-col gap-1">
                                <div className="flex gap-1">
                                    <a className="w-full"
                                        href={`https://www.google.com/calendar/render?cid=${encodeURIComponent(icalUrl)}`}
                                        target="_blank"
                                    >
                                        <button className="button-block w-full min-w-fit bg-[#EA4335] text-white text-sm">
                                            Google
                                        </button>
                                    </a>
                                    <a className="w-full"
                                        href={icalUrl}
                                        target="_blank"
                                    >
                                        <button className="button-block w-full min-w-fit bg-[#249ee4] text-white text-sm">
                                            Outlook
                                        </button>
                                    </a>
                                    <a className="w-full"
                                        href={icalUrl}
                                        target="_blank"
                                    >
                                        <button className="button-block w-full min-w-fit bg-white text-black text-sm">
                                            Apple
                                        </button>
                                    </a>
                                </div>

                                <button className="button-block w-full min-w-fit bg-zinc-700 text-white text-sm"
                                    onClick={() => handleCopy(feedHttpsUrl)}
                                >
                                    Copy URL
                                </button>
                            </div>
                        }
                    />
                </div>

                <div className="py-2 flex flex-col gap-2 items-center justify-center">
                    <Calendar apiUrl={apiUrl} selectedCategory={category} semesterMonth={semesterMonth} />
                </div>

                <div className="bg-black w-full h-full py-1 text-white font-mono flex items-center justify-between gap-0 border-t-1 border-zinc-300 dark:border-zinc-800">
                    <div className="flex items-center gap-3 pl-3 text-[10px] uppercase tracking-[0.2em]">
                        <StarIcon2 className="w-2 h-2" />
                        <div>Live - {clock}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
