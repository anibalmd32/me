export const wrapIndex = (value: number, total: number): number => ((value % total) + total) % total;

export const signedOffset = (index: number, position: number, total: number): number => {
  const raw = wrapIndex(index - position, total);
  return raw >= total / 2 ? raw - total : raw;
};
