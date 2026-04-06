import { useEffect, useMemo, useState } from "react";

interface CategoryFilterProps {
  categories: string[];
}

// Get search query query param from url
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

  const onValueChange = (newValue: string) => {
    setValue(newValue);

    const url = new URL(window.location.href);
    if (newValue) {
      url.searchParams.set("query", newValue);
    } else {
      url.searchParams.delete("query");
    }
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <input className="grow border-b border-gray-500"
        type="text"
        placeholder="phackers world domination..."
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
    />
  );
}
