
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
  triggerStyle?: string;
  portalStyle?: string;
  itemStyle?: string;
}

const Selector = ({
  options,
  onValueChange,
  placeholder = "Select…",
  value,
  defaultValue,
  ariaLabel = "Select option",
  triggerStyle = "px-2 py-1 gap-1 font-mono uppercase text-sm leading-none text-gray-900 dark:text-gray-100 data-[placeholder]:bg-transparent data-[placeholder]:text-gray-400",
  portalStyle = "bg-body-light dark:bg-body-dark border border-zinc-200 dark:border-zinc-700 font-mono uppercase",
  itemStyle = "relative select-none flex items-center py-2 px-6 text-sm leading-none text-gray-900 dark:text-gray-100 data-[highlighted]:bg-purple-400 data-[highlighted]:text-white data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-500",
}: SelectorProps) => {
    const [open, setOpen] = useState(false);

    const handleClear = () => {
        onValueChange("");
        setOpen(false);
    };

    return (
        <div className="relative">
        <Select
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger
                className={`group ${triggerStyle} items-center justify-between cursor-pointer select-none inline-flex`}
                aria-label={ariaLabel}
            >
                <SelectValue placeholder={placeholder} />
                <SelectIcon className="ml-2 h-2 flex items-center justify-center leading-none text-sm transition-transform -rotate-0 group-data-[state=open]:rotate-90">
                    {'>'}
                </SelectIcon>
            </SelectTrigger>
            <SelectPortal container={typeof document !== "undefined" ? document.body : undefined}>
                <SelectContent
                    className={`${portalStyle} z-50 cursor-pointer overflow-hidden`}
                    position="popper"
                    sideOffset={12}
                    alignOffset={-10}
                >
                    <SelectScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        
                    </SelectScrollUpButton>
                    <SelectViewport className="p-0">
                        <SelectGroup>
                            {value && ( 
                                <button 
                                    className={`${itemStyle} cursor-pointer hover:bg-purple-400 w-full uppercase`}
                                    onClick={handleClear}
                                >
                                    -- Clear --
                                </button>
                            )}
                            {options.map((opt) => (
                                <SelectItem 
                                    key={opt.value} 
                                    value={opt.value} 
                                    className={itemStyle}
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
