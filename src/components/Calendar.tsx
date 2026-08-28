import { useEffect, useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

interface CalendarProps {
    apiUrl: string;
    selectedCategory?: string;
    semesterMonth: Date;
}

const CATEGORY_CLASS_NAMES = {
    "hack-night": "bg-hack-night dark:bg-hack-night text-black",
    workshop: "bg-workshop dark:bg-workshop text-black",
    show: "bg-show dark:bg-show text-black",
    other: "bg-other dark:bg-other text-black",
} as const;

type CategoryKey = keyof typeof CATEGORY_CLASS_NAMES;
type CategoryDates = Record<CategoryKey, Date[]>;

const emptyCategoryDates = (): CategoryDates => ({
    "hack-night": [],
    workshop: [],
    show: [],
    other: [],
});

const defaultClassNames = getDefaultClassNames();
const DAYPICKER_CLASS_NAMES = {
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
    months: `m-0`,
};

export default function Calendar({ apiUrl, selectedCategory = "", semesterMonth = new Date() }: CalendarProps) {
    const [selected, setSelected] = useState<Date>();
    const [month, setMonth] = useState(semesterMonth);

    useEffect(() => {
        setMonth(semesterMonth);
    }, [semesterMonth]);

    const [categoryDates, setCategoryDates] = useState<CategoryDates>(emptyCategoryDates);

    useEffect(() => {
        // One slim request for every event's start date + category: only the
        // selected fields come back (a few KB), instead of full docs per category.
        const fetchDates = async () => {
            const params = new URLSearchParams();
            params.set("sort", "start");
            params.set("depth", "0");
            params.set("pagination", "false");
            params.set("select[start]", "true");
            params.set("select[eventType]", "true");

            const res = await fetch(`${apiUrl}?${params.toString()}`);
            if (!res.ok) return;

            const data = (await res.json()) as {
                docs: { start: string; eventType?: string }[];
            };

            const grouped = emptyCategoryDates();
            for (const doc of data.docs) {
                const cat = (doc.eventType?.toLowerCase() ?? "") as CategoryKey;
                (grouped[cat] ?? grouped.other).push(new Date(doc.start));
            }
            setCategoryDates(grouped);
        };

        void fetchDates();
    }, [apiUrl]);

    const modifiers = useMemo(() => {
        if (!selectedCategory || selectedCategory === "all") {
            return {
                hackNight: categoryDates["hack-night"],
                workshop: categoryDates.workshop,
                show: categoryDates.show,
                other: categoryDates.other,
            };
        }

        return {
            [selectedCategory]: categoryDates[selectedCategory as CategoryKey] ?? [],
        };
    }, [categoryDates, selectedCategory]);

    const modifierClassNames = useMemo(() => {
        if (!selectedCategory || selectedCategory === "all") {
            return {
                hackNight: CATEGORY_CLASS_NAMES["hack-night"],
                workshop: CATEGORY_CLASS_NAMES.workshop,
                show: CATEGORY_CLASS_NAMES.show,
                other: CATEGORY_CLASS_NAMES.other,
            };
        }

        return {
            [selectedCategory]: CATEGORY_CLASS_NAMES[selectedCategory as CategoryKey] ?? CATEGORY_CLASS_NAMES.other,
        };
    }, [selectedCategory]);

    return (
        <div className="w-fit">
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
                classNames={DAYPICKER_CLASS_NAMES}
            />
        </div>
    );
}
