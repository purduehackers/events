import { useState, useEffect } from "react";
import { EVENT_CATEGORIES, type EventType } from "@/types";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

interface CalendarProps {
    apiUrl: string;
}

export default function Calendar({ apiUrl }: CalendarProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Date>();
    const [hackNightDates, setHackNightDates] = useState<Date[]>([]);
    const [workshopDates, setWorkshopDates] = useState<Date[]>([]);
    const [showDates, setShowDates] = useState<Date[]>([]);
    const [otherDates, setOtherDates] = useState<Date[]>([]);

    const defaultClassNames = getDefaultClassNames();

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
    }

    useEffect(() => {
        // Fetch dates for all categories from cms
        const fetchHackNightDates = async () => {
            const hackNightDates = await fetchDates("hack-night");
            setHackNightDates(hackNightDates);
        }
        const fetchWorkshopDates = async () => {
            const workshopDates = await fetchDates("workshop");
            setWorkshopDates(workshopDates);
        }
        const fetchShowDates = async () => {
            const showDates = await fetchDates("show");
            setShowDates(showDates);
        }
        const fetchOtherDates = async () => {
            const otherDates = await fetchDates("other");
            setOtherDates(otherDates);
        }

        fetchHackNightDates();
        fetchWorkshopDates();
        fetchShowDates();
        fetchOtherDates();
        console.log(hackNightDates)
    }, [apiUrl]);

    return (
        <div>
            <div className="hidden bg-hack-night bg-workshop bg-show bg-other"></div>
            <DayPicker
                animate
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"
                modifiers={{
                    hackNight: hackNightDates,
                    workshop: workshopDates,
                    show: showDates,
                    other: otherDates
                }}
                // Map to your custom CSS class or Tailwind utility classes
                modifiersClassNames={{
                    hackNight: 'bg-hack-night dark:bg-hack-night text-black',
                    workshop: 'bg-workshop dark:bg-workshop text-black',
                    show: 'bg-show dark:bg-show text-black',
                    other: 'bg-other dark:bg-other text-black'
                }}
                classNames={{
                    root: `${defaultClassNames.root} font-pixel p-0 m-0`, 
                    chevron: `fill-black dark:fill-white`,
                    today: `bg-white text-black`, 
                    selected: `bg-black dark:bg-white text-white dark:text-black`, 
                    
                    day: `w-2 h-2 p-0 m-1 border-solid border-zinc-400 dark:border-zinc-300 border-1 rounded-none`,
                    week: `p-0`,
                    month: `p-0`
                }}
            />
        </div>
    );
}