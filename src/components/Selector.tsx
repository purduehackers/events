
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@radix-ui/react-select";
import { SquareIcon } from "./icons/Icons";

const itemClassName =
  "relative select-none flex items-center rounded-xs py-1.5 px-6 text-[13px] leading-none text-gray-900 dark:text-gray-100 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500";

export interface SelectorOption {
  value: string;
  label: string;
}

export interface SelectorProps {
  options: SelectorOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  ariaLabel?: string;
  className?: string;
}

const Selector = ({
  options,
  onValueChange,
  placeholder = "Select…",
  value,
  defaultValue,
  ariaLabel = "Select option",
  className = "",
}: SelectorProps) => {
    const [open, setOpen] = useState(false); // whether selectPortal is displayed

    const handleClear = () => {
        onValueChange("");
        setOpen(false);
    };

    return (
        <div>
        <Select
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger
                className={`group ${className} cursor-pointer select-none inline-flex w-37 px-2 py-1 items-center justify-between gap-1 rounded border-0 border-black dark:border-white font-pixel uppercase text-[15px] leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400`}
                aria-label={ariaLabel}
            >
                <SelectValue placeholder={placeholder} />
                <SelectIcon className="ml-2 h-2 flex items-center justify-center leading-none text-sm text-gray-600 dark:text-gray-400 transition-transform -rotate-0 group-data-[state=open]:rotate-90">
                    {'>'}
                </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent
                    className="z-[100] cursor-pointer overflow-hidden bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-pixel uppercase text-[15px]"
                    position="popper"
                    sideOffset={4}
                >
                    <SelectScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        
                    </SelectScrollUpButton>
                    <SelectViewport className="p-1">
                        <SelectGroup>
                            {value && ( 
                                <button 
                                    className={`${itemClassName} cursor-pointer hover:bg-purple-400 w-full`}
                                    onClick={handleClear}
                                >
                                    -- Clear --
                                </button>
                            )}
                            {options.map((opt) => (
                                <SelectItem 
                                    key={opt.value} 
                                    value={opt.value} 
                                    className={itemClassName}
                                >
                                    <SelectItemText>{opt.label}</SelectItemText>
                                    <SelectItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center">
                                        <SquareIcon className="w-2 h-2" strokeWidth={0} />
                                    </SelectItemIndicator>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectViewport>
                    <SelectScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        
                    </SelectScrollDownButton>
                </SelectContent>
            </SelectPortal>
        </Select>
        </div>
    );
};

export default Selector;
