/**
 * Scroll engine.
 *
 * Every [data-scene] is a tall section with a sticky stage. This module turns
 * the scroll position into a smoothed 0..1 progress and writes it to the
 * scene as --p; the choreography itself lives in CSS (calc/clamp on --p).
 * It also keeps the notebook header in sync: page number, handwritten topic,
 * reading progress and the tone of whatever sits right under it.
 */

import { clamp01 } from './progress-math';
import { updateRoute } from './route';
import { updateScrollMarks } from './scroll-marks';

const root = document.documentElement;

/** Smoothed progress per scene id, read by the WebGL hero. */
export const progress: Record<string, number> = {};

type Live = { el: HTMLElement; a: number; b: number; off: boolean | null };

type SceneState = {
  id: string;
  el: HTMLElement;
  stage: HTMLElement;
  cur: number;
  target: number;
  near: boolean;
  snap: boolean;
  lives: Live[];
};

const PAGE_TONE = '[data-tone]:not([data-tone="note"], [data-card])';
/** A scene can claim the header's tone for a moment (set by its hook). */
let forcedTone: string | null = null;

/** Per-scene extras that plain CSS math cannot express. */
const hooks: Record<string, (s: SceneState) => void> = {
  hero(s) {
    // While the marked module fills the screen, the header joins the wash.
    forcedTone = s.el.classList.contains('is-3d') && s.cur > 0.555 && s.cur < 0.625 ? 'wash' : null;
  },
  experience(s) {
    updateRoute(s.el, s.cur);
  },
};

const measureMark = (selector: string, prefix: string) => {
  const mark = document.querySelector<HTMLElement>(selector);
  const scene = mark?.closest<HTMLElement>('[data-scene]');
  const stage = scene?.querySelector<HTMLElement>('.stage');
  if (!mark || !scene || !stage) return;
  // First line box only: the words may wrap on a narrow screen.
  const m = mark.getClientRects()[0] ?? mark.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  scene.style.setProperty(`--${prefix}t`, `${(m.top - s.top).toFixed(1)}px`);
  scene.style.setProperty(`--${prefix}l`, `${(m.left - s.left).toFixed(1)}px`);
  scene.style.setProperty(`--${prefix}r`, `${(s.right - m.right).toFixed(1)}px`);
  scene.style.setProperty(`--${prefix}b`, `${(s.bottom - m.bottom).toFixed(1)}px`);
};

const measureHeroMark = () => measureMark('[data-hero-mark]', 'w');

export function initScroll() {
  const motion = root.classList.contains('motion');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const pages = Array.from(document.querySelectorAll<HTMLElement>('[data-page]'));
  const topic = document.querySelector<HTMLElement>('[data-topic]');
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
  const themeColor = document.querySelector<HTMLMetaElement>('[data-theme-color]');

  const scenes: SceneState[] = motion
    ? Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map((el) => ({
        id: el.dataset.scene ?? '',
        el,
        stage: el.querySelector<HTMLElement>('.stage')!,
        cur: 0,
        target: 0,
        near: false,
        snap: true,
        lives: Array.from(el.querySelectorAll<HTMLElement>('[data-live]')).map((live) => {
          const [a, b] = (live.dataset.live ?? '0,1').split(',').map(Number);
          return { el: live, a, b, off: null };
        }),
      }))
    : [];

  let ticking = false;
  let currentPage: HTMLElement | null = null;

  const apply = (s: SceneState) => {
    s.el.style.setProperty('--p', s.cur.toFixed(4));
    progress[s.id] = s.cur;
    hooks[s.id]?.(s);
    for (const live of s.lives) {
      const off = s.cur < live.a - 0.002 || s.cur > live.b + 0.002;
      if (off !== live.off) {
        live.off = off;
        live.el.classList.toggle('is-off', off);
      }
    }
  };

  const syncThemeColor = () => {
    if (header && themeColor) themeColor.content = getComputedStyle(header).backgroundColor;
  };

  const updateHeader = () => {
    if (!header) return;
    const max = root.scrollHeight - innerHeight;
    header.style.setProperty('--scroll', max > 0 ? clamp01(scrollY / max).toFixed(4) : '0');

    if (pages.length) {
      let active = pages[0];
      for (const page of pages) {
        if (page.getBoundingClientRect().top <= innerHeight * 0.5) active = page;
      }
      if (active !== currentPage) {
        const first = currentPage === null;
        currentPage = active;
        if (topic && active.dataset.topic) {
          topic.textContent = active.dataset.topic;
          if (!first) {
            topic.classList.remove('is-writing');
            void topic.offsetWidth;
            topic.classList.add('is-writing');
          }
        }
        for (const link of navLinks) {
          if (link.dataset.nav === active.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    }

    // Tone: whatever is painted right under the header decides its colours.
    let tone = 'paper';
    if (forcedTone) {
      tone = forcedTone;
    } else {
      for (const el of document.elementsFromPoint(innerWidth / 2, header.offsetHeight + 6)) {
        if (header.contains(el)) continue;
        const toned = el.closest<HTMLElement>(PAGE_TONE);
        if (toned && toned !== root) tone = toned.dataset.tone ?? 'paper';
        break;
      }
    }
    if (root.dataset.tone !== tone) {
      root.dataset.tone = tone;
      syncThemeColor();
    }
  };

  const tick = () => {
    ticking = false;
    let moving = false;
    for (const s of scenes) {
      if (!s.near) continue;
      const rect = s.el.getBoundingClientRect();
      const range = rect.height - s.stage.offsetHeight;
      s.target = range > 0 ? clamp01(-rect.top / range) : 0;
      const diff = s.target - s.cur;
      if (s.snap || Math.abs(diff) < 0.0006) {
        s.cur = s.target;
        s.snap = false;
      } else {
        s.cur += diff * 0.2;
        moving = true;
      }
      apply(s);
    }
    updateHeader();
    if (motion) updateScrollMarks();
    if (moving) request();
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  };

  if (scenes.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const s = scenes.find((scene) => scene.el === entry.target);
          if (!s) continue;
          if (entry.isIntersecting && !s.near) s.snap = true;
          s.near = entry.isIntersecting;
        }
        request();
      },
      { rootMargin: '60% 0px 60% 0px' },
    );
    for (const s of scenes) {
      apply(s);
      io.observe(s.el);
    }

    // Keyboard and assistive tech: when focus lands on something that the
    // current scroll position has faded out, scroll to where it is visible.
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement | null;
      const liveEl = target?.closest<HTMLElement>('[data-live]');
      if (!liveEl) return;
      const s = scenes.find((scene) => scene.el.contains(liveEl));
      const live = s?.lives.find((l) => l.el === liveEl);
      if (!s || !live || !live.off) return;
      const range = s.el.offsetHeight - s.stage.offsetHeight;
      const at = live.a <= 0 ? 0 : Math.min(1, live.a + 0.08);
      window.scrollTo({ top: s.el.getBoundingClientRect().top + scrollY + at * range });
    });
  }

  // Ink that draws itself once it enters the page.
  const inked = document.querySelectorAll<HTMLElement>('[data-ink]');
  if (motion && inked.length) {
    const inkIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          inkIO.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    inked.forEach((el) => inkIO.observe(el));
  }

  measureHeroMark();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => {
    measureHeroMark();
    for (const s of scenes) s.snap = true;
    request();
  });
  document.fonts?.ready.then(() => {
    measureHeroMark();
    request();
  });
  document.addEventListener('themechange', () => requestAnimationFrame(syncThemeColor));
  request();
}
