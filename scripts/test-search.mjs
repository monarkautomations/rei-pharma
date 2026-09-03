import { searchProducts } from '../src/lib/search.ts';

const items = [
  { slug: 'krem-dielli-spf50', sq: 'Krem dielli SPF 50+ për fytyrë', en: 'Face sunscreen SPF 50+', dsq: 'Mbrojtje e lartë nga rrezet UVA dhe UVB.', den: '', brand: '', cat: 'Kujdesi ndaj diellit', caten: 'Sun care', price: 2400, image: '', stock: true },
  { slug: 'after-sun-locion', sq: 'Locion qetësues pas diellit', en: 'After-sun lotion', dsq: 'Freskon dhe hidraton lëkurën pas ekspozimit në diell. Me aloe vera.', den: '', brand: '', cat: 'Kujdesi ndaj diellit', caten: 'Sun care', price: 1600, image: '', stock: true },
  { slug: 'vitamine-d3', sq: 'Vitaminë D3 2000 IU — 60 kapsula', en: 'Vitamin D3', dsq: 'Mbështet shëndetin e kockave.', den: '', brand: '', cat: 'Vitamina & suplemente', caten: 'Vitamins', price: 1200, image: '', stock: true },
  { slug: 'shampo-kunder-renies', sq: 'Shampo kundër rënies së flokëve', en: 'Anti hair-loss shampoo', dsq: 'Forcon rrënjën dhe qetëson skalpin.', den: '', brand: '', cat: 'Kujdesi ndaj flokëve', caten: 'Hair care', price: 2100, image: '', stock: true },
  { slug: 'omega-3', sq: 'Omega-3 vaj peshku — 90 kapsula', en: 'Omega-3', dsq: 'EPA dhe DHA për zemrën.', den: '', brand: '', cat: 'Vitamina & suplemente', caten: 'Vitamins', price: 2200, image: '', stock: false },
];

const cases = ['krem', 'flokeve', 'flokëve', 'shampo', 'vitamin', 'diell', 'krem dielli', 'kapsula', 'xyz', 'aloe'];
for (const q of cases) {
  const r = searchProducts(items, q);
  console.log(`"${q}"`.padEnd(16), '->', r.length ? r.map(x => x.slug).join(', ') : '(asgje)');
}
