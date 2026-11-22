export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const remap = (value: number, from: number, to: number): number => clamp01((value - from) / (to - from));

export const smooth = (t: number): number => t * t * (3 - 2 * t);

export const plateau = (t: number, stops: number, rest = 0.36): number => {
  const moves = stops - 1;
  if (moves < 1) return 0;
  const segment = 1 / moves;
  const index = Math.min(moves - 1, Math.floor(t / segment));
  const local = (t - index * segment) / segment;
  return (index + smooth(remap(local, rest / 2, 1 - rest / 2))) / moves;
};
