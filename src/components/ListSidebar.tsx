import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import SemesterFilter from "./SemesterFilter";
import CategoryFilter from "./CategoryFilter";
import Clock from "@/components/Clock";
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
    const [semester, setSemester] = useState(new Date());

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
                if (raw == null) {
                    return "all";
                }
                if (raw === "all" || raw === "other" || categories.map((c) => c.toLowerCase()).includes(raw ?? "")) {
                    return raw as (typeof CATEGORY_OPTIONS)[number]["value"];
                }
                return prev;
            });
        };
        const syncSemester = () => {
            const raw = new URLSearchParams(window.location.search).get("sem")?.trim().toLowerCase();
            console.log("raw: ", raw)
            setSemester((prev) => {
                // Default to current
                if (raw == null) {
                    return new Date();
                }

                // Convert slug to semester
                const [season, yearStr] = raw.split("-");
                console.log(yearStr, season)
                const year = yearStr ? parseInt(yearStr) : null;
                if (!year || isNaN(year) || !season || !["spring", "summer", "fall"].includes(season)) {
                    return prev;
                }

                // Get first date of semester
                const month = season === "spring" ? 0 : season === "summer" ? 5 : 7;
                console.log("date: ", new Date(year, month, 1));
                return new Date(year, month, 1);
            });
        }

        syncViewMode();
        syncCategory();
        syncSemester();
        window.addEventListener("viewModeChange", syncViewMode as EventListener);
        window.addEventListener("categoryChange", syncCategory as EventListener);
        window.addEventListener("semesterChange", syncSemester as EventListener);
        window.addEventListener("popstate", syncViewMode);

        return () => {
            window.removeEventListener("viewModeChange", syncViewMode as EventListener);
            window.removeEventListener("categoryChange", syncCategory as EventListener);
            window.removeEventListener("semesterChange", syncSemester as EventListener);
            window.removeEventListener("popstate", syncViewMode);
        };
    }, []);

    return (
        <aside className="[--sidebar-bg:black] dark:[--sidebar-bg:black] z-50 sticky top-34 w-fit min-w-60 md:min-w-75 hidden sm:block">
            <div className="bg-(--sidebar-bg) p-0 border border-zinc-800 dark:border-zinc-800 flex flex-col gap-0 items-center">
                <div className="w-full px-8 py-3 flex items-center justify-between gap-2 border-b-1 border-zinc-300 dark:border-zinc-800">
                    <p className="hidden font-pixel text-[10px] text-yellow uppercase tracking-[0.2em]">
                        Calendar
                    </p>

                    <button className="cursor-pointer px-2 bg-purple-700 text-white uppercase text-[11px] tracking-[0.2em] font-pixel font-bold rounded-none">
                        iCal
                    </button>
                    <SemesterFilter 
                        semesters={allSemesters} 
                        triggerStyle="py-1 gap-1 tracking-wider font-pixel uppercase text-[14px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400"
                        portalStyle="-left-4 bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-800 font-pixel uppercase"
                        itemStyle="relative select-none flex items-center py-2 px-6 tracking-wider text-[14px] leading-none text-gray-900 dark:text-zinc-400 hover:text-white data-[highlighted]:bg-zinc-900 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500"
                    />
                </div>

                {/* Filter */}
                <div className="hidden w-full flex flex-row gap-2 justify-between px-3 py-2 border-y-1 border-zinc-300 dark:border-zinc-800">
                    <CategoryFilter categories={categories} />
                    <SemesterFilter semesters={allSemesters} />
                </div>

                <div className="py-2">
                    <Calendar apiUrl={apiUrl} selectedCategory={selectedCategory} semesterMonth={semester} />
                </div>

                <div className="w-full text-white font-mono px-4 py-2 flex items-center justify-between gap-2 border-t-1 border-zinc-300 dark:border-zinc-800">
                    
                    <div className="text-[10px] uppercase tracking-[0.2em]">
                        <Clock />
                    </div>
                </div>
            </div>
        </aside>
    );
}
