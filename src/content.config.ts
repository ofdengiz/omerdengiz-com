import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Imported from zod directly: the `z` re-export from astro:content is
// deprecated in Astro 7. Same schema objects, no deprecation surface.
import { z } from 'zod';

/**
 * Content collections.
 *
 * Case-study prose lives in Markdown; anything the layout needs to *lay out*
 * — metrics, callouts, stack, links — lives in typed frontmatter. That split
 * is deliberate: it means project copy can be edited without opening an
 * .astro file, while the schema still fails the build if a required field is
 * missing or misspelled, rather than rendering a blank section.
 */

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    /** Zero-padded drawing index, shared with the home page project list. */
    sheet: z.string().regex(/^\d{2}$/, 'sheet must be two digits, e.g. "03"'),
    title: z.string(),
    /** One line. Used in the title block and as the meta description. */
    summary: z.string(),
    /** How the work came about — "Algonquin College capstone", "Self-directed". */
    context: z.string(),
    period: z.string().optional(),

    /** Technologies, in the order they should read. */
    stack: z.array(z.string()).min(1),

    source: z.string().url().optional(),
    live: z.string().url().optional(),
    /** Supporting document, served from public/. */
    document: z
      .object({
        href: z.string(),
        label: z.string(),
        note: z.string().optional(),
      })
      .optional(),

    /** Renders the interactive Site 2 drawing. Capstone only. */
    topology: z.boolean().default(false),

    /** Title-block cells. Two to four reads best. */
    cells: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          accent: z.boolean().default(false),
        }),
      )
      .default([]),

    /** Rendered as a row of DimensionLine components under the title block. */
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          note: z.string().optional(),
          accent: z.boolean().default(false),
        }),
      )
      .default([]),

    /**
     * Numbered notes. The prose refers to them by number ("see 2"), matching
     * how a drawing balloons a callout — which is why these are a separate
     * list rather than inline asides.
     */
    notes: z
      .array(
        z.object({
          title: z.string().optional(),
          body: z.string(),
          tone: z.enum(['default', 'annotate']).default('default'),
        }),
      )
      .default([]),

    /** Honest retrospective. Rendered as a plain list, no ceremony. */
    revisions: z.array(z.string()).default([]),

    /** Lower sorts first in any listing. */
    order: z.number().default(99),
    /** Excluded from /projects/[slug] — used for pages with their own route. */
    standalone: z.boolean().default(false),
  }),
});

export const collections = { projects };
