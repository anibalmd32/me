import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { withLanguageAlternates } from './src/lib/sitemap-alternates';

// Case studies still marked `draft: true` are placeholders: they are built so
// they can be reviewed, but kept out of the sitemap (and served with noindex).
const projectsDir = './src/content/projects/en';
const draftSlugs = readdirSync(projectsDir)
  .filter((file) => /^draft:\s*true\s*$/m.test(readFileSync(`${projectsDir}/${file}`, 'utf8')))
  .map((file) => file.replace(/\.md$/, ''));
const isDraftCaseStudy = (url) =>
  draftSlugs.some((slug) => url.endsWith(`/projects/${slug}/`) || url.endsWith(`/proyectos/${slug}/`));

// https://astro.build/config
export default defineConfig({
  site: 'https://anibalmendoza.dev',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    // One small stylesheet per page: inlining it removes a render-blocking request.
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    build: {
      // three.js is a single chunk of about 550 kB (140 kB gzipped). It is
      // imported on idle, after first paint, and never blocks the page.
      chunkSizeWarningLimit: 700,
    },
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !isDraftCaseStudy(page),
      serialize: withLanguageAlternates,
    }),
  ],
  // Fonts are read from the installed @fontsource packages, so the build never
  // depends on the network. Astro self-hosts them and generates metric-matched
  // fallbacks to avoid layout shift. Latin subset only.
  fonts: [
    // Weight axis only (41 KB instead of 131 KB with opsz + wdth). It also
    // matches the videos, which render Bricolage at its default optical size.
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [{ src: ['./node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2'], weight: '200 800', style: 'normal' }],
      },
    },
    // Handwriting is always 700: one static file.
    {
      provider: fontProviders.local(),
      name: 'Caveat',
      cssVariable: '--font-hand',
      fallbacks: ['cursive'],
      options: {
        variants: [{ src: ['./node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2'], weight: '700', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [{ src: ['./node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'], weight: '100 800', style: 'normal' }],
      },
    },
  ],
});
