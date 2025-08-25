import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    startDate: z.string(),
    updated: z.string(),
    type: z.string()
      .transform(val => val.toLowerCase())
      .pipe(z.enum(['note', 'essay', 'knowledge base']))
      .optional()
      .default('note'),
    topics: z.array(z.string()).optional(),
    growthStage: z.enum(['seedling', 'budding', 'evergreen']),
    aliases: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional().default(false),
    image: z.object({
      url: z.string(),
      alt: z.string(),
      width: z.string().optional(),
    }).optional(),
    outboundLinks: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      growthStage: z.enum(['seedling', 'budding', 'evergreen']),
      description: z.string(),
    })).optional(),
    inboundLinks: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      growthStage: z.enum(['seedling', 'budding', 'evergreen']),
      description: z.string(),
    })).optional(),
  }),
  loader: glob({
    pattern: 'notes/**/*.{md,mdx}',
    base: './src/content'
  })
});

export const collections = {
  notes
};

