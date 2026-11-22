import type { FigureShape, FigureSize } from './types';

export const phoneShape = ({ width, height }: FigureSize): FigureShape => ({
  width,
  height,
  markup:
    `<rect class="fs" x="2" y="2" width="${width - 4}" height="${height - 4}" rx="18"/>` +
    `<rect class="fdot" x="${width / 2 - 16}" y="12" width="32" height="5" rx="2.5"/>` +
    `<rect class="fdot" x="${width / 2 - 20}" y="${height - 16}" width="40" height="4" rx="2"/>`,
  content: { top: 34, right: 14, bottom: 30, left: 18 },
  layout: 'column',
});
