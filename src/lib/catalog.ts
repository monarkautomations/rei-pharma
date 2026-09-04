import { getCollection, type CollectionEntry } from 'astro:content';

export type Lang = 'sq' | 'en';

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
  return {
    slug: entry.id,
    name: lang === 'en' ? entry.data.name_en : entry.data.name_sq,
    blurb: lang === 'en' ? entry.data.blurb_en : entry.data.blurb_sq,
    order: entry.data.order,
  };
}

function toProduct(entry: CollectionEntry<'products'>, lang: Lang): Product {
  return {
    slug: entry.id,
    name: lang === 'en' ? entry.data.name_en : entry.data.name_sq,
    desc: lang === 'en' ? entry.data.desc_en : entry.data.desc_sq,
    price: entry.data.price,
    oldPrice: entry.data.oldPrice,
    category: entry.data.category,
    brand: entry.data.brand,
    image: entry.data.image,
    inStock: entry.data.inStock,
    featured: entry.data.featured,
    order: entry.data.order,
  };
}

export async function getCategories(lang: Lang = 'sq'): Promise<Category[]> {
  const entries = await getCollection('categories');
  return entries.map((e) => toCategory(e, lang)).sort(byOrder);
}

export async function getProducts(lang: Lang = 'sq'): Promise<Product[]> {
  const entries = await getCollection('products');
  return entries.map((e) => toProduct(e, lang)).sort(byOrder);
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
    .filter((p) => p.data.lang === lang && !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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
