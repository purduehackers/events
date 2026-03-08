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
    knownEventCategories?: string[];
    applyCategoryFilter?: () => void;
  }
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const options: SelectorOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(categories.filter(Boolean).map((c) => c.toLowerCase()))
    );

    const sorted = uniqueCategories.sort((a, b) => a.localeCompare(b));
    const optionList: SelectorOption[] = sorted.map((value) => ({
      value,
      label: value
        .split(/[-\s]/)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" "),
    }));

    if (!optionList.some((o) => o.value === "other")) {
      optionList.push({ value: "other", label: "Other" });
    }

    return optionList;
  }, [categories]);

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    // Expose known categories to filtering script (for "other" logic)
    window.knownEventCategories = options.map((o) => o.value).filter((v) => v !== "other");

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

    // Notify the past-events component so it can re-fetch / re-filter.
    window.dispatchEvent(
      new CustomEvent<string | null>("pastEvents:categoryChange", {
        detail: newValue || null,
      })
    );

    // Call external filtering script for semester sections/non-react components
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
