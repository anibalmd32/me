import { n, range, type FigureShape, type FigureSize } from './types';

const PINS_ACROSS = 7;
const PINS_DOWN = 4;

export const chipShape = ({ width, height }: FigureSize): FigureShape => {
  const across = range(PINS_ACROSS)
    .map((index) => {
      const x = n(44 + (index * (width - 88)) / (PINS_ACROSS - 1));
      return `M${x} 6v14M${x} ${height - 20}v14`;
    })
    .join('');
  const down = range(PINS_DOWN)
    .map((index) => {
      const y = n(48 + (index * (height - 96)) / (PINS_DOWN - 1));
      return `M6 ${y}h14M${width - 20} ${y}h14`;
    })
    .join('');

  return {
    width,
    height,
    markup:
      `<path class="fl" d="${across}${down}"/>` +
      `<rect class="fs" x="20" y="20" width="${width - 40}" height="${height - 40}" rx="10"/>` +
      '<circle class="fdot" cx="38" cy="38" r="3"/>',
    content: { top: 40, right: 34, bottom: 36, left: 50 },
    layout: 'column',
    middle: true,
  };
};
