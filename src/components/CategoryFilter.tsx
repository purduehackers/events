import { useEffect, useMemo, useState } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";

interface CategoryFilterProps {
  categories: string[];
  triggerStyle?: string;
  portalStyle?: string;
  itemStyle?: string;
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

export default function CategoryFilter({ categories, triggerStyle, portalStyle, itemStyle }: CategoryFilterProps) {
  const options: SelectorOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(categories.filter(Boolean).map((c) => c.toLowerCase()))
    );

    const optionList: SelectorOption[] = uniqueCategories.map((value) => ({
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

    // Notify past and current events components so it can re-fetch / re-filter
    window.dispatchEvent(
      new CustomEvent<string | null>("categoryChange", {
        detail: newValue || null,
      })
    );
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Category"
      value={value}
      ariaLabel="Filter events by category"
      triggerStyle={triggerStyle? triggerStyle : "w-36 px-2 py-1 gap-1 font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400"}
      portalStyle={portalStyle? portalStyle : "bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-pixel uppercase"}
      itemStyle={itemStyle? itemStyle : "relative select-none flex items-center py-2 px-6 text-[15px] leading-none text-gray-900 dark:text-gray-100 hover:bg-purple-400 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500"}
    />
  );
}
