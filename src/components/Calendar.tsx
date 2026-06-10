import { useEffect, useMemo, useState } from "react";
import type { EventType } from "@/types";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

interface CalendarProps {
    apiUrl: string;
    selectedCategory?: string;
}

export default function Calendar({ apiUrl, selectedCategory = "all" }: CalendarProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Date>();
    const [hackNightDates, setHackNightDates] = useState<Date[]>([]);
    const [workshopDates, setWorkshopDates] = useState<Date[]>([]);
    const [showDates, setShowDates] = useState<Date[]>([]);
    const [otherDates, setOtherDates] = useState<Date[]>([]);

    const defaultClassNames = getDefaultClassNames();

    const categoryClassNames = {
        "hack-night": "bg-hack-night dark:bg-hack-night text-black",
        workshop: "bg-workshop dark:bg-workshop text-black",
        show: "bg-show dark:bg-show text-black",
        other: "bg-other dark:bg-other text-black",
    } as const;

    const categoryDates = {
        "hack-night": hackNightDates,
        workshop: workshopDates,
        show: showDates,
        other: otherDates,
    } as const;

    // Fetch dates of a given category from cms
    const fetchDates = async (cat: string) => {
        const params = new URLSearchParams();
        params.set("sort", "-start");
        params.set("limit", "100");
        params.set("where[published][equals]", "true");
        params.set("where[eventType][equals]", cat);
        const res = await fetch(`${apiUrl}?${params.toString()}`);
        if (!res.ok) {
            setIsLoading(false);
        }

        const data = (await res.json()) as {
            docs: EventType[];
        };

        const docs = data.docs.filter((e) => e.published);
        return docs.map((e) => new Date(e.start));
    };

    useEffect(() => {
        // Fetch dates for all categories from cms
        const fetchHackNightDates = async () => {
            const nextDates = await fetchDates("hack-night");
            setHackNightDates(nextDates);
        };
        const fetchWorkshopDates = async () => {
            const nextDates = await fetchDates("workshop");
            setWorkshopDates(nextDates);
        };
        const fetchShowDates = async () => {
            const nextDates = await fetchDates("show");
            setShowDates(nextDates);
        };
        const fetchOtherDates = async () => {
            const nextDates = await fetchDates("other");
            setOtherDates(nextDates);
        };

        void fetchHackNightDates();
        void fetchWorkshopDates();
        void fetchShowDates();
        void fetchOtherDates();
    }, [apiUrl]);

    const resolvedModifiers = useMemo(() => {
        if (selectedCategory === "all") {
            return {
                hackNight: hackNightDates,
                workshop: workshopDates,
                show: showDates,
                other: otherDates,
            };
        }

        return {
            [selectedCategory]: categoryDates[selectedCategory as keyof typeof categoryDates] ?? [],
        };
    }, [hackNightDates, workshopDates, showDates, otherDates, selectedCategory, categoryDates]);

    const resolvedModifierClassNames = useMemo(() => {
        if (selectedCategory === "all") {
            return {
                hackNight: categoryClassNames["hack-night"],
                workshop: categoryClassNames.workshop,
                show: categoryClassNames.show,
                other: categoryClassNames.other,
            };
        }

        return {
            [selectedCategory]: categoryClassNames[selectedCategory as keyof typeof categoryClassNames] ?? categoryClassNames.other,
        };
    }, [selectedCategory, categoryClassNames]);

    return (
        <div>
            <div className="hidden bg-hack-night bg-workshop bg-show bg-other"></div>
            <DayPicker
                animate
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400"
                modifiers={resolvedModifiers}
                modifiersClassNames={resolvedModifierClassNames}
                classNames={{
                    root: `${defaultClassNames.root} m-0 p-0 font-pixel`,
                    chevron: `fill-black dark:fill-white`,
                    today: `bg-white text-black`,
                    selected: `bg-black dark:bg-white text-white dark:text-black`,
                    day: `p-0 m-0`,
                    day_button: `m-0 w-8 h-8 border-1 border-solid border-zinc-400 rounded-none dark:border-zinc-300`,
                    week: `p-0`,
                    month: `p-0`
                }}
            />
            {isLoading ? null : null}
        </div>
    );
}