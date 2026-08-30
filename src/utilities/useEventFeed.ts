import { useEffect, useRef, useState } from "react";
import { EVENT_CATEGORIES, type EventType, type SemesterType } from "@/types";
import { isKnownCategory, setCardSelectParams } from "./helpers";
import { useUrlFilters, type UrlFilters } from "./useUrlFilters";

const SEARCH_DEBOUNCE_MS = 300;
const INITIAL_PAGE = 1;

interface EventFeedOptions {
  apiUrl: string;
  limit: number;
  sort: "start" | "-start";
  initialEvents?: EventType[] | null;
  initialHasNextPage?: boolean;
  /** Adds the list's date-window clauses; return false to render an empty
   *  list without fetching (e.g. upcoming events of a past semester). */
  setWindowParams: (params: URLSearchParams, semester: SemesterType | null) => boolean;
}

interface EventFeed extends UrlFilters {
  events: EventType[];
  isLoading: boolean;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
}

// The shared fetch/paginate machine behind CurrentEvents and PastEvents:
// URL-driven filters, a debounced + abortable fetch (query changes debounce,
// everything else fetches immediately; the last-issued request always wins),
// and cursorless load-more.
export function useEventFeed({
  apiUrl,
  limit,
  sort,
  initialEvents = null,
  initialHasNextPage = false,
  setWindowParams,
}: EventFeedOptions): EventFeed {
  const filters = useUrlFilters();
  const { query, category, semester } = filters;

  const [events, setEvents] = useState<EventType[]>(initialEvents ?? []);
  const [isLoading, setIsLoading] = useState(!initialEvents);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [hasNextPage, setHasNextPage] = useState(initialEvents ? initialHasNextPage : false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const skippedInitialFetch = useRef(false);
  const lastFetchedQuery = useRef("");

  const buildFetchParams = (pageNum: number): URLSearchParams | null => {
    const params = new URLSearchParams();
    if (!setWindowParams(params, semester)) return null;
    params.set("sort", sort);
    params.set("limit", String(limit));
    params.set("page", String(pageNum));
    if (isKnownCategory(category)) {
      params.set("where[eventType][equals]", category);
    } else if (category === "other") {
      params.set("where[eventType][not_in]", EVENT_CATEGORIES.join(","));
    }
    if (query) params.set("q", query);
    setCardSelectParams(params);
    return params;
  };

  useEffect(() => {
    // The first run happens with default filter state; when the server
    // already rendered that data (initialEvents), skip the duplicate fetch.
    // If the URL carries filters, the store sync changes the deps right
    // after mount and the second run fetches the filtered data.
    if (!skippedInitialFetch.current) {
      skippedInitialFetch.current = true;
      if (initialEvents) return;
    }

    const params = buildFetchParams(INITIAL_PAGE);
    if (!params) {
      setEvents([]);
      setHasNextPage(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { docs: EventType[]; hasNextPage: boolean };
          setEvents(data.docs);
          setPage(INITIAL_PAGE);
          setHasNextPage(Boolean(data.hasNextPage));
        }
        setIsLoading(false);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setIsLoading(false);
      }
    };

    const delay = query !== lastFetchedQuery.current ? SEARCH_DEBOUNCE_MS : 0;
    const timer = setTimeout(() => {
      lastFetchedQuery.current = query;
      void fetchEvents();
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, semester]);

  const loadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const params = buildFetchParams(nextPage);
    if (!params) {
      setIsLoadingMore(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}?${params.toString()}`);
      if (!res.ok) {
        setHasNextPage(false);
        return;
      }

      const data = (await res.json()) as { docs: EventType[]; hasNextPage: boolean };
      setEvents((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        return [...prev, ...data.docs.filter((e) => !existingIds.has(e.id))];
      });
      setPage(nextPage);
      setHasNextPage(Boolean(data.hasNextPage));
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { ...filters, events, isLoading, hasNextPage, isLoadingMore, loadMore };
}
