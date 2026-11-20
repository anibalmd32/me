const round = (value: number): number => Math.round(value * 100) / 100;

const notchedEdge = (fromX: number, fromY: number, toX: number, toY: number, notch: number, spacing: number): string => {
  const length = Math.hypot(toX - fromX, toY - fromY);
  const count = Math.max(1, Math.round(length / spacing));
  const step = length / count;
  const unitX = (toX - fromX) / length;
  const unitY = (toY - fromY) / length;
  const segments: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const centre = step * (index + 0.5);
    const enterX = fromX + unitX * (centre - notch);
    const enterY = fromY + unitY * (centre - notch);
    const leaveX = fromX + unitX * (centre + notch);
    const leaveY = fromY + unitY * (centre + notch);
    segments.push(`L ${round(enterX)} ${round(enterY)} A ${notch} ${notch} 0 0 0 ${round(leaveX)} ${round(leaveY)}`);
  }
  segments.push(`L ${round(toX)} ${round(toY)}`);
  return segments.join(' ');
};

export const perforatedRect = (width: number, height: number, notch = 3, spacing = 11): string =>
  [
    'M 0 0',
    notchedEdge(0, 0, width, 0, notch, spacing),
    notchedEdge(width, 0, width, height, notch, spacing),
    notchedEdge(width, height, 0, height, notch, spacing),
    notchedEdge(0, height, 0, 0, notch, spacing),
    'Z',
  ].join(' ');
