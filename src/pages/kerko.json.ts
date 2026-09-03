import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Indeksi i kërkimit — file statik, i gjeneruar një herë në build.
 * Pa server, pa API. Kërkimi ndodh krejt në shfletues.
 *
 * Mbahet i vogël me qëllim: vetëm fushat që duhen për të gjetur dhe për të
 * treguar një rresht rezultati. Me qindra produkte mbetet nën 100 KB.
 */
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
      dsq: p.data.desc_sq,
      den: p.data.desc_en,
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
