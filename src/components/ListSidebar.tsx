import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import ViewModeToggle from "./ViewModeToggle";
import SearchBar from "./SearchBar";
import SemesterFilter from "./SemesterFilter";
import CategoryFilter from "./CategoryFilter";
import { EVENT_CATEGORIES } from "@/types";
import { getSemestersNewestFirst } from "@/utilities/helpers";

const CATEGORY_OPTIONS = [
    { value: "all", label: "All event types" },
    { value: "hack-night", label: "Hack nights" },
    { value: "workshop", label: "Workshops" },
    { value: "show", label: "Shows" },
    { value: "other", label: "Other" },
] as const;

interface ListSidebarProps {
    apiUrl: string;
}

export default function ListSidebar({ apiUrl }: ListSidebarProps) {
    const [isListView, setIsListView] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORY_OPTIONS)[number]["value"]>("all");

    const allSemesters = getSemestersNewestFirst();
    const categories = [...EVENT_CATEGORIES];

    useEffect(() => {
        const syncViewMode = () => {
            const raw = new URLSearchParams(window.location.search).get("viewMode")?.trim().toLowerCase();
            setIsListView(raw !== "grid");
        };

        syncViewMode();
        window.addEventListener("viewModeChange", syncViewMode as EventListener);
        window.addEventListener("popstate", syncViewMode);

        return () => {
            window.removeEventListener("viewModeChange", syncViewMode as EventListener);
            window.removeEventListener("popstate", syncViewMode);
        };
    }, []);

    /*if (!isListView) {
        return null;
    }*/

    const selectedLabel = CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ?? "All categories";

    return (
        <aside className="z-50 sticky top-34 w-fit min-w-80 hidden sm:block">
            <div className="border border-zinc-400 bg-white/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-black/80">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-pixel text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        Event calendar
                    </p>
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-300">
                        <select
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value as (typeof CATEGORY_OPTIONS)[number]["value"])}
                            className="border border-zinc-400 bg-transparent px-1 py-0.5 font-mono text-[10px] uppercase text-zinc-900 outline-none dark:text-zinc-100"
                        >
                            {CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <Calendar apiUrl={apiUrl} selectedCategory={selectedCategory} />

                <div className="w-fit mx-0 xl:m-auto flex flex-col items-start justify-between gap-4">
                    {/* Filter */}
                    <div className="px-4 py-3 sm:py-0 w-full sm:w-fit flex flex-col gap-2 border-b-1 sm:border-none border-zinc-300 dark:border-zinc-600">
                        <h4 className="text-sm uppercase font-mono">Filter:</h4>
                        <SemesterFilter semesters={allSemesters} />
                        <CategoryFilter categories={categories} />
                    </div>

                    {/* List/Grid Buttons */}
                    <ViewModeToggle />

                    {/* Search bar */}
                    <div className="px-4 py-3 sm:py-0 w-full lg:w-1/3 flex items-center gap-2 pr-4">
                        <h4 className="block sm:block">Search:</h4>
                        <SearchBar />
                    </div>
                </div>
            </div>
        </aside>
    );
}
