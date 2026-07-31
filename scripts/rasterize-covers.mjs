// Rasterizes public/blog/covers/*.svg into 1200x630 og:image PNGs.
// Social crawlers expect a 1.91:1 raster; the 2048x894 cover art is resized
// to 1200 wide and letterboxed on the site navy to fill 630 high.
// Run with: node scripts/rasterize-covers.mjs

import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const NAVY = "#002438";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const coversDir = path.join(scriptDir, "..", "public", "blog", "covers");

async function rasterizeCover(svgFileName) {
  const slug = svgFileName.replace(/\.svg$/, "");
  const pngPath = path.join(coversDir, `${slug}-og.png`);

  const scaled = await sharp(path.join(coversDir, svgFileName))
    .resize({ width: OG_WIDTH })
    .png()
    .toBuffer();
  const { height: scaledHeight } = await sharp(scaled).metadata();
  const padTotal = Math.max(0, OG_HEIGHT - scaledHeight);
  const padTop = Math.floor(padTotal / 2);

  await sharp(scaled)
    .extend({
      top: padTop,
      bottom: padTotal - padTop,
      background: NAVY,
    })
    .png()
    .toFile(pngPath);

  console.log(`Wrote ${path.relative(process.cwd(), pngPath)}`);
}

async function main() {
  const entries = await readdir(coversDir);
  const svgFileNames = entries.filter((entry) => entry.endsWith(".svg"));

  if (svgFileNames.length === 0) {
    console.log(`No SVG covers found in ${coversDir}`);
    return;
  }

  for (const svgFileName of svgFileNames) {
    await rasterizeCover(svgFileName);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
