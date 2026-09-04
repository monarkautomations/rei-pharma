/**
 * Krahason adresën e çdo produkti me emrin e tij.
 *
 * Pse: adresa vjen nga emri i file-it dhe vendoset kur produkti krijohet.
 * Nëse klienti ripërdor një produkt ekzistues — hap një të vjetër dhe i ndërron
 * emrin, çmimin, foton — adresa mbetet duke treguar produktin e mëparshëm.
 * Ndodhi: `/produkt/omega-3/` hapte një vitaminë D3+K2.
 *
 * Nuk raporton çdo mospërputhje. Adresa më e shkurtër se emri është e mirë
 * (`krem-dielli-spf50` për "Krem dielli SPF 50+ për fytyrë"). Raportohet vetëm
 * kur adresa dhe emri nuk kanë asnjë fjalë të përbashkët — shenja që adresa
 * flet për një produkt krejt tjetër.
 *
 * Përdorim:  npm run slugs
 */
import { readdir, readFile } from 'node:fs/promises';

const DIR = 'src/content/products';

const pastro = (s) =>
  s.toLowerCase().replace(/ë/g, 'e').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, ' ').trim();

// Fjalë që nuk dallojnë asgjë: dalin te gjysma e produkteve.
const BOSHE = new Set(['30', '60', '90', '20', '10', 'kapsula', 'bustina', 'per', 'te', 'dhe', 'me', 'ne']);
const fjalet = (s) => new Set(pastro(s).split(' ').filter((w) => w.length > 2 && !BOSHE.has(w)));

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
let dyshime = 0;

for (const f of files.sort()) {
  const teksti = await readFile(`${DIR}/${f}`, 'utf8');
  const m = teksti.match(/^name_sq:\s*["']?(.+?)["']?\s*$/m);
  if (!m) continue;

  const slug = f.replace(/\.md$/, '');
  const emri = m[1];
  const nga_slug = fjalet(slug);
  const nga_emri = fjalet(emri);
  const perbashketa = [...nga_slug].filter((w) => nga_emri.has(w));

  if (nga_slug.size > 0 && perbashketa.length === 0) {
    dyshime++;
    console.log(`  /produkt/${slug}/`);
    console.log(`      hap: "${emri}"`);
    console.log('      Asnjë fjalë e përbashkët. Adresa duket se flet për produkt tjetër.');
  }
}

console.log('');
if (dyshime === 0) {
  console.log(`${files.length} produkte. Çdo adresë përputhet me produktin e vet.`);
} else {
  console.log(`${dyshime} adresë(a) duket se tregojnë produkt tjetër.`);
  console.log('Riemërto file-in te src/content/products/ dhe shto 301 te public/_redirects.');
}
