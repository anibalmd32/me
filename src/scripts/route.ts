import { startGlide } from './glide';
import { clamp01, plateau, remap } from './progress-math';

export const PINNED_ROUTE = '(min-width: 52rem) and (orientation: landscape) and (min-height: 42rem)';

const TRAVEL_FROM = 0.06;
const TRAVEL_TO = 0.94;
const SWITCH_MARGIN = 0.08;
const DROP_LEAD = 0.35;
const RAIL_REACH = 0.6;
const NOT_SET = -1;

interface RouteParts {
  rail: HTMLElement | null;
  dots: (HTMLElement | null)[];
  stations: HTMLElement[];
  stops: HTMLElement[];
  links: HTMLAnchorElement[];
  penStops: number[];
  drops: { index: number; path: SVGPathElement }[];
  active: number;
}

const partsByScene = new WeakMap<HTMLElement, RouteParts>();
const pinned = matchMedia(PINNED_ROUTE);

const readParts = (scene: HTMLElement): RouteParts => {
  const known = partsByScene.get(scene);
  if (known) return known;
  const stops = [...scene.querySelectorAll<HTMLElement>('[data-route-stop]')];
  const stations = [...scene.querySelectorAll<HTMLElement>('[data-station]')];
  const parts: RouteParts = {
    rail: scene.querySelector<HTMLElement>('[data-route-rail]'),
    dots: stations.map((station) => station.querySelector<HTMLElement>('[data-station-dot]')),
    stations,
    stops,
    links: [...scene.querySelectorAll<HTMLAnchorElement>('[data-route-go]')],
    penStops: stops.map((stop) => Number(stop.dataset.pen ?? 0)),
    drops: [...scene.querySelectorAll<SVGPathElement>('[data-route-drop]')].map((path) => ({
      index: Number(path.dataset.routeDrop ?? 0),
      path,
    })),
    active: NOT_SET,
  };
  partsByScene.set(scene, parts);
  return parts;
};

const penAt = (penStops: number[], turned: number): number => {
  const last = penStops.length - 1;
  const lower = Math.min(last, Math.floor(turned));
  const upper = Math.min(last, lower + 1);
  const from = penStops[lower] ?? 0;
  const to = penStops[upper] ?? from;
  return from + (to - from) * (turned - lower);
};

const markActive = (parts: RouteParts): void => {
  parts.stations.forEach((station, index) => station.classList.toggle('is-active', index === parts.active));
  parts.stops.forEach((stop, index) => {
    stop.classList.toggle('is-active', index === parts.active);
    stop.classList.toggle('is-past', index < parts.active);
  });
  parts.links.forEach((link, index) => {
    if (index === parts.active) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
};

const fillRail = (parts: RouteParts): void => {
  if (!parts.rail) return;
  const reach = window.innerHeight * RAIL_REACH;
  const rail = parts.rail.getBoundingClientRect();
  parts.rail.style.setProperty('--rail', clamp01((reach - rail.top) / rail.height).toFixed(4));
  parts.stations.forEach((station, index) => {
    const dot = parts.dots[index]?.getBoundingClientRect();
    station.classList.toggle('is-reached', dot !== undefined && dot.top + dot.height / 2 <= reach);
  });
};

export const updateRoute = (scene: HTMLElement, progress: number): void => {
  const parts = readParts(scene);
  if (!pinned.matches) {
    fillRail(parts);
    return;
  }
  const last = parts.stations.length - 1;
  if (last < 1) return;
  const turned = plateau(remap(progress, TRAVEL_FROM, TRAVEL_TO), last + 1) * last;
  scene.style.setProperty('--pen', penAt(parts.penStops, turned).toFixed(4));
  parts.drops.forEach(({ index, path }) => {
    path.style.setProperty('--drawn', remap(turned, index - DROP_LEAD, index).toFixed(4));
  });
  if (Math.abs(turned - parts.active) <= 0.5 + SWITCH_MARGIN) return;
  parts.active = Math.round(turned);
  markActive(parts);
};

const scrollToStation = (scene: HTMLElement, index: number): void => {
  const stage = scene.querySelector<HTMLElement>('.stage');
  const { stations } = readParts(scene);
  if (!stage || stations.length < 2) return;
  const range = scene.offsetHeight - stage.offsetHeight;
  const at = TRAVEL_FROM + (index / (stations.length - 1)) * (TRAVEL_TO - TRAVEL_FROM);
  startGlide();
  window.scrollTo({ top: scene.getBoundingClientRect().top + window.scrollY + at * range });
};

const stepFor = (key: string): number => (key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0);

const bindRoute = (scene: HTMLElement): void => {
  const parts = readParts(scene);

  parts.links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (!pinned.matches) return;
      event.preventDefault();
      scrollToStation(scene, index);
    });
  });

  scene.querySelector<HTMLElement>('[data-route-track]')?.addEventListener('keydown', (event) => {
    const step = stepFor(event.key);
    if (step === 0 || !pinned.matches) return;
    const target = Math.max(0, Math.min(parts.links.length - 1, parts.active + step));
    event.preventDefault();
    parts.links[target]?.focus({ preventScroll: true });
    scrollToStation(scene, target);
  });

  parts.stations.forEach((station, index) => {
    station.addEventListener('focusin', () => {
      if (pinned.matches && index !== parts.active) scrollToStation(scene, index);
    });
  });
};

export const initRoute = (): void => {
  document.querySelectorAll<HTMLElement>('[data-scene="experience"]').forEach(bindRoute);
};
