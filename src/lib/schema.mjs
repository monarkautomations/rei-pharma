/**
 * Skemat e përmbajtjes. Rregulli i vetëm: **nuk dështojnë kurrë.**
 *
 * Përmbajtjen e shkruan klienti nga CMS-ja. Nëse skema e refuzon një fushë,
 * Astro e ndalon build-in — dhe atëherë asgjë prej punës së tij nuk del
 * online, pa asnjë shenjë te CMS-ja: ai shtyp "Save", i thuhet se u ruajt,
 * dhe web-i nuk lëviz. Ka ndodhur: një `oldPrice: null` i vetëm mbajti pezull
 * shtatë commit-e, dy produkte të reja dhe katër fotot e para reale.
 *
 * Ndaj çdo fushë ka rrugëdalje. Vlera e gabuar zëvendësohet me një të
 * arsyeshme dhe raportohet në terminal nga `src/lib/catalog.ts`, i cili vendos
 * pastaj nëse hyrja mund të shfaqet apo duhet lënë jashtë. Faqja del gjithmonë.
 *
 * Provohet nga `scripts/test-schema.mjs`, që nis para çdo build-i.
 *
 * Shkruar me JavaScript, jo TypeScript, me qëllim: këtë file e lexon edhe
 * testi që nis para `astro build`, pra edhe Node-i i thjeshtë te Netlify.
 * Si `.ts`, importi varej nga leximi vetiu i TypeScript-it, veçori që Node-i
 * e ka vetëm nga versioni 22.18 e tutje — dhe versionin atje e zgjedh Netlify,
 * jo ne. Një rikthim i tyre te Node 20 do ta ndalte çdo publikim. Tipat nuk
 * humbasin: Zod-i i nxjerr vetë nga skemat.
 */
import { z } from 'zod';

export const PRODUCT_PLACEHOLDER = '/produkt-placeholder.svg';

/** Çmimi 0 do të thotë "i papërdorshëm" — catalog.ts e nxjerr produktin jashtë. */
export const PRICE_INVALID = 0;

/**
 * Sveltia CMS nuk e heq fushën kur klienti e lë bosh: shkruan `null` te
 * numrat dhe datat, `""` te tekstet dhe te fotot. Të dyja do të thonë "bosh".
 */
const boshEshteMungese = (v) => (v === null || v === '' ? undefined : v);

/** Opsionale, e duron `null` dhe `""`, dhe s'bie kurrë. */
function cmsOptional(schema) {
  return z.preprocess(boshEshteMungese, schema.optional().catch(undefined));
}

/** Me vlerë të parazgjedhur, e duron çdo plehrë, dhe s'bie kurrë. */
function cmsDefault(schema, fallback) {
  return z.preprocess(boshEshteMungese, schema.default(fallback)).catch(fallback);
}

/** Tekst i detyrueshëm që megjithatë s'guxon ta ndalë build-in. */
const cmsText = cmsDefault(z.string(), '');

/**
 * Numër nga çfarëdo që shkruan klienti.
 *
 * Fusha e CMS-së është numerike, po përmbajtja mund të vijë edhe nga GitHub-i
 * ose nga një import i vjetër. "2 400 L" bëhet 2400; ajo që s'ka fare shifra
 * bëhet `PRICE_INVALID`, dhe produkti nuk shfaqet fare — më mirë pa produkt
 * sesa me çmim të rremë.
 */
const numri = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
  if (typeof v === 'string') {
    const shifrat = v.replace(/[^\d.,-]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
    const n = Number.parseFloat(shifrat);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return PRICE_INVALID;
};

const cmsPrice = z.preprocess(
  (v) => (v === null || v === '' || v === undefined ? PRICE_INVALID : numri(v)),
  z.number().int().min(0),
).catch(PRICE_INVALID);

/** Numër opsional: mungon nëse s'del dot numër i vlefshëm. */
const cmsOptionalPrice = z.preprocess((v) => {
  if (v === null || v === '' || v === undefined) return undefined;
  const n = numri(v);
  return n > 0 ? n : undefined;
}, z.number().int().positive().optional().catch(undefined));

/** Po/jo nga çdo formë që mund të marrë ("true", "po", 1). */
const cmsBoolean = (fallback) =>
  z.preprocess((v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', 'po', 'yes', '1'].includes(s)) return true;
      if (['false', 'jo', 'no', '0'].includes(s)) return false;
    }
    if (typeof v === 'number') return v !== 0;
    return fallback;
  }, z.boolean().catch(fallback));

/**
 * Data e postit. Nëse s'del datë e vlefshme, kthen `null` — dhe `getPosts()`
 * e fsheh postin, që të mos dalë "1 janar 1970" te blogu i një farmacie.
 */
const cmsDate = z.preprocess((v) => {
  if (v === null || v === '' || v === undefined) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}, z.date().nullable().catch(null));

export const categorySchema = z.object({
  name_sq: cmsText,
  name_en: cmsText,
  blurb_sq: cmsText,
  blurb_en: cmsText,
  // Kategoritë nuk kanë foto me qëllim — fotot i mban produkti.
  order: cmsDefault(z.number(), 99),
});

export const productSchema = z.object({
  name_sq: cmsText,
  name_en: cmsText,
  // Çmimi gjithmonë në lekë, numër i plotë. Pa presje, pa simbol.
  price: cmsPrice,
  oldPrice: cmsOptionalPrice,
  // Slug-u i një kategorie te src/content/categories.
  //
  // Me qëllim string i thjeshtë, jo reference(): nëse klienti fshin një
  // kategori që ka produkte brenda, build-i duhet të vazhdojë. Produktet e
  // mbetura pa kategori dalin te /produktet dhe njoftohen në terminal.
  category: cmsText,
  brand: cmsOptional(z.string()),
  image: cmsDefault(z.string(), PRODUCT_PLACEHOLDER),
  desc_sq: cmsText,
  desc_en: cmsText,
  inStock: cmsBoolean(true),
  featured: cmsBoolean(false),
  order: cmsDefault(z.number(), 99),
});

export const postSchema = z.object({
  title: cmsText,
  excerpt: cmsText,
  lang: cmsDefault(z.enum(['sq', 'en']), 'sq'),
  translationOf: cmsOptional(z.string()),
  // Foto kryesore e postit. Pa të përdoret një pamje pa foto.
  cover: cmsOptional(z.string()),
  coverAlt: cmsOptional(z.string()),
  date: cmsDate,
  updated: cmsOptional(z.coerce.date()),
  author: cmsDefault(z.string(), 'Farmaci Rei'),
  tag: cmsOptional(z.string()),
  draft: cmsBoolean(false),
});
