/**
 * The CV PDFs live in src/assets/cv and are only published when
 * SITE.cvDownload is true. They contain a phone number and an email address,
 * and the site promises to show neither, so by default nothing is emitted.
 * When enabled they keep their old public URLs: /assets/cv/cv_anibal_en.pdf
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '@/data/site';

const FILES = ['cv_anibal_en', 'cv_anibal_es'];

export const getStaticPaths: GetStaticPaths = () => (SITE.cvDownload ? FILES.map((file) => ({ params: { file } })) : []);

export const GET: APIRoute = async ({ params }) => {
  const data = await readFile(path.join(process.cwd(), 'src/assets/cv', `${params.file}.pdf`));
  return new Response(new Uint8Array(data), { headers: { 'Content-Type': 'application/pdf' } });
};
