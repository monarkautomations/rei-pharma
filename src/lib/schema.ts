/**
 * Skemat e përmbajtjes, veçmas nga `content.config.ts`.
 *
 * Rrinë këtu që t'i provojë edhe `scripts/test-schema.mjs` pa nisur Astro-n:
 * ai u jep atyre pikërisht ato që shkruan CMS-ja kur klienti lë një fushë
 * bosh. Pa atë provë, një skemë që s'e pranon daljen e CMS-së e thyen
 * build-in — dhe atëherë asgjë prej punës së klientit nuk del online.
 */
import { z } from 'zod';

/**
 * Sveltia CMS nuk e heq fushën kur klienti e lë bosh: shkruan `null` te
 * numrat dhe datat, dhe `""` te tekstet e te fotot. Zod-i i quan të dyja
 * vlera të vërteta dhe i refuzon, ndaj përkthehen në "mungon" para kontrollit.
 *
 * Kjo nuk është zbukurim. Një `oldPrice: null` i vetëm e ndaloi build-in dhe
 * shtatë commit-e të klientit — produkte të reja, fotot e para reale — mbetën
 * pa dalë online pa asnjë shenjë te CMS-ja.
 */
const boshEshteMungese = (v: unknown) => (v === null || v === '' ? undefined : v);

/** Fushë opsionale që CMS-ja mund ta shkruajë `null` ose `""`. */
function cmsOptional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(boshEshteMungese, schema.optional());
}

/** Fushë me vlerë të parazgjedhur që CMS-ja mund ta shkruajë `null` ose `""`. */
function cmsDefault<T extends z.ZodTypeAny>(schema: T, fallback: z.input<T>) {
  return z.preprocess(boshEshteMungese, schema.default(fallback as never));
}

export const PRODUCT_PLACEHOLDER = '/produkt-placeholder.svg';

export const categorySchema = z.object({
  name_sq: z.string(),
  name_en: z.string(),
  blurb_sq: z.string(),
  blurb_en: z.string(),
  // Kategoritë nuk kanë foto me qëllim — fotot i mban produkti.
  order: cmsDefault(z.number(), 99),
});

export const productSchema = z.object({
  name_sq: z.string(),
  name_en: z.string(),
  // Çmimi gjithmonë në lekë, numër i plotë. Pa presje, pa simbol.
  price: z.number().int().positive(),
  oldPrice: cmsOptional(z.number().int().positive()),
  // Slug-u i një kategorie te src/content/categories.
  //
  // Me qëllim string i thjeshtë, jo reference(): nëse klienti fshin një
  // kategori që ka produkte brenda, build-i duhet të vazhdojë. Produktet e
  // mbetura pa kategori dalin te /produktet dhe njoftohen në terminal.
  // Shih `src/lib/catalog.ts`.
  category: z.string(),
  brand: cmsOptional(z.string()),
  image: cmsDefault(z.string(), PRODUCT_PLACEHOLDER),
  desc_sq: z.string(),
  desc_en: z.string(),
  inStock: cmsDefault(z.boolean(), true),
  featured: cmsDefault(z.boolean(), false),
  order: cmsDefault(z.number(), 99),
});

export const postSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  lang: cmsDefault(z.enum(['sq', 'en']), 'sq'),
  translationOf: cmsOptional(z.string()),
  // Foto kryesore e postit. Pa të përdoret një pamje pa foto.
  cover: cmsOptional(z.string()),
  coverAlt: cmsOptional(z.string()),
  date: z.coerce.date(),
  updated: cmsOptional(z.coerce.date()),
  author: cmsDefault(z.string(), 'Farmaci Rei'),
  tag: cmsOptional(z.string()),
  draft: cmsDefault(z.boolean(), false),
});
