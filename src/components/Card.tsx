import {
  getCategoryColor,
  getCategoryBadgeClasses,
  getCategoryIconClasses,
  getCategorySlug,
} from "@/utilities/helpers";
import { MapPinIcon, StarIcon } from "@/components/icons/Icons";
import placeholderThumbnail from "@/assets/placeholder-thumbnail.avif";

interface CardProps {
  date: string;
  time?: string;
  location: string;
  name: string;
  link: string;
  category?: string | null;
}

interface ListCardProps extends CardProps {
  image?: string | null;
  startTime: string;
  endTime?: string;
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <div
      className={`min-w-fit rounded-xs px-1 border-none dark:border-solid border-[1px] uppercase text-[12px] font-pixel ${getCategoryBadgeClasses(getCategoryColor(category))}`}
    >
      {getCategorySlug(category)}
    </div>
  );
}

export default function Card({
  date,
  time,
  location,
  name,
  link,
  category,
}: CardProps) {
  const categoryColor = getCategoryColor(category);

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <a
        className="group col-span-1 h-full flex flex-col items-start justify-between gap-2 text-left px-6 2xl:px-8 py-5 bg-card-light dark:bg-(--gray-900) border border-[1px] border-white dark:border-zinc-700 rounded-none transition-[border-color,transform] duration-150 ease-snappy hover:border-zinc-300 dark:hover:border-zinc-500 active:scale-[0.99]"
        href={link}
      >
        <div className="w-full flex justify-between items-start">
          <div className="uppercase text-gray-500 dark:text-gray-400 text-base sm:text-[15px] font-subtext font-semibold leading-none">
            {date} • {time}
          </div>
          <StarIcon
            className={`block sm:block w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:animate-idle-icon group-hover:scale-115 group-hover:-rotate-90 transition-transform ${getCategoryIconClasses(categoryColor)}`}
          />
        </div>

        <h3 className="text-lg 2xl:text-xl font-mono font-black leading-tight">
          {name}
        </h3>

        <div className="w-full flex justify-between items-center gap-1">
          {location && (
            <div className="flex gap-2 text-gray-500 dark:text-gray-400 text-[15px] font-subtext font-semibold leading-none">
              <MapPinIcon className="w-3" />
              <div className="line-clamp-1">{location}</div>
            </div>
          )}
          {category && <CategoryBadge category={category} />}
        </div>
      </a>
    </div>
  );
}

export function ListCard({
  date,
  startTime,
  endTime,
  location,
  name,
  link,
  category,
  image = placeholderThumbnail.src,
}: ListCardProps) {
  const categoryColor = getCategoryColor(category);
  const resolvedImage = image?.trim() ? image : placeholderThumbnail.src;

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <a
        className="group flex min-h-fit w-full p-3 sm:p-5 flex-row items-stretch gap-4 sm:gap-8 overflow-hidden border border-[1px] border-white bg-card-light text-left dark:border-zinc-700 dark:bg-(--gray-900) transition-[border-color,transform] duration-150 ease-snappy hover:border-zinc-300 dark:hover:border-zinc-500 active:scale-[0.99]"
        href={link}
      >
        {/* The wrapper background shows through while the image loads */}
        <div className="size-24 bg-zinc-200/80 dark:bg-zinc-800/80">
          <img
            alt={`${name} thumbnail`}
            className="h-full w-full object-cover"
            decoding="async"
            loading="lazy"
            width={96}
            height={96}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderThumbnail.src;
            }}
            src={resolvedImage}
          />
        </div>

        {/* Right: Event details */}
        <div className="flex flex-1 flex-col justify-between gap-1 sm:gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-subtext font-semibold uppercase text-gray-500 dark:text-gray-400">
                {date} • {startTime}
                <span className="hidden sm:inline">
                  {endTime ? ` - ${endTime}` : ""}
                </span>
              </p>
              <h3 className="mt-1 text-lg sm:text-xl font-mono font-black leading-tight">
                {name}
              </h3>
            </div>
            <StarIcon
              className={`w-3.5 h-3.5 shrink-0 text-zinc-500 transition-transform group-hover:animate-idle-icon group-hover:scale-115 group-hover:-rotate-90 dark:text-zinc-400 ${getCategoryIconClasses(categoryColor)}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
            {location && (
              <div className="flex items-center gap-2 text-[15px] font-subtext font-semibold text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-3.5 shrink-0" />
                <div className="line-clamp-1">{location}</div>
              </div>
            )}
            {category && <CategoryBadge category={category} />}
          </div>
        </div>
      </a>
    </div>
  );
}
