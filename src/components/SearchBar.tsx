import { useEffect, useState } from "react";
import { XIcon } from "./icons/Icons";
import { setUrlFilter, useUrlFilters } from "@/utilities/useUrlFilters";

export default function SearchBar() {
  const { query } = useUrlFilters();
  const [value, setValue] = useState<string>("");

  // Follow external query changes (back/forward, the other SearchBar
  // instance, shared links) without clobbering in-progress typing: only sync
  // when the trimmed input actually differs from the URL's query.
  useEffect(() => {
    setValue((prev) => (prev.trim() === query ? prev : query));
  }, [query]);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    setUrlFilter("query", newVal);
  };

  return (
    <div className="w-full min-w-0 flex gap-2 items-center">
      {/* min-w-0 lets the input give up width to the filters on narrow
          screens; truncate keeps the placeholder from spilling when it does */}
      <input
        className="grow min-w-0 py-1.5 sm:py-0 truncate bg-transparent border-b-1 border-dashed border-zinc-400 dark:border-zinc-500"
        type="text"
        aria-label="Search events"
        placeholder="wackhacker world domination..."
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {/* The ::before extends the hit area to ~30px without growing the dot */}
      <button
        className="relative cursor-pointer disabled:hidden min-w-fit w-fit h-fit p-[1px] text-xs rounded-full text-zinc-200 dark:text-zinc-700 bg-zinc-400 dark:bg-zinc-400 before:absolute before:-inset-2 before:content-['']"
        onClick={() => handleChange("")}
        disabled={(value?.length === 0)}
        aria-label="Clear search"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}
