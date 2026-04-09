import { useEffect, useMemo, useState } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";
import type { SemesterType } from "@/types";

interface SemesterFilterProps {
  semesters: SemesterType[];
}

// Get semester query param from url
function getSemFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/");
  const raw = pathSegments[1]?.trim().toLowerCase();
  if (!raw) return null;
  const m = raw.match(/(spring|summer|fall)[\s_-]?(\d{4})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

declare global {
  interface Window {
    applySemesterFilter?: () => void;
  }
}

export default function SemesterFilter({ semesters }: SemesterFilterProps) {
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
      url.pathname = newValue;
    } else {
      url.pathname = "";
    }
    window.location.href = url.toString();
    //window.history.pushState(null, "", url.toString());

    // Call func defined in PastEvents page to update semesters view
    window.applySemesterFilter?.();
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Semester"
      value={value}
      ariaLabel="Filter past events by semester"
    />
  );
}
