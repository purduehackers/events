import { useSyncExternalStore } from "react";
import type { SemesterType } from "@/types";
import type { ViewMode } from "@components/ViewModeToggle";

// One URL-backed source of truth for the filter/search state. Dispatchers
// write the URL via setUrlFilter (replaceState + CustomEvent); every consumer
// reads the same shared snapshot through useUrlFilters, so there is exactly
// one URL parse and one listener set per page no matter how many components
// subscribe.

export interface UrlFilters {
  /** Trimmed, display case preserved (Payload `like` is case-insensitive). */
  query: string;
  /** Trimmed + lowercased category slug, "" when unset. */
  category: string;
  semester: SemesterType | null;
  viewMode: ViewMode;
}

export const DEFAULT_FILTERS: UrlFilters = {
  query: "",
  category: "",
  semester: null,
  viewMode: "list",
};

export function parseSemesterSlug(slug: string | null): SemesterType | null {
  if (!slug) return null;
  const [season, yearStr] = slug.trim().toLowerCase().split("-");
  const year = Number(yearStr);
  if (!season || !["spring", "summer", "fall"].includes(season)) return null;
  if (!Number.isInteger(year)) return null;
  return { year, season: season as SemesterType["season"] };
}

/** First month of a semester, for calendar navigation. */
export function semesterToMonth(semester: SemesterType): Date {
  const month = semester.season === "spring" ? 0 : semester.season === "summer" ? 5 : 7;
  return new Date(semester.year, month, 1);
}

function readFiltersFromUrl(): UrlFilters {
  const params = new URLSearchParams(window.location.search);
  return {
    query: (params.get("query") ?? "").trim(),
    category: (params.get("cat") ?? "").trim().toLowerCase(),
    semester: parseSemesterSlug(params.get("sem")),
    viewMode:
      params.get("viewMode")?.trim().toLowerCase() === "grid" ? "grid" : "list",
  };
}

const FILTER_EVENTS = [
  "popstate",
  "categoryChange",
  "searchQueryChange",
  "semesterChange",
  "viewModeChange",
] as const;

// Module-level store: one snapshot shared by every subscriber. The snapshot
// only changes identity when a field actually changed, so effects that depend
// on `semester` (an object) don't refire spuriously.
let snapshot = DEFAULT_FILTERS;
let windowListenersAttached = false;
const subscribers = new Set<() => void>();

function refreshSnapshot() {
  const next = readFiltersFromUrl();
  const prev = snapshot;
  const semesterSame =
    prev.semester === next.semester ||
    (prev.semester?.year === next.semester?.year &&
      prev.semester?.season === next.semester?.season);
  if (
    prev.query === next.query &&
    prev.category === next.category &&
    prev.viewMode === next.viewMode &&
    semesterSame
  ) {
    return;
  }
  snapshot = next;
  subscribers.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  if (!windowListenersAttached) {
    windowListenersAttached = true;
    for (const evt of FILTER_EVENTS) window.addEventListener(evt, refreshSnapshot);
    refreshSnapshot();
  }
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

export function useUrlFilters(): UrlFilters {
  // Server snapshot = defaults, so SSR markup and the hydration render agree;
  // the first subscription syncs everyone to the real URL.
  return useSyncExternalStore(subscribe, () => snapshot, () => DEFAULT_FILTERS);
}

const FILTER_PARAM_EVENTS = {
  query: "searchQueryChange",
  cat: "categoryChange",
  sem: "semesterChange",
  viewMode: "viewModeChange",
} as const;

/** Write one filter to the URL and notify every consumer. "" clears it. */
export function setUrlFilter(key: keyof typeof FILTER_PARAM_EVENTS, value: string) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", url.toString());
  window.dispatchEvent(new CustomEvent(FILTER_PARAM_EVENTS[key], { detail: value }));
}
