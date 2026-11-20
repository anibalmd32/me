import { initScroll } from './scroll';
import { initContact } from './contact';
import { initGlide } from './glide';

const root = document.documentElement;

/* ---------- Theme: light paper / night blueprint ---------- */
const toggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

const setTheme = (dark: boolean, persist: boolean) => {
  root.dataset.theme = dark ? 'dark' : 'light';
  toggles.forEach((button) => button.setAttribute('aria-pressed', String(dark)));
  if (persist) {
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* private mode: the choice just lasts for this page */
    }
  }
  document.dispatchEvent(new CustomEvent('themechange'));
};

toggles.forEach((button) => {
  button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  button.addEventListener('click', () => setTheme(root.dataset.theme !== 'dark', true));
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    /* ignore */
  }
  if (!saved) setTheme(event.matches, false);
});

/* ---------- Index (small screens): close after choosing a page ---------- */
const index = document.querySelector<HTMLElement>('[data-index]');
index?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('a')) index.hidePopover?.();
});

initScroll();
initContact();
initGlide();

/* ---------- WebGL hero: loaded when the browser is idle ---------- */
const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

if (canvas && root.classList.contains('motion')) {
  // Without WebGL (or on a data-saver connection) the static drawing stays and
  // the hero scene shortens itself: see .hero.no-3d in Hero.astro.
  const flat = () => canvas.closest('.hero')?.classList.add('no-3d');
  const start = () => {
    import('./hero3d').then((module) => module.initHero(canvas)).catch(flat);
  };
  if (saveData) flat();
  else if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 300);
}
