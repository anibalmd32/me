# anibalmendoza.dev

Portfolio of **Anibal Mendoza**, software developer. The site is a page of the same engineer's notebook used in the BlueCode videos: cream grid paper, blue ink, one orange marker, code cards held with tape.

Built with [Astro](https://astro.build) (static output) and [three.js](https://threejs.org) for the hero drawing. English at `/`, Spanish at `/es/`, light and dark paper.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run preview` serves the production build from `dist/`.

## Where things live

| What | Where |
| --- | --- |
| Texts in English / Spanish (hero, experience, services, products, contact) | `src/i18n/en.ts`, `src/i18n/es.ts` |
| Projects and their case studies | `src/content/projects/<lang>/<slug>.md` |
| Site facts: handle, social links, CV download switch | `src/data/site.ts` |
| Brand tokens (colours, type, motion curves) | `src/styles/global.css` |
| Scroll engine (one `--p` per scene) | `src/scripts/scroll.ts` |
| WebGL hero | `src/scripts/hero3d.ts` |
| One component per section | `src/components/` |

### Add or edit a project

Create one Markdown file per language with the same file name:

```
src/content/projects/en/my-project.md
src/content/projects/es/my-project.md
```

```yaml
---
title: My project
summary: One sentence that says what it is and why it matters.
role: Development
year: 2026
stack: [Node.js, PostgreSQL, React]
cover: ../../../assets/projects/my-project/cover.png   # optional: list, case study header, social preview
coverAlt: What the screenshot shows.
repo: https://github.com/anibalmd32/my-project   # leave empty to show the button as "soon"
demo: https://my-project.example                 # same
order: 1
draft: false                                     # true shows the handwritten "draft" tag
---

## Why
## How

![What the screenshot shows](../../../assets/projects/my-project/detail.png)

*An italic line right after an image becomes its caption.*

## Challenges
```

The body is the case study page: `/projects/my-project/` and `/es/proyectos/my-project/`. Screenshots live in `src/assets/projects/<slug>/` and are served as WebP at build time.

### Placeholders to replace

Everything marked with the red handwritten **draft / borrador** tag is placeholder content: the three services. The projects (Orquesta, RepoScope, IA Grades Loader and MiniCajero) are real. The products section shows Apartar (copy in `products.featured` in `src/i18n/*.ts`, screenshot in `src/assets/products/apartar.png`). Edit the text and set `draft: false`.

While a project is a draft, its case study page is served with `noindex` and left out of the sitemap, so search engines never see placeholder text.

### Contact form

The form posts to a form service, so no email address or phone number is ever published on the site.

1. Create a form in [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) with your inbox.
2. Copy `.env.example` to `.env` and set `PUBLIC_CONTACT_ENDPOINT` (and `PUBLIC_CONTACT_ACCESS_KEY` for Web3Forms).
3. For the deployed site, add the same names as **repository variables** in GitHub (Settings > Secrets and variables > Actions > Variables).

Until the endpoint is set, the form says up front that it is not connected and its send button is shown as pending.

### CV download

The CV PDFs live in `src/assets/cv/` and are **not published**: they include a phone number and an email address, and the site promises to show neither. To bring the "Download CV" button back, replace both PDFs with versions without contact details and set `cvDownload: true` in `src/data/site.ts`. They are then served at their old URLs (`/assets/cv/cv_anibal_en.pdf`, `/assets/cv/cv_anibal_es.pdf`). While it is off, the hero's second button is "Write to me".

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. One-time setup in the repository: **Settings > Pages > Source: GitHub Actions**. The custom domain comes from `public/CNAME`.

## Motion and performance

- Each section has a pinned scene driven by scroll: the cube you dive into, the route map you ride, the code card that becomes the page, the sticky note that comes at you, the pen circle that opens into blue, the marker that sweeps the screen.
- With `prefers-reduced-motion`, or without JavaScript, every scene is plain stacked content.
- three.js loads when the browser is idle, renders only on demand and is skipped on data-saver connections. Fonts are self-hosted and the display face is preloaded.
