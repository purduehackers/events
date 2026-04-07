import { useEffect, useState } from "react";

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
        className="grow border-b border-dashed border-gray-500"
        type="text"
        placeholder="phackers world domination..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button 
        className="hidden cursor-pointer min-w-fit h-fit px-1.5 py-0 text-sm rounded-xs border-1 text-black border-black dark:text-white dark:border-white disabled:text-gray-500 disabled:border-gray-500  disabled:dark:text-gray-400 disabled:dark:border-gray-400"
        onClick={() => handleSubmit()}
        disabled={(value?.length === 0)}
      >
        GO-{'>'}
      </button>
    </div>
  );
}
