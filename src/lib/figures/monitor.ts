import type { FigureShape, FigureSize } from './types';

const STAND = 46;

export const monitorShape = ({ width, height }: FigureSize): FigureShape => {
  const screen = height - STAND;
  const dots = [34, 24, 14].map((fromRight) => `<circle class="fdot" cx="${width - fromRight}" cy="17" r="3"/>`).join('');

  return {
    width,
    height,
    markup:
      `<rect class="fs" x="${width / 2 - 14}" y="${screen - 2}" width="28" height="36"/>` +
      `<rect class="fs" x="${width / 2 - 56}" y="${height - 14}" width="112" height="11" rx="4"/>` +
      `<rect class="fs" x="2" y="2" width="${width - 4}" height="${screen - 2}" rx="8"/>` +
      `<path class="fl" d="M2 32h${width - 4}"/>` +
      dots,
    content: { top: 3, right: 16, bottom: STAND + 10, left: 16 },
    layout: 'grid',
    labelHeight: 29,
  };
};
