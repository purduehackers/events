const DEFAULT_WIDTHS = [400, 800, 1200, 1600];
const DEFAULT_QUALITY = 75;

function encodeUrl(url: string): string {
  return encodeURIComponent(url);
}

/**
 * Wraps a remote image URL through Vercel's on-the-fly image optimizer.
 * The source hostname must be allow-listed in `imagesConfig.domains`
 * (see astro.config.mjs). Non-remote URLs are returned unchanged.
 */
export function optimizedUrl(url: string, width: number, quality = DEFAULT_QUALITY): string {
  if (!url.startsWith("http")) return url;
  return `/_vercel/image?url=${encodeUrl(url)}&w=${width}&q=${quality}`;
}

export function optimizedSrcset(
  url: string,
  widths: number[] = DEFAULT_WIDTHS,
  quality = DEFAULT_QUALITY,
): string {
  if (!url.startsWith("http")) return url;
  return widths.map((w) => `${optimizedUrl(url, w, quality)} ${w}w`).join(", ");
}
