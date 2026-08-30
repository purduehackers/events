import { decode as decodeJpeg } from "jpeg-js";
import { PNG } from "pngjs";

// Wallet thumbnails must be PNG at 90/180/270px (1x/2x/3x). Cover art in the
// CMS is whatever got uploaded, so this decodes PNG/JPEG in pure JS (no native
// deps in the serverless bundle), center-crops to square, and area-averages
// down. Anything that fails just means a pass without a thumbnail.
interface Raw {
  width: number;
  height: number;
  data: Uint8Array; // RGBA
}

function decodeImage(buf: Buffer): Raw | null {
  try {
    if (buf.length > 4 && buf[0] === 0x89 && buf[1] === 0x50) {
      const png = PNG.sync.read(buf);
      return { width: png.width, height: png.height, data: png.data };
    }
    if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) {
      const jpg = decodeJpeg(buf, { useTArray: true, maxMemoryUsageInMB: 512 });
      return { width: jpg.width, height: jpg.height, data: jpg.data };
    }
  } catch {
    // unsupported or corrupt image
  }
  return null;
}

function squareResize(src: Raw, size: number): Buffer {
  const crop = Math.min(src.width, src.height);
  const offX = Math.floor((src.width - crop) / 2);
  const offY = Math.floor((src.height - crop) / 2);
  const out = new PNG({ width: size, height: size });
  const scale = crop / size;

  for (let y = 0; y < size; y++) {
    const sy0 = offY + Math.floor(y * scale);
    const sy1 = Math.min(offY + crop, Math.max(sy0 + 1, offY + Math.floor((y + 1) * scale)));
    for (let x = 0; x < size; x++) {
      const sx0 = offX + Math.floor(x * scale);
      const sx1 = Math.min(offX + crop, Math.max(sx0 + 1, offX + Math.floor((x + 1) * scale)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * src.width + sx) * 4;
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
          a += src.data[i + 3];
          n++;
        }
      }
      const o = (y * size + x) * 4;
      out.data[o] = r / n;
      out.data[o + 1] = g / n;
      out.data[o + 2] = b / n;
      out.data[o + 3] = a / n;
    }
  }
  return PNG.sync.write(out);
}

export async function buildThumbnails(
  imageUrl: string,
): Promise<Record<string, Buffer> | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15 * 1024 * 1024) return null;
    const raw = decodeImage(buf);
    if (!raw) return null;
    return {
      "thumbnail.png": squareResize(raw, 90),
      "thumbnail@2x.png": squareResize(raw, 180),
      "thumbnail@3x.png": squareResize(raw, 270),
    };
  } catch {
    return null;
  }
}
