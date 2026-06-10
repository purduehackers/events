import { useState } from "react";

import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import "@daypicker/react/style.css";

export default function Calendar() {
    const [selected, setSelected] = useState<Date>();

    const defaultClassNames = getDefaultClassNames();

    const holidayDates = [
        new Date(2026, 5, 18),
        new Date(2026, 5, 1)
        ];

    return (
        <div>
            <DayPicker
                animate
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"
                modifiers={{
                    holiday: holidayDates
                }}
                // Map to your custom CSS class or Tailwind utility classes
                modifiersClassNames={{
                    holiday: 'bg-yellow text-black' 
                }}
                classNames={{today: `border-amber-500`, // Add a border to today's date
                    selected: `bg-amber-500 border-amber-500 text-white`, // Highlight the selected day
                    root: `${defaultClassNames.root} font-pixel p-5`, // Add a shadow to the root element
                    chevron: `${defaultClassNames.chevron} fill-amber-500`, // Change the color of the chevron
                }}
            />
            <div>Selected: {selected?.toLocaleDateString()}</div>
        </div>
    );
}