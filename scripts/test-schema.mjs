/**
 * Provon skemat kundrejt asaj që shkruan vërtet Sveltia CMS — dhe kundrejt
 * asaj që klienti mund të shkruajë gabim.
 *
 * Pse ekziston: klienti la bosh "Çmimi i vjetër", CMS-ja shkroi
 * `oldPrice: null`, skema priste numër ose asgjë — dhe build-i u ndal. Shtatë
 * commit-e të tijat, dy produkte të reja dhe katër fotot e para reale, mbetën
 * pa dalë online. Te CMS-ja nuk kishte asnjë shenjë; gjithçka dukej e ruajtur.
 *
 * Kontrata tani: **skema nuk dështon kurrë.** Vlera e gabuar zëvendësohet me
 * një të arsyeshme; `src/lib/catalog.ts` vendos pastaj nëse hyrja mund të
 * shfaqet. Kur shtohet fushë e re te `public/admin/config.yml`, shtoji rast këtu.
 *
 * Nis vetë para çdo build-i.
 */
import { categorySchema, productSchema, postSchema } from '../src/lib/schema.ts';

let deshtime = 0;
const rresht = () => console.log('');

function duhetTeKaloje(emri, skema, hyrje, pritje = {}) {
  const r = skema.safeParse(hyrje);
  if (!r.success) {
    deshtime++;
    console.error(`  x ${emri}`);
    for (const i of r.error.issues) {
      console.error(`      ${i.path.join('.') || '(rrënja)'}: ${i.message}`);
    }
    return;
  }
  for (const [fusha, pritur] of Object.entries(pritje)) {
    const dole = r.data[fusha];
    const njesoj = pritur instanceof Date ? +dole === +pritur : dole === pritur;
    if (!njesoj) {
      deshtime++;
      console.error(`  x ${emri}`);
      console.error(`      ${fusha}: prisja ${JSON.stringify(pritur)}, mora ${JSON.stringify(dole)}`);
      return;
    }
  }
  console.log(`  ok ${emri}`);
}

const PLACEHOLDER = '/produkt-placeholder.svg';

// Produkti minimal që CMS-ja shkruan kur mbushen vetëm fushat e detyrueshme.
const produktBaze = {
  name_sq: 'Emri',
  name_en: 'Name',
  price: 1200,
  category: 'vitamina-suplemente',
  desc_sq: 'Përshkrim',
  desc_en: 'Description',
};

rresht();
console.log('Produktet — fusha të lëna bosh nga klienti:');

duhetTeKaloje('oldPrice: null (rasti që ndaloi build-in më 4 shtator)',
  productSchema, { ...produktBaze, oldPrice: null }, { oldPrice: undefined });
duhetTeKaloje('brand bosh', productSchema, { ...produktBaze, brand: '' }, { brand: undefined });
duhetTeKaloje('image bosh → placeholder, jo src bosh',
  productSchema, { ...produktBaze, image: '' }, { image: PLACEHOLDER });
duhetTeKaloje('image: null → placeholder',
  productSchema, { ...produktBaze, image: null }, { image: PLACEHOLDER });
duhetTeKaloje('order: null → 99', productSchema, { ...produktBaze, order: null }, { order: 99 });
duhetTeKaloje('inStock: null → true', productSchema, { ...produktBaze, inStock: null }, { inStock: true });
duhetTeKaloje('featured: null → false', productSchema, { ...produktBaze, featured: null }, { featured: false });
duhetTeKaloje('të gjitha opsionalet null njëherësh',
  productSchema,
  { ...produktBaze, oldPrice: null, brand: null, image: null, order: null, inStock: null, featured: null },
  { oldPrice: undefined, image: PLACEHOLDER, order: 99, inStock: true, featured: false });
duhetTeKaloje('foto me hapësira në emër (WhatsApp shkruan kështu)',
  productSchema,
  { ...produktBaze, image: '/foto/WhatsApp Image 2026-09-04 at 8.04.57 PM.jpeg' },
  { image: '/foto/WhatsApp Image 2026-09-04 at 8.04.57 PM.jpeg' });
duhetTeKaloje('vetëm fushat e detyrueshme',
  productSchema, produktBaze, { image: PLACEHOLDER, order: 99, inStock: true });

rresht();
console.log('Produktet — vlera të papërdorshme bëhen 0, build-i nuk ndalet:');
duhetTeKaloje('pa çmim → 0', productSchema, { ...produktBaze, price: undefined }, { price: 0 });
duhetTeKaloje('çmim negativ → 0', productSchema, { ...produktBaze, price: -5 }, { price: 0 });
duhetTeKaloje('çmim 0 → 0', productSchema, { ...produktBaze, price: 0 }, { price: 0 });
duhetTeKaloje('çmim pa shifra → 0', productSchema, { ...produktBaze, price: 'falas' }, { price: 0 });

