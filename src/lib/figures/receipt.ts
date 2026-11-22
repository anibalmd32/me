import { n, range, type FigureShape, type FigureSize } from './types';

const TOOTH = 14;
const TOOTH_DEPTH = 10;

export const receiptShape = ({ width, height }: FigureSize): FigureShape => {
  const teeth = Math.round((width - 4) / TOOTH);
  const toothWidth = (width - 4) / teeth;
  const edge = height - 2 - TOOTH_DEPTH;
  const zigzag = range(teeth)
    .map((index) => {
      const right = width - 2 - toothWidth * index;
      return `L${n(right - toothWidth / 2)} ${height - 2}L${n(right - toothWidth)} ${edge}`;
    })
    .join('');

  return {
    width,
    height,
    markup:
      `<path class="fs" d="M2 2H${width - 2}V${edge}${zigzag}Z"/>` +
      `<path class="fd fdash" d="M18 50h${width - 36}"/>` +
      `<path class="fd" d="M${width - 42} 28a14 14 0 0 1 20 0M${n(width - 37.5)} 33a8 8 0 0 1 11 0"/>` +
      `<circle class="fdot" cx="${width - 32}" cy="38" r="2"/>`,
    content: { top: 14, right: 18, bottom: 26, left: 18 },
    layout: 'column',
    labelHeight: 30,
  };
};
