import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PRODUCT_PLACEHOLDER, PRICE_INVALID } from './schema';

export type Lang = 'sq' | 'en';

/**
 * Rojtari mes CMS-së dhe faqes.
 *
 * Skema te `schema.ts` nuk dështon kurrë — korrigjon dhe vazhdon. Këtu vendoset
 * pastaj çfarë mund të dalë vërtet para vizitorit: një produkt pa çmim nuk
 * shitet dot, një foto që s'ekziston nuk shfaqet dot. Në vend që faqja të dalë
 * e thyer, hyrja lihet jashtë ose zëvendësohet, dhe problemi shkruhet në
 * terminal që ta shohë kush ndërton, jo klienti.
 */
const problemet = new Set<string>();

function njofto(mesazhi: string) {
  // Faqet ndërtohen njëra pas tjetrës dhe katalogu lexohet shumë herë; pa këtë
  // i njëjti njoftim do të mbushte terminalin dhjetëra herë.
  if (problemet.has(mesazhi)) return;
  problemet.add(mesazhi);
  console.warn(`[katalogu] ${mesazhi}`);
}

/**
 * A ekziston vërtet fotoja te `public/`?
 *
 * Klienti mund ta fshijë ose riemërtojë një foto nga GitHub-i pa e prekur
 * produktin. Pa këtë kontroll, karta do të dilte me foto të thyer — më keq se
 * vizatimi gri i përkohshëm.
 */
const fotoEkziston = new Map<string, boolean>();

function fotoEVlefshme(rruga: string, produkti: string): string {
  if (!rruga || rruga === PRODUCT_PLACEHOLDER) return PRODUCT_PLACEHOLDER;
  // Foto nga interneti nuk kontrollohet dot lokalisht; besoji.
  if (/^https?:\/\//.test(rruga)) return rruga;

  let ka = fotoEkziston.get(rruga);
  if (ka === undefined) {
    ka = existsSync(join(process.cwd(), 'public', decodeURIComponent(rruga)));
    fotoEkziston.set(rruga, ka);
  }

  if (!ka) {
    njofto(`"${produkti}": fotoja "${rruga}" nuk ekziston te public/. U vu vizatimi i përkohshëm.`);
    return PRODUCT_PLACEHOLDER;
  }
  return rruga;
}

/** Emër i lexueshëm nga slug-u, kur klienti e ka lënë fushën bosh. */
function emriNgaSlug(slug: string): string {
  const fjale = slug.replace(/[-_]+/g, ' ').trim();
  return fjale ? fjale.charAt(0).toUpperCase() + fjale.slice(1) : slug;
}

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  order: number;
};

export type Product = {
  slug: string;
  name: string;
  desc: string;
  price: number;
  oldPrice?: number;
  category: string;
  brand?: string;
  image: string;
  inStock: boolean;
  featured: boolean;
  order: number;
};

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

function toCategory(entry: CollectionEntry<'categories'>, lang: Lang): Category {
  const d = entry.data;
  // Gjuha tjetër zë vendin e asaj që mungon; slug-u është rrjeta e fundit,
  // që të mos dalë kurrë një filtër pa emër.
  const name =
    (lang === 'en' ? d.name_en || d.name_sq : d.name_sq || d.name_en) ||
    emriNgaSlug(entry.id);

  if (!d.name_sq || !d.name_en) {
    njofto(`kategoria "${entry.id}": mungon emri në një gjuhë. U përdor tjetra.`);
  }

  return {
    slug: entry.id,
    name,
    blurb: (lang === 'en' ? d.blurb_en || d.blurb_sq : d.blurb_sq || d.blurb_en) || '',
    order: d.order,
  };
}

function toProduct(entry: CollectionEntry<'products'>, lang: Lang): Product {
  const d = entry.data;
  const name =
    (lang === 'en' ? d.name_en || d.name_sq : d.name_sq || d.name_en) ||
    emriNgaSlug(entry.id);

  if (!d.name_sq || !d.name_en) {
    njofto(`"${entry.id}": mungon emri në një gjuhë. U përdor tjetra.`);
  }

  // Çmim i vjetër më i vogël se aktuali do të nxirrte "ofertë" të rreme dhe
  // një zbritje negative te faqja e produktit. Hiqet në heshtje për vizitorin.
  let oldPrice = d.oldPrice;
  if (oldPrice !== undefined && oldPrice <= d.price) {
    njofto(`"${entry.id}": çmimi i vjetër (${oldPrice}) nuk është më i madh se ${d.price}. Oferta nuk u shfaq.`);
    oldPrice = undefined;
  }

  return {
    slug: entry.id,
    name,
    desc: (lang === 'en' ? d.desc_en || d.desc_sq : d.desc_sq || d.desc_en) || '',
    price: d.price,
    oldPrice,
    category: d.category,
    brand: d.brand,
    image: fotoEVlefshme(d.image, entry.id),
    inStock: d.inStock,
    featured: d.featured,
    order: d.order,
  };
}

