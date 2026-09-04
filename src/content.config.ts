import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { categorySchema, productSchema, postSchema } from './lib/schema.mjs';

// Skemat rrinë te `src/lib/schema.mjs` që `scripts/test-schema.mjs` t'i provojë
// kundrejt asaj që shkruan vërtet CMS-ja. Mos i zhvendos këtu prapa.

// Kategoritë janë koleksion, jo kod. Klienti do t'i shtojë e fshijë vetë nga CMS-ja.
const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: categorySchema,
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: productSchema,
});

// Këshillat e farmacisë. Një file për post për gjuhë — teksti i gjatë nuk hyn
// dot në dy fusha frontmatter, ndaj gjuha ndahet me `lang` dhe lidhet me
// `translationOf` (slug-u i postit shqip).
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: postSchema,
});

export const collections = { categories, products, posts };
