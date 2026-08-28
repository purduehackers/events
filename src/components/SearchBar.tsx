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
    <div className="w-full flex gap-2 items-center">
      <input
        className="grow border-b-none sm:border-b-1 border-dashed border-zinc-400 dark:border-zinc-500"
        type="text"
        placeholder="wackhacker world domination..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      <button
        className="relative cursor-pointer disabled:hidden min-w-fit w-fit h-fit p-[1px] text-xs rounded-full text-zinc-200 dark:text-zinc-700 bg-zinc-400 dark:bg-zinc-400"
        onClick={() => handleChange("")}
        disabled={(value?.length === 0)}
      >
        <XIcon className="w-3 w-3" />
      </button>
    </div>
  );
}
