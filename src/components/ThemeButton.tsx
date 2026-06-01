import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons/Icons";
import { getTheme, applyTheme } from "@/utilities/theme";

export default function ThemeButton() {
    const [theme, setThemeState] = useState<string>("light");

    useEffect(() => {
        const currentTheme = getTheme();
        setThemeState(currentTheme);

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handleMediaChange = () => {
            const nextTheme = getTheme();
            applyTheme(nextTheme);
            setThemeState(nextTheme);
        };

        media.addEventListener("change", handleMediaChange);
        return () => media.removeEventListener("change", handleMediaChange);
    }, []);

    const handleToggle = () => {
        const nextTheme = getTheme() === "dark" ? "light" : "dark";
        window.localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme);
        setThemeState(nextTheme);
    };

    const handleReset = () => {
        window.localStorage.removeItem("theme");
        const nextTheme = getTheme();
        applyTheme(nextTheme);
        setThemeState(nextTheme);
    };

    return (
        <button
            type="button"
            id="theme-selector"
            onClick={handleToggle}
            onAuxClick={handleReset}
            className="p-0 cursor-pointer"
            aria-label={`Enable ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <span className="sr-only">
                Enable <span className="dark:hidden">light</span>
                <span className="hidden dark:inline">dark</span> mode
            </span>
            <SunIcon className="inline dark:hidden w-4.5 h-4.5 text-inherit" />
            <MoonIcon className="hidden dark:inline w-4 h-4 text-inherit -rotate-5" />
        </button>
    );
}