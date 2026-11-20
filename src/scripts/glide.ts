const root = document.documentElement;
const GLIDING_CLASS = 'is-gliding';
const LONGEST_GLIDE_MS = 1600;

let fallbackTimer = 0;

const endGlide = (): void => {
  window.clearTimeout(fallbackTimer);
  root.classList.remove(GLIDING_CLASS);
};

export const startGlide = (): void => {
  if (!root.classList.contains('motion')) return;
  window.clearTimeout(fallbackTimer);
  root.classList.add(GLIDING_CLASS);
  fallbackTimer = window.setTimeout(endGlide, LONGEST_GLIDE_MS);
};

const pointsInsideThisPage = (link: HTMLAnchorElement): boolean => {
  const url = new URL(link.href, location.href);
  const samePage = url.origin === location.origin && url.pathname === location.pathname && url.search === location.search;
  return samePage && url.hash.length > 1;
};

const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export const initGlide = (): void => {
  document.addEventListener('click', (event) => {
    if (!isPlainClick(event)) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (link && pointsInsideThisPage(link)) startGlide();
  });
  window.addEventListener('scrollend', endGlide);
};
