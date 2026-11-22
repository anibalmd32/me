import type { FigureShape, FigureSize } from './types';

export const toolboxShape = ({ width, height }: FigureSize): FigureShape => ({
  width,
  height,
  markup:
    `<path class="fl" d="M${width / 2 - 36} 40V24a10 10 0 0 1 10-10h52a10 10 0 0 1 10 10v16"/>` +
    `<rect class="fs" x="2" y="40" width="${width - 4}" height="${height - 42}" rx="8"/>` +
    `<path class="fl" d="M2 86h${width - 4}"/>` +
    `<rect class="fs" x="${width / 2 - 12}" y="76" width="24" height="20" rx="3"/>`,
  content: { top: 40, right: 20, bottom: 16, left: 20 },
  layout: 'wrap',
  labelHeight: 46,
});
