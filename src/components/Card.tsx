import { MapPinIcon, StarIcon } from "@/components/icons/Icons";

interface CardProps {
  date: string;
  time: string;
  location: string;
  name: string;
  link: string;
  category?: string | null;
}

export default function Card({ date, time, location, name, link, category }: CardProps) {
  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <a
        className="group col-span-1 h-full flex flex-col items-start justify-between gap-2 text-left px-8 py-5 bg-white dark:bg-(--gray-900) rounded-sm"
        href={link}
      >
        <div className="w-full flex justify-between items-center">
          <p className="uppercase text-gray-500 dark:text-gray-400 text-base font-subtext font-semibold">
            {date} • {time}
          </p>
          <StarIcon className="w-4 h-4 text-yellow dark:text-yellow group-hover:animate-idle-icon group-hover:text-purple-700 dark:group-hover:text-purple-400 group-hover:scale-115 group-hover:-rotate-90 transition-transform" />
        </div>

        <h3 className="text-xl font-mono font-black">{name}</h3>

        <div className="w-full flex justify-between items-center gap-1">
          <div className="flex gap-2 text-gray-500 dark:text-gray-400 text-base font-subtext font-semibold">
            <MapPinIcon className="w-4" />
            <div className="line-clamp-1">{location}</div>
          </div>
          {category && (
            <div className="min-w-fit px-0.5 bg-gray-600 text-white uppercase text-[11px] font-mono">
              {category}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
