import { useMemo } from "react";
import Selector, { type SelectorOption } from "@/components/Selector";
import { setUrlFilter, useUrlFilters } from "@/utilities/useUrlFilters";

interface CategoryFilterProps {
  categories: string[];
  triggerStyle?: string;
  portalStyle?: string;
  itemStyle?: string;
}

export default function CategoryFilter({ categories, triggerStyle, portalStyle, itemStyle }: CategoryFilterProps) {
  const options: SelectorOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(categories.filter(Boolean).map((c) => c.toLowerCase()))
    );

    const optionList: SelectorOption[] = uniqueCategories.map((value) => ({
      value,
      label: value
        .split(/[-\s]/)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" "),
    }));

    if (!optionList.some((o) => o.value === "other")) {
      optionList.push({ value: "other", label: "Other" });
    }

    return optionList;
  }, [categories]);

  const { category } = useUrlFilters();
  const value = options.some((o) => o.value === category) ? category : "";

  const onValueChange = (newValue: string) => {
    setUrlFilter("cat", newValue);
  };

  return (
    <Selector
      options={options}
      onValueChange={onValueChange}
      placeholder="Category"
      value={value}
      ariaLabel="Filter events by category"
      triggerStyle={triggerStyle? triggerStyle : "w-36 px-2 py-1 gap-1 font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400"}
      portalStyle={portalStyle? portalStyle : "bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-pixel uppercase"}
      itemStyle={itemStyle? itemStyle : "relative select-none flex items-center py-2 px-6 text-[15px] leading-none text-gray-900 dark:text-gray-100 hover:bg-purple-400 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500"}
    />
  );
}
