import type { SitemapItem } from '@astrojs/sitemap';

type PagePair = { en: string; es: string };

const HOME: PagePair = { en: '/', es: '/es/' };
const PROJECT_PATTERN = /^\/(?:es\/proyectos|projects)\/([^/]+)\/$/;

const projectPair = (slug: string): PagePair => ({
  en: `/projects/${slug}/`,
  es: `/es/proyectos/${slug}/`,
});

const pairFor = (pathname: string): PagePair | null => {
  if (pathname === HOME.en || pathname === HOME.es) return HOME;
  const slug = PROJECT_PATTERN.exec(pathname)?.[1];
  return slug ? projectPair(slug) : null;
};

export const withLanguageAlternates = (item: SitemapItem): SitemapItem => {
  const { origin, pathname } = new URL(item.url);
  const pair = pairFor(pathname);
  if (!pair) return item;
  const absolute = (path: string) => `${origin}${path}`;
  return {
    ...item,
    links: [
      { lang: 'en', url: absolute(pair.en) },
      { lang: 'es', url: absolute(pair.es) },
      { lang: 'x-default', url: absolute(pair.en) },
    ],
  };
};
