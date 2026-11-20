/**
 * Regenerates the PNG icons from public/favicon.svg.
 * Run once after changing the mark:  node scripts/icons.mjs
 */
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile('public/favicon.svg');
const paper = '#f4efe3';
const render = (size) => sharp(svg, { density: 512 }).resize(size, size);

await render(32).png().toFile('public/favicon-32.png');
await render(192).png().toFile('public/icon-192.png');
await render(512).png().toFile('public/icon-512.png');
// Apple touch icons must be opaque and square: iOS rounds the corners itself.
await render(180).flatten({ background: paper }).png().toFile('public/apple-touch-icon.png');
// Maskable: the mark sits inside the central safe zone.
await sharp({ create: { width: 512, height: 512, channels: 4, background: paper } })
  .composite([{ input: await render(360).png().toBuffer(), gravity: 'centre' }])
  .png()
  .toFile('public/icon-maskable-512.png');

console.log('icons written to public/');
