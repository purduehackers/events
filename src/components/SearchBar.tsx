import { useEffect, useState } from "react";
import { XIcon } from "./icons/Icons";

// Get search query param from url
function getQueryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("query")?.trim().toLowerCase();
  return raw || null;
}

declare global {
  interface Window {
    knownEventCategories?: string[];
    applyCategoryFilter?: () => void;
  }
}

export default function SearchBar() {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const query = getQueryFromUrl();
    if (query) setValue(query);
  }, []);

  const handleChange = (newVal: string) => {
    setValue(newVal);

    // Update url query param
    const url = new URL(window.location.href);
    if (newVal) {
      url.searchParams.set("query", newVal);
    } else {
      url.searchParams.delete("query");
    }
    window.history.replaceState(null, "", url.toString());
    
    // Notify past/current events components to re-fetch/re-filter
    window.dispatchEvent(
      new CustomEvent<string>("searchQueryChange", {
        detail: newVal,
      })
    );
  }

  const handleSubmit = () => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("query", value);
    } else {
      url.searchParams.delete("query");
    }
    window.history.replaceState(null, "", url.toString());
    
    // Notify past/current events components so they can re-fetch/re-filter
    window.dispatchEvent(
      new CustomEvent<string>("searchQueryChange", {
        detail: value,
      })
    );
  }

  return (
    <div className="w-full flex gap-2 items-center">
      <input 
        className="grow border-b-none sm:border-b-1 border-dashed border-zinc-400 dark:border-zinc-500"
        type="text"
        placeholder="wackhacker world domination..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button 
        className="absolute right-4 cursor-pointer disabled:hidden min-w-fit w-fit h-fit p-[1px] text-xs rounded-full text-zinc-200 dark:text-zinc-700 bg-zinc-400 dark:bg-zinc-400"
        onClick={() => handleChange("")}
        disabled={(value?.length === 0)}
      >
        <XIcon className="w-3 w-3" />
      </button>
    </div>
  );
}
