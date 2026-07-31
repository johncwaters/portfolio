// Rasterizes public/blog/covers/*.svg into 2048x894 PNGs for og:image use.
// Run with: node scripts/rasterize-covers.mjs

import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const COVER_WIDTH = 2048;
const COVER_HEIGHT = 894;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const coversDir = path.join(scriptDir, "..", "public", "blog", "covers");

async function rasterizeCover(svgFileName) {
  const slug = svgFileName.replace(/\.svg$/, "");
  const svgPath = path.join(coversDir, svgFileName);
  const pngPath = path.join(coversDir, `${slug}.png`);

  await sharp(svgPath)
    .resize(COVER_WIDTH, COVER_HEIGHT)
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