rresht();
console.log('Produktet — vlera të shpëtueshme:');
duhetTeKaloje('"1200" si tekst → 1200', productSchema, { ...produktBaze, price: '1200' }, { price: 1200 });
duhetTeKaloje('"2400 L" → 2400', productSchema, { ...produktBaze, price: '2400 L' }, { price: 2400 });
duhetTeKaloje('1250.6 → 1251', productSchema, { ...produktBaze, price: 1250.6 }, { price: 1251 });
duhetTeKaloje('inStock: "po" → true', productSchema, { ...produktBaze, inStock: 'po' }, { inStock: true });
duhetTeKaloje('inStock: "jo" → false', productSchema, { ...produktBaze, inStock: 'jo' }, { inStock: false });
duhetTeKaloje('inStock i pakuptueshëm → true (parazgjedhja)',
  productSchema, { ...produktBaze, inStock: 'xyz' }, { inStock: true });
duhetTeKaloje('order: "dy" → 99', productSchema, { ...produktBaze, order: 'dy' }, { order: 99 });
duhetTeKaloje('image si numër → placeholder',
  productSchema, { ...produktBaze, image: 123 }, { image: PLACEHOLDER });
duhetTeKaloje('name_sq mungon → bosh', productSchema, { ...produktBaze, name_sq: undefined }, { name_sq: '' });
duhetTeKaloje('desc mungon → bosh', productSchema, { ...produktBaze, desc_sq: undefined }, { desc_sq: '' });
duhetTeKaloje('oldPrice: 0 → mungon', productSchema, { ...produktBaze, oldPrice: 0 }, { oldPrice: undefined });
duhetTeKaloje('frontmatter krejt bosh nuk e ndal build-in',
  productSchema, {}, { price: 0, name_sq: '', order: 99 });

rresht();
console.log('Kategoritë:');
const kategoriBaze = { name_sq: 'A', name_en: 'A', blurb_sq: 'B', blurb_en: 'B' };
duhetTeKaloje('order: null → 99', categorySchema, { ...kategoriBaze, order: null }, { order: 99 });
duhetTeKaloje('order: "a" → 99', categorySchema, { ...kategoriBaze, order: 'a' }, { order: 99 });
duhetTeKaloje('vetëm fushat e detyrueshme', categorySchema, kategoriBaze, { order: 99 });
duhetTeKaloje('blurb mungon → bosh', categorySchema, { name_sq: 'A', name_en: 'A' }, { blurb_sq: '' });
duhetTeKaloje('kategori krejt bosh nuk e ndal build-in', categorySchema, {}, { name_sq: '', order: 99 });

rresht();
console.log('Shkrimet e blogut:');
const postBaze = { title: 'T', excerpt: 'E', date: '2026-01-01' };
duhetTeKaloje('cover/tag/translationOf bosh',
  postSchema, { ...postBaze, cover: '', tag: '', translationOf: '', coverAlt: '' },
  { cover: undefined, tag: undefined, translationOf: undefined });
duhetTeKaloje('updated: null', postSchema, { ...postBaze, updated: null }, { updated: undefined });
duhetTeKaloje('lang: null → sq', postSchema, { ...postBaze, lang: null }, { lang: 'sq' });
duhetTeKaloje('lang i panjohur → sq', postSchema, { ...postBaze, lang: 'fr' }, { lang: 'sq' });
duhetTeKaloje('draft: null → false', postSchema, { ...postBaze, draft: null }, { draft: false });
duhetTeKaloje('author bosh → Farmaci Rei', postSchema, { ...postBaze, author: '' }, { author: 'Farmaci Rei' });
duhetTeKaloje('date e pavlefshme → null (posti fshihet, build-i vazhdon)',
  postSchema, { title: 'T', excerpt: 'E', date: 'jo-date' }, { date: null });
duhetTeKaloje('date mungon → null', postSchema, { title: 'T', excerpt: 'E' }, { date: null });
duhetTeKaloje('post krejt bosh nuk e ndal build-in', postSchema, {}, { title: '', date: null, draft: false });

rresht();
if (deshtime > 0) {
  console.error(`${deshtime} provë(a) dështuan. Skema nuk e duron daljen e CMS-së.`);
  rresht();
  process.exit(1);
}
console.log('Skema i duron të gjitha fushat bosh dhe të gabuara që shkruan CMS-ja.');
rresht();
