import { useEffect, useMemo, useState } from "react";
import type { EventType } from "@/types";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

interface CalendarProps {
    apiUrl: string;
    selectedCategory?: string;
    semesterMonth: Date;
}

export default function Calendar({ apiUrl, selectedCategory = "", semesterMonth = new Date() }: CalendarProps) {
    const [selected, setSelected] = useState<Date>();
    const [month, setMonth] = useState(semesterMonth);
    console.log("semesterMonth: ", semesterMonth)
    console.log("month: ", month)

    useEffect(() => {
        setMonth(semesterMonth);
    }, [semesterMonth]);

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
            return [];
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
                timeZone="America/New_York" 
                selected={selected}
                onSelect={setSelected}
                month={month} 
                onMonthChange={setMonth}
                className="text-gray-500 dark:text-zinc-100"
                modifiers={modifiers}
                modifiersClassNames={modifierClassNames}
                classNames={{
                    root: `${defaultClassNames.root} min-w-fit m-0 p-0 font-pixel`,
                    month_caption: `${defaultClassNames.month_caption} flex items-center pl-2 text-white`,
                    caption_label: `max-h-fit text-center text-base leading-none`,
                    chevron: `m-0 w-4 h-4 fill-white`,
                    today: `bg-zinc-800 text-white font-bold`,
                    selected: `bg-zinc-800 text-white font-bold`,
                    day: `p-0 m-0`,
                    day_button: `text-sm md:text-[14px] p-1 md:p-[7px] m-0 w-full h-full border-1 md:border-[2px] border-solid border-(--sidebar-bg)`,
                    week: `${defaultClassNames.week} text-zinc-400 gap-2 m-0`,
                    weeks: `${defaultClassNames.weeks} gap-2 m-0`,
                    weekdays: `${defaultClassNames.weekdays} text-zinc-300`,
                    months: `m-0`
                }}
            />
            <button className="hidden" onClick={() => setMonth(new Date())}>Go to Today</button>
        </div>
    );
}