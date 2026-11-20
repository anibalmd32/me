import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/data/site';

export type Project = CollectionEntry<'projects'>;

/** Entry ids look like "en/orquesta": the folder is the language. */
export const projectSlug = (entry: Project): string => entry.id.split('/').slice(1).join('/');
export const projectLang = (entry: Project): Lang => entry.id.split('/')[0] as Lang;

export const getProjects = async (lang: Lang): Promise<Project[]> => {
  const all = await getCollection('projects');
  return all.filter((entry) => projectLang(entry) === lang).sort((a, b) => a.data.order - b.data.order);
};
