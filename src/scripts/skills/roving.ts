const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

const targetIndex = (key: string, current: number, total: number): number | null => {
  if (NEXT_KEYS.has(key)) return (current + 1) % total;
  if (PREVIOUS_KEYS.has(key)) return (current - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
};

export const bindRovingFocus = (items: HTMLElement[]): void => {
  if (items.length === 0) return;

  const makeTabStop = (active: HTMLElement): void => {
    items.forEach((item) => item.setAttribute('tabindex', item === active ? '0' : '-1'));
  };

  makeTabStop(items[0]!);

  items.forEach((item, index) => {
    item.addEventListener('focus', () => makeTabStop(item));
    item.addEventListener('keydown', (event) => {
      const next = targetIndex(event.key, index, items.length);
      if (next === null) return;
      event.preventDefault();
      items[next]?.focus();
    });
  });
};
