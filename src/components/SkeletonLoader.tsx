import type { SemesterType } from "@/types";
import type { ViewMode } from "@components/ViewModeToggle"
import { useEffect, useState } from "react";

function getViewModeFromUrl(): ViewMode {
    if (typeof window === "undefined") return "list";
    const raw = new URLSearchParams(window.location.search).get("viewMode")?.trim().toLowerCase();
    return raw === "grid" ? "grid" : "list";
}

interface SkeletonLoaderProps {
    numEvents: number;
    semester: SemesterType;
}

export default function SkeletonSemesterEvents({ numEvents = 5, semester }: SkeletonLoaderProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    useEffect(() => {
        setViewMode(getViewModeFromUrl());
    }, []);

    // Listen for and apply filtering/searching updates
    useEffect(() => {
        const viewModeHandler = (event: Event) => {
            const detail = (event as CustomEvent<string | null>).detail;
            setViewMode(detail === "grid" ? "grid" : "list");
        };

        window.addEventListener("viewModeChange", viewModeHandler as EventListener);
        return () => {
            window.removeEventListener("viewModeChange", viewModeHandler as EventListener);
        };
    }, []);

    const cardLayoutClassName = viewMode === "grid"
        ? "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 sm:auto-cols-fr"
        : "flex flex-col gap-2";

    return (
        <div 
            className="[--line-card-gap:25px] sm:[--line-card-gap:40px] [--sem-icon-size:14px] px-2 flex flex-col gap-y-4"
        >
            {/* Semester label */}
            <div className="z-50 sticky top-34 sm:top-24 w-fit">
                <div className="relative -left-2 p-2 rounded-full flex items-center bg-body-light dark:bg-body-dark"
                    style={{gap: "calc(var(--line-card-gap) - var(--sem-icon-size))"}}
                >
                    <div
                        className="bg-gray-200 relative -top-[1px] w-(--sem-icon-size) h-(--sem-icon-size) flex items-center justify-center"
                        style={{
                            left: "calc(-1 * var(--sem-icon-size) / 2)",
                        }}
                    >
                        <div className="w-1.5 h-1.5 bg-white dark:bg-zinc-900"></div>
                    </div>
                    <h3 className="text-base sm:text-base font-normal leading-none p-0 m-0 uppercase font-pixel">
                        {semester.season} {semester.year}
                    </h3>
                </div>
            </div>

            {/* Event cards */}
            <div className="pl-(--line-card-gap) border-l-1 border-gray-300">
                <div className={cardLayoutClassName}>
                    {Array(numEvents).fill(0).map((_, i) => {
                        return (
                            <SkeletonCard key={i} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function SkeletonCard({ viewMode = "list" }: { viewMode?: ViewMode }) {
    return (
        <div className={`${viewMode === "list" ? "min-h-32" : "min-h-40"} skeleton dark:[--skeleton-bg:rgb(15,15,15)] dark:[--skeleton-highlight:rgb(22,22,22)] group col-span-1 w-full h-full bg-(--gray-100) dark:bg-(--gray-900) border border-[1px] border-white dark:border-zinc-700 rounded-none`}>
            
        </div>
    )
}