import { Carousel } from './Carousel';

const canRunIn3d = (): boolean => document.documentElement.classList.contains('motion');

export const initCarousels = (): void => {
  if (!canRunIn3d()) return;
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    if (slides.length > 1) new Carousel(root, slides);
  });
};
