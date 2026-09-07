import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Indeksi i kërkimit — file statik, i gjeneruar një herë në build.
 * Pa server, pa API. Kërkimi ndodh krejt në shfletues.
 *
 * Mbahet i vogël me qëllim: vetëm fushat që duhen për të gjetur dhe për të
 * treguar një rresht rezultati.
 */

/**
 * Sa nga përshkrimi hyn te indeksi.
 *
 * Përshkrimi nuk shfaqet asgjëkund — `src/lib/search.ts` e përdor vetëm për
 * përputhje, dhe me peshën më të ulët (10 pikë kundrejt 100 për emrin). Fjalia
 * e parë e thotë ç'është produkti; pjesa tjetër është udhëzim përdorimi dhe
 * përbërje, që askush nuk i shkruan te kutia e kërkimit.
 *
 * Pa këtë kufi indeksi u fry në 1,3 MB kur katalogu kaloi 1000 produktet —
 * dhe atë skedar e shkarkon çdo vizitor që shtyp te kërkimi ose hap faqen e
 * të preferuarave. Me kufirin, bie nën një të tretën.
 */
const DESC_INDEKS = 140;

const shkurt = (s: string) =>
  s.length <= DESC_INDEKS ? s : s.slice(0, DESC_INDEKS).replace(/\s+\S*$/, '');
export const GET: APIRoute = async () => {
  const [products, categories] = await Promise.all([
    getCollection('products'),
    getCollection('categories'),
  ]);

  const categoryName = new Map(
    categories.map((c) => [c.id, { sq: c.data.name_sq, en: c.data.name_en }]),
  );

  const index = products
    .sort((a, b) => a.data.order - b.data.order)
    .map((p) => ({
      slug: p.id,
      sq: p.data.name_sq,
      en: p.data.name_en,
      dsq: shkurt(p.data.desc_sq),
      den: shkurt(p.data.desc_en),
      brand: p.data.brand && p.data.brand !== 'PLACEHOLDER' ? p.data.brand : '',
      cat: categoryName.get(p.data.category)?.sq ?? '',
      caten: categoryName.get(p.data.category)?.en ?? '',
      price: p.data.price,
      image: p.data.image,
      stock: p.data.inStock,
    }));

  return new Response(JSON.stringify(index), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
