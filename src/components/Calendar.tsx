import { useEffect, useMemo, useState } from "react";
import type { EventType } from "@/types";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

interface CalendarProps {
    apiUrl: string;
    selectedCategory?: string;
}

export default function Calendar({ apiUrl, selectedCategory = "" }: CalendarProps) {
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
        if (cat != "other") {
            params.set("where[eventType][equals]", cat);
        } else {
            // Fetch events that are not the three known categories
            params.set("where[eventType][not_in]", "hack-night,workshop,show");
        }
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

    const modifiers = useMemo(() => {
        if (!selectedCategory || selectedCategory === "all" || selectedCategory === "") {
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

    const modifierClassNames = useMemo(() => {
        if (!selectedCategory || selectedCategory === "all" || selectedCategory === "") {
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
        <div className="w-fit">
            <div className="hidden bg-hack-night bg-workshop bg-show bg-other"></div>
            <DayPicker
                animate
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="text-gray-500 dark:text-gray-100"
                modifiers={modifiers}
                modifiersClassNames={modifierClassNames}
                classNames={{
                    root: `${defaultClassNames.root} w-40 min-w-fit max-w-40 m-0 p-0 font-pixel`,
                    chevron: `m-0 w-4 h-4 fill-black dark:fill-white`,
                    today: `bg-white text-black`,
                    selected: `bg-black dark:bg-white text-white dark:text-black`,
                    day: `p-0 m-0`,
                    day_button: `p-1 md:p-[7px] m-0 w-full h-full border-1 md:border-[2px] border-solid border-zinc-400 dark:border-black`,
                    week: `${defaultClassNames.week} gap-2 m-0`,
                    weeks: `${defaultClassNames.weeks} gap-2 m-0`,
                    months: `m-0`
                }}
            />
            <div className="hidden">
                root: string;
                chevron: string;
                day: string;
                day_button: string;
                caption_label: string;
                dropdowns: string;
                dropdown: string;
                dropdown_root: string;
                footer: string;
                month_grid: string;
                month_caption: string;
                months_dropdown: string;
                month: string;
                months: string;
                nav: string;
                button_next: string;
                button_previous: string;
                week: string;
                weeks: string;
                weekday: string;
                weekdays: string;
                week_number: string;
                week_number_header: string;
                years_dropdown: string;
                range_end: string;
                range_middle: string;
                range_start: string;
            </div>
        </div>
    );
}