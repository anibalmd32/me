import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects and their case studies.
 * One Markdown file per project and language:
 *   src/content/projects/en/<slug>.md
 *   src/content/projects/es/<slug>.md
 * The body is the case study (Why / How / Challenges).
 * Images in the body: ![alt](../../../assets/projects/<slug>/<file>.png) on its own line,
 * optionally followed by a line in *italics*, which becomes its caption.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    year: z.number(),
    stack: z.array(z.string()),
    /** Main screenshot: shown in the projects list and at the top of the case study. */
    cover: image().optional(),
    coverAlt: z.string().optional(),
    /** Leave empty to show the button as "soon". */
    repo: z.string().optional(),
    demo: z.string().optional(),
    video: z
      .object({
        src: z.string(),
        poster: z.string(),
        narrated: z.object({ src: z.string(), poster: z.string() }).optional(),
      })
      .optional(),
    brief: z.object({ why: z.string(), how: z.string() }).optional(),
    challenges: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    highlight: z.object({ src: image(), alt: z.string(), caption: z.string().optional() }).optional(),
    order: z.number().default(0),
    /** true shows the handwritten "draft" tag. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
