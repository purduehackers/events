import { useEffect, useMemo, useState } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";
import type { SemesterType } from "@/types";

interface SemesterFilterProps {
  semesters: SemesterType[];
  triggerStyle?: string;
  portalStyle?: string;
  itemStyle?: string;
}

// Get semester query param from url
function getSemFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("sem")?.trim().toLowerCase();
  return raw || null;
}

declare global {
  interface Window {
    applySemesterFilter?: () => void;
  }
}

export default function SemesterFilter({ semesters, triggerStyle, portalStyle, itemStyle }: SemesterFilterProps) {
  // Get semester options (formatted w value and label)
  const options: SelectorOption[] = useMemo(() => {
    const list: SelectorOption[] = [];
    for (const s of semesters) {
      list.push({
        value: `${s.season}-${s.year}`,
        label: `${s.season} ${s.year}`,
      });
    }
    return list;
  }, [semesters]);

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    // Set semester value if valid
    const sem = getSemFromUrl();
    if (sem && options.some((o) => o.value === sem)) {
      setValue(sem);
    }
  }, [options]);

  const onValueChange = (newValue: string) => {
    setValue(newValue);

    // Update url query params 
    const url = new URL(window.location.href);
    if (newValue) {
      url.searchParams.set("sem", newValue);
    } else {
      url.searchParams.delete("sem");
    }
    window.history.replaceState(null, "", url.toString());

    // Notify past and current events components so it can re-fetch / re-filter
    window.dispatchEvent(
      new CustomEvent<string | null>("semesterChange", {
        detail: newValue || null,
      })
    );
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Semester"
      value={value}
      ariaLabel="Filter past events by semester"
      triggerStyle={triggerStyle? triggerStyle : "w-36 px-2 py-1 gap-1 font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400"}
      portalStyle={portalStyle? portalStyle : "bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-pixel uppercase"}
      itemStyle={itemStyle? itemStyle : "relative select-none flex items-center py-2 px-6 text-[15px] leading-none text-gray-900 dark:text-gray-100 hover:bg-purple-400 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500"}
    />
  );
}
