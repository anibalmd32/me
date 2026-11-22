import type { FigureShape, FigureSize } from './types';

const TAIL = 36;

export const bubbleShape = ({ width, height }: FigureSize): FigureShape => {
  const floor = height - TAIL;

  return {
    width,
    height,
    markup: `<path class="fs" d="M18 2H${width - 18}a16 16 0 0 1 16 16V${floor - 16}a16 16 0 0 1-16 16H80L46 ${height - 4}L52 ${floor}H18a16 16 0 0 1-16-16V18A16 16 0 0 1 18 2Z"/>`,
    content: { top: 18, right: 24, bottom: TAIL + 16, left: 24 },
    layout: 'column',
    middle: true,
  };
};
