/**
 * Social preview image (1200×630), one per language, rendered at build time
 * with the real brand fonts: a notebook page with the headline and the cube.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { cubeSvg } from '@/lib/cube';
import { useT } from '@/i18n';
import { SITE, type Lang } from '@/data/site';

export const getStaticPaths: GetStaticPaths = () => [{ params: { lang: 'en' } }, { params: { lang: 'es' } }];

const C = {
  paper: '#F4EFE3',
  shade: '#E8E0CE',
  ink: '#1B1D24',
  inkSoft: '#5B5F6C',
  blue: '#2340D9',
  marker: '#FF6A1F',
  wash: 'rgba(255, 122, 46, 0.42)',
  washSolid: '#F9BE97',
};

const W = 1200;
const H = 630;

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const grid = dataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<defs>` +
    `<pattern id="s" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#4068A8" stroke-opacity="0.065" stroke-width="1"/></pattern>` +
    `<pattern id="b" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#4068A8" stroke-opacity="0.12" stroke-width="1"/></pattern>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#s)"/><rect width="${W}" height="${H}" fill="url(#b)"/></svg>`,
);

const mark = dataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 34" width="48" height="34"><g fill="none" stroke="${C.blue}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 6 3 17l10 11"/><path d="M35 6l10 11-10 11"/><path d="M28 2 20 32"/></g></svg>`,
);

const cube = dataUri(
  cubeSvg({
    ink: C.ink,
    top: C.paper,
    x: C.shade,
    z: '#D9DBE4',
    keyTop: C.washSolid,
    keyX: '#FBAB7C',
    keyZ: '#FC9B64',
  }),
);

const font = (file: string) => readFile(path.join(process.cwd(), 'node_modules/@fontsource', file));

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang === 'es' ? 'es' : 'en') as Lang;
  const t = useT(lang);
  const size = 96;

  const word = (text: string) => el('div', { marginRight: size * 0.24 }, text);
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).map(word);
  // Punctuation right after the marked words stays glued to them; anything after a space is its own word.
  const glued = /^\S/.test(t.hero.post) ? t.hero.post.split(/\s+/)[0] : '';
  const after = t.hero.post.slice(glued.length);
  const headline = el(
    'div',
    {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      fontSize: size,
      fontWeight: 800,
      letterSpacing: -size * 0.03,
      lineHeight: 1.04,
      color: C.ink,
    },
    [
      ...words(t.hero.pre),
      el('div', { display: 'flex', position: 'relative', padding: '0 8px', marginLeft: -8, marginRight: size * 0.24 - 8 }, [
        el('div', {
          position: 'absolute',
          left: 0,
          right: 0,
          top: '20%',
          height: '74%',
          borderRadius: 8,
          backgroundColor: C.wash,
        }),
        el('div', { display: 'flex' }, `${t.hero.mark}${glued}`),
      ]),
      ...words(after),
    ],
  );

  const tree = el(
    'div',
    {
      display: 'flex',
      position: 'relative',
      width: W,
      height: H,
      backgroundColor: C.paper,
      fontFamily: 'Bricolage Grotesque',
    },
    [
      el('img', { position: 'absolute', left: 0, top: 0 }, undefined, { src: grid, width: W, height: H }),
      el('div', { position: 'absolute', left: 58, top: 0, width: 3, height: H, backgroundColor: 'rgba(255, 106, 31, 0.24)' }),
      // Explicit content box: satori sizes boxes content-box, so no padding on the root.
      el('div', { display: 'flex', flexDirection: 'column', width: W - 172, height: H - 88, marginLeft: 100, marginTop: 44 }, [

      // Page header: the brand signature
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        el('div', { display: 'flex', alignItems: 'center' }, [
          el('img', { marginRight: 14 }, undefined, { src: mark, width: 42, height: 30 }),
          el('div', { fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: C.ink }, SITE.name),
        ]),
        el(
          'div',
          { fontFamily: 'Caveat', fontSize: 40, fontWeight: 700, color: C.blue, transform: 'rotate(-2deg)' },
          t.header.topics.hero,
        ),
      ]),
      el('div', { marginTop: 12, height: 3, borderRadius: 3, backgroundColor: C.ink, opacity: 0.8 }),

      el('div', { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }, [
        el('div', { display: 'flex', flexDirection: 'column', width: 690 }, [
          headline,
          el(
            'div',
            {
              marginTop: 22,
              fontFamily: 'Caveat',
              fontSize: 46,
              fontWeight: 700,
              color: C.blue,
              transform: 'rotate(-2deg)',
            },
            t.hero.note,
          ),
        ]),
        el('img', {}, undefined, { src: cube, width: 300, height: 347 }),
      ]),

        el('div', { fontSize: 24, fontWeight: 500, color: C.inkSoft }, new URL(SITE.url).host),
      ]),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: [
      { name: 'Bricolage Grotesque', weight: 800, style: 'normal', data: await font('bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff') },
      { name: 'Bricolage Grotesque', weight: 500, style: 'normal', data: await font('bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff') },
      { name: 'Caveat', weight: 700, style: 'normal', data: await font('caveat/files/caveat-latin-700-normal.woff') },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
