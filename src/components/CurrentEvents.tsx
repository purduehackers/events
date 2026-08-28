import { useMemo } from "react";
import type { EventType } from "@/types";
import SemesterEvents from "@/components/SemesterEvents";
import LoadMoreButton from "@/components/LoadMoreButton";
import SkeletonSemesterEvents from "./SkeletonLoader";
import { getSemesterFromDate, getSemesterDateRange, groupEventsBySemester } from "@/utilities/helpers";
import { useEventFeed } from "@/utilities/useEventFeed";

interface CurrentEventsProps {
    apiUrl: string;
    initialEvents?: EventType[] | null;
    initialHasNextPage?: boolean;
}

const CURRENT_SEMESTER = getSemesterFromDate(new Date());

const isCurrentSemester = (s: { season: string; year: number }) =>
    s.season === CURRENT_SEMESTER.season && s.year === CURRENT_SEMESTER.year;

export default function CurrentEvents({ apiUrl, initialEvents = null, initialHasNextPage = false }: CurrentEventsProps) {
    const { events, isLoading, hasNextPage, isLoadingMore, loadMore, semester } = useEventFeed({
        apiUrl,
        limit: 30,
        sort: "start",
        initialEvents,
        initialHasNextPage,
        setWindowParams: (params, sem) => {
            const now = new Date();
            // A non-current semester never has upcoming events
            if (sem && !isCurrentSemester(sem)) return false;
            params.set("where[start][greater_than]", now.toISOString());
            if (sem) {
                const { end } = getSemesterDateRange(sem);
                params.set(
                    "where[start][less_than]",
                    new Date(Math.max(now.getTime(), end.getTime())).toISOString(),
                );
            }
            return true;
        },
    });

    // Group by semester; the current semester always renders so an empty
    // upcoming list still shows its "check back soon" state
    const semesterGroups = useMemo(() => {
        const groups = groupEventsBySemester(events);
        if (!groups.some((g) => isCurrentSemester(g.semester))) {
            groups.push({ semester: CURRENT_SEMESTER, events: [] });
        }
        return groups;
    }, [events]);

    // If a non-current semester is selected there is nothing upcoming to show
    if (semester && !isCurrentSemester(semester)) {
        return null;
    }

    return (
        <div className="w-full flex flex-col text-left gap-y-4 mx-auto">
            <h2 className="text-3xl sm:text-3xl font-mono font-black m-0">Upcoming</h2>
            {isLoading ? (
                <SkeletonSemesterEvents numEvents={3} semester={CURRENT_SEMESTER} />
            ) : (
                <div className="w-full flex flex-col gap-y-4">
                    {semesterGroups.map(({ semester: sem, events: semEvents }, idx) => (
                        <section key={`${sem.season}-${sem.year}`}>
                            <SemesterEvents
                                events={semEvents}
                                semester={sem}
                                currentSemester={isCurrentSemester(sem)}
                                idx={idx}
                            />
                        </section>
                    ))}
                    {hasNextPage && <LoadMoreButton isLoadingMore={isLoadingMore} onClick={loadMore} />}
                </div>
            )}
        </div>
    );
}
