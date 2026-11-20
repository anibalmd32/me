import en from './en';
import es from './es';
import type { Dictionary } from './en';
import type { Lang } from '@/data/site';

const dictionaries: Record<Lang, Dictionary> = { en, es };

export const useT = (lang: Lang): Dictionary => dictionaries[lang];

/** URL segment used for case studies in each language. */
export const PROJECTS_SEGMENT: Record<Lang, string> = { en: 'projects', es: 'proyectos' };

export const homePath = (lang: Lang): string => (lang === 'en' ? '/' : '/es/');

export const projectPath = (lang: Lang, slug: string): string =>
  `${homePath(lang)}${PROJECTS_SEGMENT[lang]}/${slug}/`;

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');

export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', es: 'es_ES' };

export type { Dictionary };
