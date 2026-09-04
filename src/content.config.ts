import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { PRODUCT_PLACEHOLDER } from './config/site';

// Kategoritë janë koleksion, jo kod. Klienti do t'i shtojë e fshijë vetë nga CMS-ja.
const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    name_sq: z.string(),
    name_en: z.string(),
    blurb_sq: z.string(),
    blurb_en: z.string(),
    // Kategoritë nuk kanë foto me qëllim — fotot i mban produkti.
    order: z.number().default(99),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name_sq: z.string(),
    name_en: z.string(),
    // Çmimi gjithmonë në lekë, numër i plotë. Pa presje, pa simbol.
    price: z.number().int().positive(),
    oldPrice: z.number().int().positive().optional(),
    // Slug-u i një kategorie te src/content/categories.
    //
    // Me qëllim string i thjeshtë, jo reference(): nëse klienti fshin një
    // kategori që ka produkte brenda, build-i duhet të vazhdojë. Produktet e
    // mbetura pa kategori dalin te /produktet dhe njoftohen në terminal.
    // Shih `src/lib/catalog.ts`.
    category: z.string(),
    brand: z.string().optional(),
    image: z.string().default(PRODUCT_PLACEHOLDER),
    desc_sq: z.string(),
    desc_en: z.string(),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

// Këshillat e farmacisë. Një file për post për gjuhë — teksti i gjatë nuk hyn
// dot në dy fusha frontmatter, ndaj gjuha ndahet me `lang` dhe lidhet me
// `translationOf` (slug-u i postit shqip).
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    lang: z.enum(['sq', 'en']).default('sq'),
    translationOf: z.string().optional(),
    // Foto kryesore e postit. Pa të përdoret një pamje pa foto.
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Farmaci Rei'),
    tag: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { categories, products, posts };
