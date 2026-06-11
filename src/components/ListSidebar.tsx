import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
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
        const syncCategory = () => {
            const raw = new URLSearchParams(window.location.search).get("cat")?.trim().toLowerCase();
            setSelectedCategory((prev) => {
                if (raw === prev) return prev;
                if (raw === "all" || raw === "other" || categories.map((c) => c.toLowerCase()).includes(raw ?? "")) {
                    return raw as (typeof CATEGORY_OPTIONS)[number]["value"];
                }
                return prev;
            });
        };

        syncViewMode();
        syncCategory();
        window.addEventListener("viewModeChange", syncViewMode as EventListener);
        window.addEventListener("categoryChange", syncCategory as EventListener);
        window.addEventListener("popstate", syncViewMode);

        return () => {
            window.removeEventListener("viewModeChange", syncViewMode as EventListener);
            window.removeEventListener("categoryChange", syncCategory as EventListener);
            window.removeEventListener("popstate", syncViewMode);
        };
    }, []);

    /*if (!isListView) {
        return null;
    }*/

    return (
        <aside className="z-50 sticky top-34 w-fit min-w-80 hidden sm:block">
            <div className="border border-zinc-400 bg-black p-3 dark:border-zinc-700 dark:bg-black/80 flex flex-col gap-2 items-center">
                <div className="w-full mb-3 flex items-center justify-between gap-2">
                    <p className="font-pixel text-[10px] uppercase tracking-[0.2em] text-zinc-400">
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

                {/* Filter */}
                <div className="w-full flex flex-row gap-2 justify-between py-2 border-b-1 border-zinc-300 dark:border-zinc-600">
                    <SemesterFilter semesters={allSemesters} />
                    <CategoryFilter categories={categories} />
                </div>

                <Calendar apiUrl={apiUrl} selectedCategory={selectedCategory} />
            </div>
        </aside>
    );
}
