/**
 * Tregon çfarë ka mbetur mangët te produktet e futura nga CMS-ja.
 *
 * Pse ekziston: klienti fut fotot, emrin, çmimin dhe kategorinë — pjesa që
 * vetëm ai i di. Pastaj plotësohet pjesa tjetër nga administrimi. Kjo komandë
 * është lista e punës: lexon çdo produkt dhe nxjerr atë që duhet prekur.
 *
 * Nuk ndryshon asgjë. Vetëm lexon dhe raporton.
 *
 * Përdorim:  npm run mungesat
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/products';
const PLACEHOLDER = '/produkt-placeholder.svg';

/**
 * Sa i shkurtër quhet "i mangët" një përshkrim.
 *
 * 20, jo 40. "Qumësht formulë për bebe 0-6 muaj." ka 34 shkronja dhe e thotë
 * saktësisht se ç'është produkti — nuk ka ç'i shtohet. Një prag i lartë do të
 * shënonte si punë të mbetur atë që është e mbaruar.
 */
const DESC_MIN = 20;

/**
 * Lexon frontmatter-in, bllokët YAML përfshirë.
 *
 * Versioni i parë i kësaj komande lexonte vetëm rreshtin e parë me regex, dhe
 * raportoi 39 "përshkrime të shkurtra" që në të vërtetë ishin blloqe të plota:
 * CMS-ja i shkruan si `desc_sq: |-` me tekstin te rreshtat poshtë. Raporti
 * gënjeu, dhe puna do të kishte nisur mbi një listë të rreme.
 *
 * Pa bibliotekë me qëllim: kjo komandë nis me dorë, jo në build, dhe një
 * varësi e trashëguar që mund të zhduket nuk ia vlen për njëzet rreshta.
 */
function frontmatter(teksti) {
  const rreshtat = teksti.split(/\r?\n/);
  if (rreshtat[0].trim() !== '---') return {};

  const dalje = {};
  let i = 1;

  while (i < rreshtat.length && rreshtat[i].trim() !== '---') {
    const koka = rreshtat[i].match(/^([A-Za-z_]\w*): ?(.*)$/);
    if (!koka) {
      i++;
      continue;
    }

    const celesi = koka[1];
    const vlera = koka[2].trim();

    // Bllok YAML: `|`, `|-`, `>`, `>-` — teksti rri te rreshtat me dhëmbëzim.
    if (/^[|>][-+]?$/.test(vlera)) {
      const trupi = [];
      i++;
      while (
        i < rreshtat.length &&
        rreshtat[i].trim() !== '---' &&
        (rreshtat[i].trim() === '' || /^\s/.test(rreshtat[i]))
      ) {
        trupi.push(rreshtat[i].trim());
        i++;
      }
      dalje[celesi] = trupi.join(' ').trim();
      continue;
    }

    dalje[celesi] = vlera.replace(/^["']|["']$/g, '').trim();
    i++;
  }

  return dalje;
}

/** Vlerat që CMS-ja shkruan kur fusha lihet bosh. */
const bosh = (v) => !v || v === 'null' || v === "''" || v === '""' || v === '[]';

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
const raporte = [];

for (const f of files.sort()) {
  const t = await readFile(join(DIR, f), 'utf8');
  const slug = f.replace(/\.md$/, '');
  const d = frontmatter(t);

  const name_sq = d.name_sq ?? '';
  const name_en = d.name_en ?? '';
  const desc_sq = d.desc_sq ?? '';
  const desc_en = d.desc_en ?? '';
  const brand = d.brand ?? '';
  const image = d.image ?? '';
  const category = d.category ?? '';

  const mungon = [];

  if (bosh(category)) mungon.push('kategoria');

  if (bosh(image) || image === PLACEHOLDER) mungon.push('fotoja');
  else if (!existsSync(join('public', decodeURIComponent(image)))) {
    mungon.push(`fotoja "${image}" nuk ekziston te public/`);
  }

  if (bosh(desc_sq)) mungon.push('përshkrimi shqip');
  else if (desc_sq.length < DESC_MIN) {
    mungon.push(`përshkrimi shqip i shkurtër (${desc_sq.length} shkronja)`);
  }

  if (bosh(desc_en)) mungon.push('përshkrimi anglisht');
  else if (desc_en === desc_sq) mungon.push('përshkrimi anglisht = shqipja');

  if (bosh(name_sq)) mungon.push('emri shqip');
  if (bosh(name_en)) mungon.push('emri anglisht');

  if (brand === 'PLACEHOLDER') mungon.push('marka shkruan PLACEHOLDER');

  if (mungon.length > 0) raporte.push({ slug, emri: name_sq || slug, mungon });
}

console.log('');

if (raporte.length === 0) {
  console.log(`${files.length} produkte. Asgjë për të plotësuar.`);
  console.log('');
  process.exit(0);
}

for (const r of raporte) {
  console.log(`  ${r.slug}`);
  console.log(`      ${r.emri}`);
  for (const m of r.mungon) console.log(`      · ${m}`);
  console.log('');
}

// Përmbledhja: ç'lloj mangësie është më e shpeshtë, që të dihet nga t'ia nisësh.
const sipasLlojit = new Map();
for (const r of raporte) {
  for (const m of r.mungon) {
    const lloji = m.replace(/ \(\d+ shkronja\)$/, '').replace(/"[^"]*"/, '…');
    sipasLlojit.set(lloji, (sipasLlojit.get(lloji) ?? 0) + 1);
  }
}

console.log(`${raporte.length} nga ${files.length} produkte kanë nevojë për diçka:`);
for (const [lloji, sa] of [...sipasLlojit].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(sa).padStart(3)}  ${lloji}`);
}
console.log('');
