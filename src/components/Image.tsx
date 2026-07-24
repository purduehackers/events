import { useEffect, useState } from "react";

import { SquareIcon } from "./icons/Icons";
import placeholderThumbnail from "@/assets/placeholder-thumbnail.avif";

interface ImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function Image({ src = placeholderThumbnail.src, alt, className = "h-full w-full" }: ImageProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const resolvedImage = src?.trim() ?? placeholderThumbnail.src;

    useEffect(() => {
        setIsImageLoaded(true);
    }, [src]);

    if (!isImageLoaded) {
        return (
            <div className={`${className} flex items-center justify-center bg-zinc-200/80 dark:bg-zinc-800/80`}>
                <SquareIcon className="w-6 h-6 m-auto animate-spin text-gray-300" strokeWidth={2} />
            </div>
        );
    }
    return (
            <img
                src={resolvedImage}
                alt={alt}
                className={`${className} object-cover transition-opacity duration-200 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                decoding="async"
                loading="lazy"
                onError={() => setIsImageLoaded(true)}
                onLoad={() => setIsImageLoaded(true)}
            />
    );
}