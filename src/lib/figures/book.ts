import { range, type FigureShape, type FigureSize } from './types';

const BITS = '0110100101101001';
const DIGIT_STEP = 16;

export const bookShape = ({ width, height }: FigureSize): FigureShape => {
  const digits = Math.floor((height - 46) / DIGIT_STEP);
  const spine = range(digits)
    .map((index) => `<text class="fbin" x="17" y="${30 + index * DIGIT_STEP}" text-anchor="middle">${BITS[index % BITS.length]}</text>`)
    .join('');

  return {
    width,
    height,
    markup:
      `<rect class="fs" x="12" y="10" width="${width - 16}" height="${height - 14}" rx="6"/>` +
      `<path class="fd" d="M${width - 12} 18v${height - 30}M${width - 8} 18v${height - 30}"/>` +
      `<rect class="fs" x="4" y="4" width="${width - 20}" height="${height - 16}" rx="6"/>` +
      `<path class="fl" d="M30 4v${height - 16}"/>` +
      spine +
      `<text class="fbin" x="44" y="${height - 26}">0110 1001 0101 1100</text>`,
    content: { top: 22, right: 28, bottom: 40, left: 44 },
    layout: 'column',
  };
};
