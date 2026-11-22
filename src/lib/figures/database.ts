import { n, range, type FigureShape, type FigureSize } from './types';

const RY = 16;
const TOP = 2;

export const databaseShape = ({ width, height }: FigureSize, discs: number): FigureShape => {
  const rx = (width - 4) / 2;
  const rim = TOP + RY;
  const base = height - 2 - RY;
  const disc = (base - rim) / discs;
  const frontArc = (y: number): string => `M2 ${n(y)}A${rx} ${RY} 0 0 0 ${width - 2} ${n(y)}`;
  const seams = range(discs - 1)
    .map((index) => frontArc(rim + disc * (index + 1)))
    .join('');

  return {
    width,
    height,
    markup:
      `<path class="fs" d="M2 ${rim}V${base}A${rx} ${RY} 0 0 0 ${width - 2} ${base}V${rim}"/>` +
      `<ellipse class="fs" cx="${width / 2}" cy="${rim}" rx="${rx}" ry="${RY}"/>` +
      `<path class="fl" d="${seams}"/>`,
    content: { top: TOP, right: 20, bottom: 2, left: 20 },
    layout: 'rows',
    labelHeight: RY * 2,
    rowHeight: disc,
    centered: true,
  };
};
