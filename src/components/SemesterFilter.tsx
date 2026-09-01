import { useMemo } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";
import type { SemesterType } from "@/types";
import { setUrlFilter, useUrlFilters } from "@/utilities/useUrlFilters";

interface SemesterFilterProps {
  semesters: SemesterType[];
  triggerStyle?: string;
  portalStyle?: string;
  itemStyle?: string;
}

export default function SemesterFilter({ semesters, triggerStyle, portalStyle, itemStyle }: SemesterFilterProps) {
  // Get semester options (formatted w value and label)
  const options: SelectorOption[] = useMemo(
    () =>
      semesters.map((s) => ({
        value: `${s.season}-${s.year}`,
        label: `${s.season} ${s.year}`,
      })),
    [semesters],
  );

  const { semester } = useUrlFilters();
  const value = semester ? `${semester.season}-${semester.year}` : "";

  const onValueChange = (newValue: string) => {
    setUrlFilter("sem", newValue);
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Semester"
      value={value}
      ariaLabel="Filter past events by semester"
      triggerStyle={triggerStyle? triggerStyle : "w-fit sm:w-36 min-w-0 px-2 py-2.5 sm:py-1 gap-1 whitespace-nowrap font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400"}
      portalStyle={portalStyle? portalStyle : "bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-pixel uppercase"}
      itemStyle={itemStyle? itemStyle : "relative select-none flex items-center py-2 px-6 text-[15px] leading-none text-gray-900 dark:text-gray-100 hover:bg-purple-400 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500"}
    />
  );
}