export async function getCategories(lang: Lang = 'sq'): Promise<Category[]> {
  const entries = await getCollection('categories');
  return entries.map((e) => toCategory(e, lang)).sort(byOrder);
}

export async function getProducts(lang: Lang = 'sq'): Promise<Product[]> {
  const entries = await getCollection('products');

  // Produkt pa çmim të vlefshëm nuk shitet dot: shporta do të mblidhte 0 L dhe
  // mesazhi i WhatsApp-it do të nisej me çmim të rremë. Më mirë jashtë liste.
  const perdorshme = entries.filter((e) => {
    if (e.data.price > PRICE_INVALID) return true;
    njofto(`"${e.id}": çmimi mungon ose s'është numër. Produkti nuk u shfaq.`);
    return false;
  });

  return perdorshme.map((e) => toProduct(e, lang)).sort(byOrder);
}

/**
 * Produktet e një kategorie, sipas slug-ut.
 */
export async function getProductsInCategory(
  slug: string,
  lang: Lang = 'sq',
): Promise<Product[]> {
  const products = await getProducts(lang);
  return products.filter((p) => p.category === slug);
}

/**
 * Produkte që tregojnë nga një kategori e fshirë.
 *
 * Klienti do t'i fshijë kategoritë nga CMS-ja pa e menduar se ç'ka brenda.
 * Këto produkte nuk humbasin — dalin te /produktet si gjithmonë, thjesht nuk
 * kanë faqe kategorie. Njoftimi del në terminal që t'i biem në sy.
 */
export async function getOrphanProducts(lang: Lang = 'sq'): Promise<Product[]> {
  const [products, categories] = await Promise.all([
    getProducts(lang),
    getCategories(lang),
  ]);
  const known = new Set(categories.map((c) => c.slug));
  const orphans = products.filter((p) => !known.has(p.category));

  if (orphans.length > 0) {
    console.warn(
      `[katalogu] ${orphans.length} produkt(e) tregojnë nga një kategori që nuk ekziston: ` +
        orphans.map((p) => `${p.slug} → "${p.category}"`).join(', '),
    );
  }

  return orphans;
}

/**
 * Kategoritë që kanë të paktën një produkt brenda.
 * Filtrat te /produktet ndërtohen nga kjo — një filtër bosh nuk ndihmon askënd.
 */
/**
 * Postet e blogut për një gjuhë, më i riu i pari.
 * Draftet nuk dalin kurrë në build-in e publikimit.
 */
export async function getPosts(lang: Lang = 'sq') {
  const posts = await getCollection('posts');
  return posts
    .filter((p) => {
      if (p.data.lang !== lang || p.data.draft) return false;
      // Pa datë të vlefshme, blogu do të rendiste sipas 1 janarit 1970 dhe
      // shkrimi do të dilte me atë datë përpara lexuesit.
      if (!p.data.date) {
        njofto(`shkrimi "${p.id}": data mungon ose s'është e vlefshme. Shkrimi nuk u shfaq.`);
        return false;
      }
      return true;
    })
    .sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime());
}

/**
 * Gjen të njëjtin shkrim në gjuhën tjetër.
 *
 * Lidhja shkon në një drejtim: posti anglisht mban `translationOf` me slug-un
 * e postit shqip. Nëse përkthimi nuk ekziston ende, kthen `null` — dhe faqja
 * e dërgon lexuesin te lista e blogut, jo te një 404.
 */
export async function findTranslation(
  postId: string,
  from: Lang,
): Promise<string | null> {
  const posts = await getCollection('posts');

  if (from === 'sq') {
    const english = posts.find(
      (p) => p.data.lang === 'en' && p.data.translationOf === postId && !p.data.draft,
    );
    return english?.id ?? null;
  }

  const english = posts.find((p) => p.id === postId);
  const albanianId = english?.data.translationOf;
  if (!albanianId) return null;

  const albanian = posts.find(
    (p) => p.id === albanianId && p.data.lang === 'sq' && !p.data.draft,
  );
  return albanian?.id ?? null;
}

export function formatDate(date: Date, lang: Lang = 'sq') {
  const months = [
    'janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor',
    'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor',
  ];
  if (lang === 'en') {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
  // Shqipja shkruhet me dorë — Chrome-i nuk e ka lokalen 'sq'.
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function getCategoriesWithProducts(
  lang: Lang = 'sq',
): Promise<Array<Category & { count: number }>> {
  const [categories, products] = await Promise.all([
    getCategories(lang),
    getProducts(lang),
  ]);

  return categories
    .map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.slug).length,
    }))
    .filter((c) => c.count > 0);
}
