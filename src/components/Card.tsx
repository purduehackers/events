import type { CSSProperties } from "react";
import { MapPinIcon, StarIcon } from "@/components/icons/Icons";

const CATEGORY_COLORS: Record<string, string> = {
  "hack-night": "pink",
  workshop: "amber",
  show: "green",
  other: "purple-700",
};

function getCategoryColor(category?: string | null) {
  const key = category?.toLowerCase() ?? "other";
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.other;
}

interface CardProps {
  date: string;
  time: string;
  location: string;
  name: string;
  link: string;
  category?: string | null;
}

export default function Card({ date, time, location, name, link, category }: CardProps) {
  const categoryColor = getCategoryColor(category);

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <span className="hidden bg-purple-700 bg-pink bg-blue bg-green bg-amber group-hover:purple-700 group-hover:text-pink group-hover:text-blue group-hover:text-green group-hover:text-amber"></span>
      <a
        className="group col-span-1 h-full flex flex-col items-start justify-between gap-2 text-left px-8 py-5 bg-white dark:bg-(--gray-900) rounded-sm"
        href={link}
      >
        <div className="w-full flex justify-between items-center">
          <p className="uppercase text-gray-500 dark:text-gray-400 text-base font-subtext font-semibold">
            {date} • {time}
          </p>
          <StarIcon className={`w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:animate-idle-icon group-hover:text-${categoryColor} dark:group-hover:text-${categoryColor} group-hover:scale-115 group-hover:-rotate-90 transition-transform`} />
        </div>

        <h3 className="text-xl font-mono font-black">{name}</h3>

        <div className="w-full flex justify-between items-center gap-1">
          {location &&
            <div className="flex gap-2 text-gray-500 dark:text-gray-400 text-base font-subtext font-semibold">
              <MapPinIcon className="w-4" />
              <div className="line-clamp-1">{location}</div>
            </div>
          }
          {category && (
            <div
              className={`min-w-fit px-1 bg-${categoryColor} border border-[0px] uppercase text-white dark:text-black text-[11px] font-mono`}
            >
              {category.replaceAll(" ", "-")} 
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
