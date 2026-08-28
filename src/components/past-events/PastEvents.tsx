import { useMemo } from "react";
import type { EventType } from "@/types";
import SemesterEvents from "../SemesterEvents";
import SkeletonSemesterEvents from "../SkeletonLoader";
import LoadMoreButton from "@/components/LoadMoreButton";
import { getSemesterFromDate, getSemesterDateRange, groupEventsBySemester } from "@/utilities/helpers";
import { useEventFeed } from "@/utilities/useEventFeed";

interface PastEventsProps {
  limit: number;
  apiUrl: string;
  initialEvents?: EventType[] | null;
  initialHasNextPage?: boolean;
}

const CURRENT_SEMESTER = getSemesterFromDate(new Date());

export default function PastEvents({
  limit,
  apiUrl,
  initialEvents = null,
  initialHasNextPage = false,
}: PastEventsProps) {
  const { events, isLoading, hasNextPage, isLoadingMore, loadMore, semester } = useEventFeed({
    apiUrl,
    limit,
    sort: "-start",
    initialEvents,
    initialHasNextPage,
    setWindowParams: (params, sem) => {
      const now = new Date();
      let upper = now;
      if (sem) {
        const { start, end } = getSemesterDateRange(sem);
        params.set("where[start][greater_than]", start.toISOString());
        upper = new Date(Math.min(now.getTime(), end.getTime()));
      }
      params.set("where[start][less_than]", upper.toISOString());
      return true;
    },
  });

  const semesterGroups = useMemo(() => {
    const groups = groupEventsBySemester(events);
    if (!semester) return groups;
    // A selected semester renders alone, even when it has no events
    return [
      groups.find(
        (g) => g.semester.season === semester.season && g.semester.year === semester.year,
      ) ?? { semester, events: [] },
    ];
  }, [events, semester]);

  return (
    <div
      id="past-events"
      className="w-full flex flex-col mb-14 text-left gap-y-4 mx-auto"
    >
      <h2 className="text-3xl sm:text-3xl font-mono font-black m-0">Past</h2>

      {isLoading ? (
        <SkeletonSemesterEvents numEvents={8} semester={semester || CURRENT_SEMESTER} />
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          {semesterGroups.length > 0 ? (
            semesterGroups.map(({ semester: sem, events: semEvents }, idx) => (
              <SemesterEvents key={`${sem.season}-${sem.year}`} events={semEvents} semester={sem} idx={idx} />
            ))
          ) : (
            <div className="w-full text-base font-pixel text-gray-500">
              No past events found.
            </div>
          )}

          {hasNextPage && <LoadMoreButton isLoadingMore={isLoadingMore} onClick={loadMore} />}
        </div>
      )}
    </div>
  );
}
