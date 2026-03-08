import { useEffect, useMemo, useState } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";

interface CategoryFilterProps {
  categories: string[];
}

// Get category query param from url
function getCategoryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("cat")?.trim().toLowerCase();
  return raw || null;
}

declare global {
  interface Window {
    applyCategoryFilter?: () => void;
  }
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const options: SelectorOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(categories.filter(Boolean).map((c) => c.toLowerCase()))
    );

    return uniqueCategories
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: value
          .split(/[-\s]/)
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(" "),
      }));
  }, [categories]);

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const cat = getCategoryFromUrl();
    if (cat && options.some((o) => o.value === cat)) {
      setValue(cat);
    }
  }, [options]);

  const onValueChange = (newValue: string) => {
    setValue(newValue);

    const url = new URL(window.location.href);
    if (newValue) {
      url.searchParams.set("cat", newValue);
    } else {
      url.searchParams.delete("cat");
    }
    window.history.replaceState(null, "", url.toString());

    window.applyCategoryFilter?.();
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Category"
      value={value}
      ariaLabel="Filter events by category"
    />
  );
}
