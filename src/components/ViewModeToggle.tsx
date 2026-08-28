import { SquareIcon } from "./icons/Icons";
import { setUrlFilter, useUrlFilters } from "@/utilities/useUrlFilters";

export type ViewMode = "list" | "grid";

export default function ViewModeToggle() {
    const { viewMode } = useUrlFilters();

    const onValueChange = (newValue: ViewMode) => {
        setUrlFilter("viewMode", newValue);
    };

    return (
        <div className="flex items-center gap-2">
            <button className={`cursor-pointer px-1 py-0 h-2.5 flex items-center gap-1 rounded-none
                        font-pixel uppercase text-[15px] leading-none text-gray-900 
                        ${viewMode === "list" ? "uppercase dark:text-gray-100 font-semibold" 
                        : "dark:text-gray-400"}`}
                onClick={() => onValueChange("list")}
            >
                <div className={`${viewMode === "list" ? "text-black dark:text-gray-100" : "text-transparent"}`}>{'['}</div>
                <SquareIcon className="w-3 h-3" strokeWidth={viewMode === "list" ? 0 : 2} /> List
                <div className={`${viewMode === "list" ? "text-black dark:text-gray-100" : "text-transparent"}`}>{']'}</div>
            </button>
            <button className={`cursor-pointer px-1 py-0 h-2.5 flex items-center gap-1 rounded-none
                        font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400
                        ${viewMode === "grid" ? "uppercase dark:text-gray-100 font-semibold" 
                        : "dark:text-gray-400"}`}
                onClick={() => onValueChange("grid")}
            >
                <div className={`${viewMode === "grid" ? "text-black dark:text-gray-100" : "text-transparent"}`}>{'['}</div>
                <SquareIcon className="w-3 h-3" strokeWidth={viewMode === "grid" ? 0 : 2} /> Grid
                <div className={`${viewMode === "grid" ? "text-black dark:text-gray-100" : "text-transparent"}`}>{']'}</div>
            </button>
        </div>
    )
}