import { useEffect, useState, useRef } from "react";
import { MapPinIcon, SquareIcon, StarIcon } from "@/components/icons/Icons";
import { EVENT_CATEGORIES } from "@/types";
import placeholderThumbnail from "@/assets/placeholder-thumbnail.avif";

function getCategoryColor(category?: string | null): string {
  return EVENT_CATEGORIES.includes(category?.toLowerCase() ?? "") ? (category?.toLowerCase() ?? "other") : "other";
}

function getCategoryBadgeClasses(categoryColor: string) {
  switch (categoryColor) {
    case "hack-night":
      return "bg-black text-white dark:bg-transparent dark:text-hack-night";
    case "workshop":
      return "bg-workshop text-white dark:bg-transparent dark:text-workshop";
    case "show":
      return "bg-show text-white dark:bg-transparent dark:text-show";
    default:
      return "bg-other text-white dark:bg-transparent dark:text-other";
  }
}

function getCategoryIconClasses(categoryColor: string) {
  switch (categoryColor) {
    case "hack-night":
      return "group-hover:text-black dark:group-hover:text-hack-night";
    case "workshop":
      return "group-hover:text-workshop";
    case "show":
      return "group-hover:text-show";
    default:
      return "group-hover:text-other";
  }
}

interface CardProps {
  date: string;
  time: string;
  location: string;
  name: string;
  link: string;
  category?: string | null;
}

interface ListCardProps extends CardProps {
  image?: string | null;
}

export default function Card({ date, time, location, name, link, category }: CardProps) {
  const categoryColor = getCategoryColor(category);

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <span className="hidden dark:text-hack-night dark:text-workshop dark:text-show dark:text-other bg-hack-night bg-workshop bg-show bg-other dark:group-hover:text-hack-night group-hover:text-hack-night group-hover:text-workshop group-hover:text-show group-hover:text-other group-hover:text-black group-hover:border-hack-night group-hover:border-workshop group-hover:border-show group-hover:border-other"></span>
      <a
        className={`group col-span-1 h-full flex flex-col items-start justify-between gap-2 text-left px-6 2xl:px-8 py-5 bg-card-light dark:bg-(--gray-900) border border-[1px] border-white dark:border-zinc-700 rounded-none`}
        href={link}
      >
        <div className="w-full flex justify-between items-start">
          <div className="uppercase text-gray-500 dark:text-gray-400 text-base sm:text-[15px] font-subtext font-semibold leading-none">
            {date} • {time}
          </div>
          <StarIcon className={`block sm:block w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:animate-idle-icon dark:group-hover:text-${categoryColor} group-hover:text-${categoryColor == "hack-night" ? "black" : categoryColor} group-hover:scale-115 group-hover:-rotate-90 transition-transform`} />
        </div>

        <h3 className="text-lg 2xl:text-xl font-mono font-black leading-tight">{name}</h3>

        <div className="w-full flex justify-between items-center gap-1">
          {location &&
            <div className="flex gap-2 text-gray-500 dark:text-gray-400 text-[15px] font-subtext font-semibold leading-none">
              <MapPinIcon className="w-3" />
              <div className="line-clamp-1">{location}</div>
            </div>
          }
          {category && (
            <div
              className={`min-w-fit rounded-xs px-1 bg-${categoryColor == "hack-night" ? "black" : categoryColor} dark:bg-transparent text-white dark:text-${categoryColor} border-none dark:border-solid border-[1px] uppercase text-[12px] font-pixel`}
            >
              {category.replaceAll(" ", "-")} 
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

export function ListCard({ date, time, location, name, link, category, image = placeholderThumbnail.src }: ListCardProps) {
  const categoryColor = getCategoryColor(category);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const resolvedImage = image?.trim() ? image : placeholderThumbnail.src;

  const imgRef = useRef(null);

  useEffect(() => {
    setIsImageLoaded(true);
  }, [image]);

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <a
        className="group flex h-35 w-full flex-row items-stretch overflow-hidden border border-[1px] border-white bg-card-light text-left dark:border-zinc-700 dark:bg-(--gray-900)"
        href={link}
      >
        <div className="relative aspect-square w-28 shrink-0 sm:w-fit p-4 sm:p-5">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-200/80 dark:bg-zinc-800/80">
              <svg className="h-8 w-8 animate-spin text-zinc-500" viewBox="0 0 24 24" aria-hidden="true">
                <SquareIcon className="w-6 h-6 text-gray-300" strokeWidth={2} />
              </svg>
            </div>
          )}
          <img
            ref={imgRef}
            alt={`${name} thumbnail`}
            className={`h-full w-full object-cover transition-opacity duration-200 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            decoding="async"
            loading="lazy"
            onError={() => setIsImageLoaded(true)}
            onLoad={() => setIsImageLoaded(true)}
            src={resolvedImage}
          />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-subtext font-semibold uppercase text-gray-500 dark:text-gray-400">
                {date} • {time}
              </p>
              <h3 className="mt-1 text-lg sm:text-xl font-mono font-black leading-tight">{name}</h3>
            </div>
            <StarIcon className={`w-3.5 h-3.5 shrink-0 text-zinc-500 transition-transform group-hover:animate-idle-icon group-hover:scale-115 group-hover:-rotate-90 dark:text-zinc-400 ${getCategoryIconClasses(categoryColor)}`} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {location && (
              <div className="flex items-center gap-2 text-[15px] font-subtext font-semibold text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-3.5 shrink-0" />
                <div className="line-clamp-1">{location}</div>
              </div>
            )}
            {category && (
              <div className={`min-w-fit rounded-sm px-1 py-0.5 text-[12px] font-pixel uppercase ${getCategoryBadgeClasses(categoryColor)}`}>
                {category.replaceAll(" ", "-")}
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}

export function CardOld({ date, time, location, name, link, category }: CardProps) {
  const categoryColor = getCategoryColor(category);

  return (
    <div data-category={category?.toLowerCase() ?? ""}>
      <span className="hidden bg-purple-400 bg-pink bg-blue bg-green bg-amber group-hover:purple-400 group-hover:text-pink group-hover:text-blue group-hover:text-green group-hover:text-amber"></span>
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