import { clamp01 } from './progress-math';

const marks = [...document.querySelectorAll<HTMLElement>('[data-scroll-mark]')].flatMap((mark) => {
  const page = mark.closest<HTMLElement>('[data-page]');
  return page ? [{ mark, page }] : [];
});

export const updateScrollMarks = (): void => {
  for (const { mark, page } of marks) {
    const inked = clamp01(1 - page.getBoundingClientRect().top / window.innerHeight);
    mark.style.setProperty('--inked', inked.toFixed(4));
  }
};
