/**
 * Provon skemat kundrejt asaj që shkruan vërtet Sveltia CMS.
 *
 * Pse ekziston: klienti la bosh "Çmimi i vjetër", CMS-ja shkroi
 * `oldPrice: null`, skema priste numër ose asgjë — dhe build-i u ndal. Shtatë
 * commit-e të tijat, produkte të reja dhe fotot e para reale, mbetën pa dalë
 * online. Te CMS-ja s'kishte asnjë shenjë gabimi; gjithçka dukej e ruajtur.
 *
 * Rregulli: çdo fushë jo e detyrueshme te `public/admin/config.yml` duhet ta
 * durojë `null` dhe `""`. Kur shtohet fushë e re, shtoji rast këtu.
 *
 * Nis vetë para çdo build-i.
 */
import { categorySchema, productSchema, postSchema } from '../src/lib/schema.ts';

let deshtime = 0;

function duhetTeKaloje(emri, skema, hyrje, pritje = {}) {
  const r = skema.safeParse(hyrje);
  if (!r.success) {
    deshtime++;
    const arsyet = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    console.error(`  ✗ ${emri}\n      ${arsyet.join('\n      ')}`);
    return;
  }
  for (const [fusha, pritur] of Object.entries(pritje)) {
    const dole = r.data[fusha];
    const njesoj =
      pritur instanceof Date ? +dole === +pritur : dole === pritur;
    if (!njesoj) {
      deshtime++;
      console.error(`  ✗ ${emri}\n      ${fusha}: prisja ${JSON.stringify(pritur)}, mora ${JSON.stringify(dole)}`);
      return;
    }
  }
  console.log(`  ✓ ${emri}`);
}

function duhetTeBjere(emri, skema, hyrje) {
  if (skema.safeParse(hyrje).success) {
    deshtime++;
    console.error(`  ✗ ${emri} — kaloi, po duhej të binte`);
    return;
  }
  console.log(`  ✓ ${emri}`);
}

// Produkti minimal që CMS-ja shkruan kur mbushen vetëm fushat e detyrueshme.
const produktBaze = {
  name_sq: 'Emri',
  name_en: 'Name',
  price: 1200,
  category: 'vitamina-suplemente',
  desc_sq: 'Përshkrim',
  desc_en: 'Description',
};

console.log('\nProduktet — fusha të lëna bosh nga klienti:');

duhetTeKaloje('oldPrice: null (rasti që ndaloi build-in më 4 shtator)',
  productSchema, { ...produktBaze, oldPrice: null }, { oldPrice: undefined });

duhetTeKaloje("brand: '' (fushë teksti e lënë bosh)",
  productSchema, { ...produktBaze, brand: '' }, { brand: undefined });

duhetTeKaloje("image: '' → placeholder, jo src bosh",
  productSchema, { ...produktBaze, image: '' }, { image: '/produkt-placeholder.svg' });

duhetTeKaloje('image: null → placeholder',
  productSchema, { ...produktBaze, image: null }, { image: '/produkt-placeholder.svg' });

duhetTeKaloje('order: null → 99',
  productSchema, { ...produktBaze, order: null }, { order: 99 });

duhetTeKaloje('inStock: null → true',
  productSchema, { ...produktBaze, inStock: null }, { inStock: true });

duhetTeKaloje('featured: null → false',
  productSchema, { ...produktBaze, featured: null }, { featured: false });

duhetTeKaloje('të gjitha opsionalet null njëherësh',
  productSchema,
  { ...produktBaze, oldPrice: null, brand: null, image: null, order: null, inStock: null, featured: null },
  { oldPrice: undefined, image: '/produkt-placeholder.svg', order: 99, inStock: true, featured: false });

duhetTeKaloje('foto me hapësira në emër (WhatsApp shkruan kështu)',
  productSchema,
  { ...produktBaze, image: '/foto/WhatsApp Image 2026-09-04 at 8.04.57 PM.jpeg' },
  { image: '/foto/WhatsApp Image 2026-09-04 at 8.04.57 PM.jpeg' });

duhetTeKaloje('vetëm fushat e detyrueshme',
  productSchema, produktBaze, { image: '/produkt-placeholder.svg', order: 99, inStock: true });

console.log('\nProduktet — gabime që DUHET të bien:');
duhetTeBjere('pa çmim', productSchema, { ...produktBaze, price: undefined });
duhetTeBjere('çmim negativ', productSchema, { ...produktBaze, price: -5 });
duhetTeBjere('çmim si tekst', productSchema, { ...produktBaze, price: '1200' });

console.log('\nKategoritë:');
const kategoriBaze = { name_sq: 'A', name_en: 'A', blurb_sq: 'B', blurb_en: 'B' };
duhetTeKaloje('order: null → 99', categorySchema, { ...kategoriBaze, order: null }, { order: 99 });
duhetTeKaloje('vetëm fushat e detyrueshme', categorySchema, kategoriBaze, { order: 99 });

console.log('\nShkrimet e blogut:');
const postBaze = { title: 'T', excerpt: 'E', date: '2026-01-01' };
duhetTeKaloje('cover/tag/translationOf bosh',
  postSchema, { ...postBaze, cover: '', tag: '', translationOf: '', coverAlt: '' },
  { cover: undefined, tag: undefined, translationOf: undefined });
duhetTeKaloje('updated: null', postSchema, { ...postBaze, updated: null }, { updated: undefined });
duhetTeKaloje('lang: null → sq', postSchema, { ...postBaze, lang: null }, { lang: 'sq' });
duhetTeKaloje('draft: null → false', postSchema, { ...postBaze, draft: null }, { draft: false });
duhetTeKaloje("author: '' → Farmaci Rei",
  postSchema, { ...postBaze, author: '' }, { author: 'Farmaci Rei' });

if (deshtime > 0) {
  console.error(`\n${deshtime} provë(a) dështuan. Skema nuk e duron daljen e CMS-së.\n`);
  process.exit(1);
}
console.log('\nSkema i duron të gjitha fushat bosh që shkruan CMS-ja.\n');
