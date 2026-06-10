import { useEffect, useState } from "react";
import { SquareIcon } from "./icons/Icons";

function getViewModeFromUrl(): "list" | "grid" {
    if (typeof window === "undefined") return "list";
    const raw = new URLSearchParams(window.location.search).get("viewMode")?.trim().toLowerCase();
    return raw === "grid" ? "grid" : "list";
}

export default function ViewModeToggle() {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    useEffect(() => {
        setViewMode(getViewModeFromUrl());
    }, []);

    const onValueChange = (newValue: string) => {
        setViewMode(newValue as "list" | "grid");

        const url = new URL(window.location.href);
        if (newValue) {
            url.searchParams.set("viewMode", newValue);
        } else {
            url.searchParams.delete("viewMode");
        }
        window.history.replaceState(null, "", url.toString());

        // Notify events components so it can re-fetch / re-filter
        window.dispatchEvent(
            new CustomEvent<string | null>("viewModeChange", {
                detail: newValue || null,
            })
        );
    };

    return (
        <div className="flex items-center gap-2">
            <button className={`cursor-pointer px-1 py-0 h-2.5 flex items-center gap-1 rounded-none
                        font-pixel uppercase text-[15px] leading-none text-gray-900 
                        ${viewMode === "list" ? "uppercase dark:text-gray-100 font-semibold" 
                        : "dark:text-gray-400"}`}
                onClick={() => onValueChange("list")}
            >
                <div className={`${viewMode === "list" ? "text-gray-100" : "text-transparent"}`}>{'['}</div>
                <SquareIcon className="w-3 h-3" strokeWidth={viewMode === "list" ? 0 : 2} /> List
                <div className={`${viewMode === "list" ? "text-gray-100" : "text-transparent"}`}>{']'}</div>
            </button>
            <button className={`cursor-pointer px-1 py-0 h-2.5 flex items-center gap-1 rounded-none
                        font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400
                        ${viewMode === "grid" ? "uppercase dark:text-gray-100 font-semibold" 
                        : "dark:text-gray-400"}`}
                onClick={() => onValueChange("grid")}
            >
                <div className={`${viewMode === "grid" ? "text-gray-100" : "text-transparent"}`}>{'['}</div>
                <SquareIcon className="w-3 h-3" strokeWidth={viewMode === "grid" ? 0 : 2} /> Grid
                <div className={`${viewMode === "grid" ? "text-gray-100" : "text-transparent"}`}>{']'}</div>
            </button>
        </div>
    )
}