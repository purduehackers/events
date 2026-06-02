import { useEffect, useState } from "react";
import ThemeButton from "./ThemeButton";
import { GliderIcon } from "./icons/Icons";

const SCROLL_THRESHOLD = 1;

export default function Navbar() {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setCurrentPath(window.location.pathname);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(() => {
                setScrolled(window.scrollY > SCROLL_THRESHOLD);
                rafId = null;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
        };
    }, []);

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/"; // Fallback to home page if no history
        }
    };

    return (
        <nav
            className="fixed top-0 z-100 w-full h-8 flex justify-between items-center transition-[background-color] duration-500 bg-transparent data-[scrolled=true]:bg-purple-700 data-[scrolled=true]:dark:bg-purple-700 text-black dark:text-white data-[scrolled=true]:text-white"
            data-scrolled={scrolled ? "true" : "false"}
        >
            <div className="w-full px-2 md:px-3 mx-auto flex justify-between items-center sm:grid sm:grid-cols-3">
                {currentPath.length > 1 ? (
                    <button
                        type="button"
                        onClick={() => handleBack()}
                        className="cursor-pointer justify-self-start flex items-center gap-x-2 uppercase text-sm font-pixel"
                    >
                        <span className="hidden w-4 h-4" aria-hidden="true" /> {'<<'} <span>All Events</span>
                    </button>
                ) : (
                    <a className="h-fit self-center justify-self-start" href="https://purduehackers.com" target="_blank" rel="noreferrer">
                        <GliderIcon className="w-4 h-4" aria-hidden="true" />
                    </a>
                )}

                <div className="flex gap-2 justify-center">
                    <a href="https://purduehackers.com" target="_blank" rel="noreferrer">
                        <button
                            type="button"
                            data-scrolled={scrolled ? "true" : "false"}
                            className="cursor-pointer px-2 uppercase text-sm font-pixel font-normal text-black/80 dark:text-white/85 data-[scrolled=true]:text-white bg-transparent border-1 border-black/80 dark:border-white/85 data-[scrolled=true]:border-white rounded-sm"
                        >
                            Learn more
                        </button>
                    </a>
                    <a href="https://discord.com/invite/5paFjKzdPE" target="_blank" rel="noreferrer">
                        <button
                            type="button"
                            data-scrolled={scrolled ? "true" : "false"}
                            className="cursor-pointer px-2 uppercase text-sm font-pixel font-normal text-white dark:text-black data-[scrolled=true]:text-purple-700 bg-black/80 dark:bg-white/85 data-[scrolled=true]:bg-white rounded-sm"
                        >
                            Join us
                        </button>
                    </a>
                </div>

                <div className="h-fit self-center justify-self-end">
                    <div className="hover:animate-idle-icon">
                        <ThemeButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
