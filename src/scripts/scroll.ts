/**
 * Scroll engine.
 *
 * Every [data-scene] is a tall section with a sticky stage. This module turns
 * the scroll position into a smoothed 0..1 progress and writes it to the
 * scene as --p; the choreography itself lives in CSS (calc/clamp on --p).
 * It also keeps the notebook header in sync: page number, handwritten topic,
 * reading progress and the tone of whatever sits right under it.
 */

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

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const remap = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

const plateau = (t: number, stops: number, rest = 0.36) => {
  const moves = stops - 1;
  if (moves < 1) return 0;
  const seg = 1 / moves;
  const i = Math.min(moves - 1, Math.floor(t / seg));
  const local = (t - i * seg) / seg;
  return (i + smooth(remap(local, rest / 2, 1 - rest / 2))) / moves;
};

const PAGE_TONE = '[data-tone]:not([data-tone="note"], [data-card])';
const READ_AT = 0.6;
const UNREAD_AT = 0.25;
const pagesByNotebook = new WeakMap<HTMLElement, HTMLElement[]>();

const notebookPages = (notebook: HTMLElement): HTMLElement[] => {
  const known = pagesByNotebook.get(notebook);
  if (known) return known;
  const pages = Array.from(notebook.querySelectorAll<HTMLElement>('[data-exp-page]'));
  pagesByNotebook.set(notebook, pages);
  return pages;
};

/** A scene can claim the header's tone for a moment (set by its hook). */
let forcedTone: string | null = null;

/** Per-scene extras that plain CSS math cannot express. */
const hooks: Record<string, (s: SceneState) => void> = {
  hero(s) {
    // While the marked module fills the screen, the header joins the wash.
    forcedTone = s.el.classList.contains('is-3d') && s.cur > 0.555 && s.cur < 0.625 ? 'wash' : null;
  },
  experience(s) {
    const pages = notebookPages(s.el);
    const zoom = smooth(remap(s.cur, 0.05, 0.22));
    const turned = plateau(remap(s.cur, 0.28, 0.97), pages.length) * (pages.length - 1);
    s.el.style.setProperty('--zoom', zoom.toFixed(4));
    s.el.style.setProperty('--turned', turned.toFixed(4));
    pages.forEach((page, index) => {
      const uncovered = index === 0 ? zoom : turned - index + 1;
      if (uncovered > READ_AT) page.classList.add('is-read');
      else if (uncovered < UNREAD_AT) page.classList.remove('is-read');
      page.classList.toggle('is-turning', turned > index && turned < index + 1);
    });
  },
};

/** Two scenes tie a full-screen field of marker to a few highlighted words:
    the hero wash closes in on them, the contact highlight grows out of them.
    Both need the real position of those words inside their stage, as insets. */
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

/** A heading that grows inside the colour taking over the screen starts at
    the small thing that colour came from. This gives the offset from the
    heading's resting place to that origin. Layout offsets for the heading
    (it is transformed while we measure), client rects for the origin, whose
    centre does not move when it is scaled or rotated. */
const measureOrigin = (blockSelector: string, originSelector: string, prefix: string) => {
  const block = document.querySelector<HTMLElement>(blockSelector);
  const origin = document.querySelector<HTMLElement>(originSelector);
  const scene = block?.closest<HTMLElement>('[data-scene]');
  const stage = scene?.querySelector<HTMLElement>('.stage');
  if (!block || !origin || !scene || !stage) return;
  const o = origin.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const blockX = block.offsetLeft + block.offsetWidth / 2;
  const blockY = block.offsetTop + block.offsetHeight / 2;
  scene.style.setProperty(`--${prefix}x`, `${(o.left + o.width / 2 - s.left - blockX).toFixed(1)}px`);
  scene.style.setProperty(`--${prefix}y`, `${(o.top + o.height / 2 - s.top - blockY).toFixed(1)}px`);
};

const measureContact = () => {
  measureMark('[data-contact-mark]', 'm');
  measureMark('[data-hero-mark]', 'w');
  measureOrigin('.cont__final--copy', '[data-contact-mark]', 'h');
  measureOrigin('.serv__final', '.serv__note', 's');
};

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

  measureContact();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => {
    measureContact();
    for (const s of scenes) s.snap = true;
    request();
  });
  document.fonts?.ready.then(() => {
    measureContact();
    request();
  });
  document.addEventListener('themechange', () => requestAnimationFrame(syncThemeColor));
  request();
}
