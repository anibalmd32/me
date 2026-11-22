import { n, range, type FigureShape, type FigureSize } from './types';

const TOP = 2;
const FEET = 12;

export const serverShape = ({ width, height }: FigureSize, units: number): FigureShape => {
  const unit = (height - TOP - FEET) / (units + 1);
  const floor = height - FEET;
  const dividers = range(units)
    .map((index) => `M2 ${n(TOP + unit * (index + 1))}H${width - 2}`)
    .join('');
  const fronts = range(units)
    .map((index) => {
      const middle = TOP + unit * (index + 1.5);
      const vents = [24, 19, 14].map((fromRight) => `M${width - fromRight} ${n(middle - 6)}v12`).join('');
      return (
        `<circle class="fled" cx="${width - 48}" cy="${n(middle)}" r="3"/>` +
        `<circle class="fdot" cx="${width - 36}" cy="${n(middle)}" r="3"/>` +
        `<path class="fd" d="${vents}"/>`
      );
    })
    .join('');

  return {
    width,
    height,
    markup:
      `<path class="fl" d="M30 ${floor}v9h26v-9M${width - 56} ${floor}v9h26v-9"/>` +
      `<rect class="fs" x="2" y="${TOP}" width="${width - 4}" height="${floor - TOP}" rx="8"/>` +
      `<path class="fl" d="${dividers}"/>` +
      fronts,
    content: { top: TOP, right: 60, bottom: FEET, left: 16 },
    layout: 'rows',
    labelHeight: unit,
    rowHeight: unit,
  };
};
