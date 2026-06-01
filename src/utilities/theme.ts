/**
 * Theme utilities for managing dark/light mode
 */

export function getTheme() {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: string) {
    if (typeof document === "undefined") return;
    if (theme === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
    }
}
