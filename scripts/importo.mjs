/**
 * Importon produkte nga katalogu i FarmaCity (farma-city.al) te ky site.
 *
 * Ekziston sepse klienti ra dakord me FarmaCity për përdorimin e produkteve.
 * Merr atë që klienti do ta fuste vetë nga CMS-ja — emrin, çmimin, foton dhe
 * kategorinë — dhe asgjë më shumë pa u kërkuar shprehimisht.
 *
 * Burimi është API-ja publike e WooCommerce-it (Store API), jo leximi i HTML-së.
 * Kjo do të thotë të dhëna të pastra: çmimi si numër, kategoritë si listë,
 * fotoja si adresë. Asgjë nuk hamendësohet nga pamja e faqes.
 *
 *   node scripts/importo.mjs                      vetëm raport, nuk shkruan asgjë
 *   node scripts/importo.mjs --vetem-tonat        vetëm kategoritë që Rei ka sot
 *   node scripts/importo.mjs --kategori=fytyra    një degë e vetme e FarmaCity-t
 *   node scripts/importo.mjs --kufi=200           sa produkte më së shumti
 *   node scripts/importo.mjs --pa-pershkrime      pa asnjë përshkrim
 *   node scripts/importo.mjs --foto-shtese        deri në 4 foto për produkt
 *   node scripts/importo.mjs --shkruaj            shkruan vërtet
 *
 * Pa `--shkruaj` nuk prek asnjë skedar. Ky është import i madh mbi një site të
 * gjallë klienti; hapi i parë nuk duhet të jetë kurrë i pakthyeshëm.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const BURIMI = 'https://www.farma-city.al/wp-json/wc/store/v1';
const PRODUKTET = 'src/content/products';
const KATEGORITE = 'src/content/categories';
const FOTOT = 'public/foto';

/* ------------------------------------------------------------------ *
 * Kategoritë
 *
 * FarmaCity ka 254 kategori në pemë me tre nivele. Rei nuk ka nevojë për aq:
 * një filtër me 254 zëra nuk është filtër. Poshtë është përkthimi nga degët e
 * tyre te kategoritë e Rei-t, i renditur — fiton rregulli i parë që përputhet,
 * ndaj i veçanti rri para të përgjithshmit.
 *
 * Shembull pse renditja ka rëndësi: një krem dielli për bebe mban edhe
 * `nenafemija` edhe `mbrojtja-ndaj-diellit`. Kush kërkon krem dielli e kërkon
 * te dielli, ndaj dielli rri më lart.
 * ------------------------------------------------------------------ */
const RREGULLAT = [
  ['aparate-tensioni', ['aparate-tensioni']],
  ['cajra', ['cajra', 'cajra-ushqyrja', 'bime']],
  ['kujdesi-ndaj-diellit', [
    'kujdesi-ndaj-diellit', 'mbrojtja-ndaj-diellit', 'kujdesi-ndaj-diellit-trupi',
    'kujdesi-ndaj-diellit-floket', 'autoabronzante',
  ]],
  ['kujdesi-ndaj-bebes', ['nenafemija']],
  ['kujdesi-oral', ['goja']],
  ['diabeti', ['diabeti']],
  ['ndihma-e-pare', [
    'ndihmaepare', 'konsumfasha', 'djegiet', 'dhimbje-muskulare-hematoma',
    'kujdesi-ndaj-tatuazheve',
  ]],
  ['syri-hunda-veshi', ['syri', 'produkte-per-hunde', 'produkte-per-veshe']],
  ['pajisje-mjekesore', ['monitoruesiteshendetit', 'ortopedike']],
  ['higjena-intime', [
    'zona-intime', 'mireqenia-seksuale-farmaci', 'higjene-farmaci', 'higjene',
    'planifikimi-familjar',
  ]],
  ['barna-otc', ['farmaci', 'alergji-antihistaminik', 'elektrolite']],
  ['vitamina-suplemente', ['shtesavitamina', 'omega', 'fermente-laktike']],
  ['kujdesi-ndaj-flokeve', ['floket']],
  ['kujdesi-ndaj-fytyres', ['fytyra']],
  ['make-up', ['make-up', 'fragrances']],
  ['duart-dhe-kembet', ['duart', 'kembet', 'kembet-farmaci']],
  // `aromaterapi` rri te trupi, jo te make-up: vajrat esencialë të Salvia-s
  // shiten për masazh e inhalim, dhe "Make up dhe aroma" do t'i paraqiste si
  // kozmetikë dekorative. Provuar mbi "Salvia – Vaj Dafine".
  ['kujdesi-ndaj-trupit', ['trupi', 'per-meshkuj', 'dobesim', 'aromaterapi', 'dermokozmetike']],
];

/** Kategoritë e reja që duhen krijuar, me tekstin e vet në të dyja gjuhët. */
const TE_REJAT = {
  'kujdesi-ndaj-fytyres': {
    name_sq: 'Kujdesi ndaj fytyrës', name_en: 'Face care',
    blurb_sq: 'Kremra, serume dhe pastrues për çdo lloj lëkure.',
    blurb_en: 'Creams, serums and cleansers for every skin type.',
  },
  'make-up': {
    name_sq: 'Make up dhe aroma', name_en: 'Make up & fragrance',
    blurb_sq: 'Produkte dekorative, parfume dhe vajra aromatikë.',
    blurb_en: 'Decorative products, perfumes and aromatic oils.',
  },
  'duart-dhe-kembet': {
    name_sq: 'Duart dhe këmbët', name_en: 'Hands & feet',
    blurb_sq: 'Kujdesi për duart, thonjtë dhe këmbët.',
    blurb_en: 'Care for hands, nails and feet.',
  },
  'higjena-intime': {
    name_sq: 'Higjena intime', name_en: 'Intimate hygiene',
    blurb_sq: 'Produkte higjiene për përdorim të përditshëm.',
    blurb_en: 'Hygiene products for everyday use.',
  },
  'barna-otc': {
    name_sq: 'Barna pa recetë', name_en: 'Over-the-counter',
    blurb_sq: 'Barna që shiten pa recetë mjeku. Barnat me recetë nuk shiten online.',
    blurb_en: 'Medicines sold without a prescription. Prescription drugs are not sold online.',
  },
  'ndihma-e-pare': {
    name_sq: 'Ndihma e parë', name_en: 'First aid',
    blurb_sq: 'Fasha, dezinfektues dhe çfarë duhet të ketë çdo shtëpi.',
    blurb_en: 'Bandages, antiseptics and what every home should keep.',
  },
  diabeti: {
    name_sq: 'Diabeti', name_en: 'Diabetes',
    blurb_sq: 'Matës glicemie, shirita dhe produkte mbështetëse.',
    blurb_en: 'Glucose meters, strips and supporting products.',
  },
  'syri-hunda-veshi': {
    name_sq: 'Sy, hundë dhe veshë', name_en: 'Eyes, nose & ears',
    blurb_sq: 'Pika, sprucime dhe pastrues për sytë, hundën dhe veshët.',
    blurb_en: 'Drops, sprays and cleansers for eyes, nose and ears.',
  },
  'pajisje-mjekesore': {
    name_sq: 'Pajisje mjekësore', name_en: 'Medical devices',
    blurb_sq: 'Termometra, oksimetra dhe pajisje ndihmëse.',
    blurb_en: 'Thermometers, oximeters and assistive devices.',
  },
};

/**
 * Si quhet secili lloj në anglisht.
 *
 * Ndarë nga `name_en` i kategorisë me qëllim: ai është titull faqeje ("Face
 * care"), ky rri brenda një fjalie ("Face care from Vichy."). Njëri mund të
 * ndryshojë pa e prishur tjetrin.
 */
const LLOJI_EN = {
  'aparate-tensioni': 'blood pressure monitor',
  cajra: 'herbal tea',
  'kujdesi-ndaj-diellit': 'sun care',
  'kujdesi-ndaj-bebes': 'baby and mother care',
  'kujdesi-oral': 'oral care',
  diabeti: 'diabetes care product',
  'ndihma-e-pare': 'first aid product',
  'syri-hunda-veshi': 'eye, nose and ear care',
  'pajisje-mjekesore': 'medical device',
  'higjena-intime': 'intimate hygiene product',
  'barna-otc': 'over-the-counter product',
  'vitamina-suplemente': 'food supplement',
  'kujdesi-ndaj-flokeve': 'hair care',
  'kujdesi-ndaj-fytyres': 'face care',
  'make-up': 'make-up product',
  'duart-dhe-kembet': 'hand and foot care',
  'kujdesi-ndaj-trupit': 'body care',
};

/**
 * Degë që nuk hyjnë fare.
 *
 * `gift-card` nuk është produkt farmacie. `uncategorized` do të thotë që as
 * ata vetë nuk e dinë ku e kanë vendin.
 */
const JASHTE = new Set(['gift-card', 'uncategorized']);

/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const flamur = (emer) => args.includes(`--${emer}`);
const vlere = (emer) => {
  const a = args.find((x) => x.startsWith(`--${emer}=`));
  return a ? a.slice(emer.length + 3) : null;
};

const SHKRUAJ = flamur('shkruaj');
const VETEM_TONAT = flamur('vetem-tonat');
const ME_PERSHKRIME = !flamur('pa-pershkrime');
const FOTO_SHTESE = flamur('foto-shtese');
const KUFI = Number(vlere('kufi')) || Infinity;
const KATEGORIA = vlere('kategori');

/** Entitetet HTML që WordPress-i fut te emrat: `&#8211;`, `&#038;`, `&amp;`. */
function pastroTekstin(s) {
  return String(s ?? '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function pastroHtml(s) {
  const pa = String(s ?? '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ');
  return pa
    .split('\n')
    .map((r) => pastroTekstin(r))
    .filter(Boolean)
    .join('\n');
}

/* ------------------------------------------------------------------ *
 * Përshkrimet
 *
 * Teksti i FarmaCity-t nuk kopjohet ashtu siç është. Faqja e tyre është
 * ndërtuar ndryshe: rreshti i parë përsërit emrin e produktit (te ne emri
 * është `<h1>` pikërisht sipër), pastaj vijnë tituj seksionesh —
 * "Karakteristikat kryesore", "Udhëzime mbi përdorimin" — që te ne s'kanë ku
 * shfaqen, sepse përshkrimi është një paragraf i vetëm.
 *
 * Ndaj teksti rindërtohet në formën që përdor ky site, të njëjtën që ka
 * `trudi-delicate-cologne.md` të shkruar me dorë: një paragraf çfarë është,
 * pastaj "Përdorimi:" nëse dihet.
 *
 * Nuk shtohet asnjë fjalë e re. Vetëm zgjidhet, shkurtohet dhe rirenditet ajo
 * që ekziston — pretendimet shëndetësore te një farmaci nuk dalin nga kodi.
 * ------------------------------------------------------------------ */

/** Tituj seksionesh që te ne nuk kanë ku shfaqen. */
const TITUJ = [
  ['perdorim', 'Përdorimi'],
  ['udhezime', 'Përdorimi'],
  ['menyra e perdorimit', 'Përdorimi'],
  ['dozimi', 'Përdorimi'],
  ['perberja', 'Përbërja'],
  ['perberesit', 'Përbërja'],
  ['ingredientet', 'Përbërja'],
  ['paralajmerime', 'Kujdes'],
  ['kujdes', 'Kujdes'],
  ['aplikimi', 'Përdorimi'],
  ['ruajtja', 'Kujdes'],
  ['kontraindikacionet', 'Kujdes'],
  ['karakteristikat', null],
  ['indikacionet', null],
  ['pershkrimi', null],
  ['benefitet', null],
  ['perfitimet', null],
  ['avantazhet', null],
  ['vetite', null],
  ['veti', null],
  ['si vepron', null],
  ['per ke', null],
  ['informacion', null],
  ['te dhena', null],
  ['detaje', null],
];

/** Pa theksa dhe pa shenja, që titujt të njihen si i shkruan kushdo. */
function pathekse(s) {
  return s
    .toLowerCase()
    .replace(/ë/g, 'e').replace(/ç/g, 'c')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Titull seksioni? Kthen etiketën tonë, `null` për ta hedhur, `false` nëse s'është.
 *
 * Vetëm gjatësia nuk mjafton si provë. "Përdorimi i këtij produkti është i
 * thjeshtë." ka 43 shkronja dhe do të zhdukej si titull, duke marrë me vete
 * fjalinë e parë të përshkrimit. Titujt e vërtetë nuk mbarojnë me pikë dhe
 * nuk kalojnë pesë fjalë.
 */
function titulli(rreshti) {
  if (rreshti.length > 46 || /[.!?]$/.test(rreshti.trim())) return false;
  const p = pathekse(rreshti);
  if (!p || p.split(' ').length > 5) return false;
  for (const [shenja, etiketa] of TITUJ) if (p.startsWith(shenja)) return etiketa;
  return false;
}

/** Pret te fundi i fjalisë së fundit që nis brenda kufirit. */
function shkurto(tekst, kufi) {
  if (tekst.length <= kufi) return tekst;
  const cope = tekst.slice(0, kufi);
  const fundi = Math.max(cope.lastIndexOf('. '), cope.lastIndexOf('! '), cope.lastIndexOf('? '));
  return (fundi > kufi * 0.4 ? cope.slice(0, fundi + 1) : cope.replace(/\s+\S*$/, '') + '…').trim();
}

/**
 * A e përsërit ky rresht emrin e produktit?
 *
 * Krahasimi bëhet me fjalë, jo me tekst: "Froika Purifying Nettle Shampoo" te
 * titulli dhe "Froika Purifying Nettle Shampoo 200ml" te teksti janë i njëjti
 * rresht i tepërt, edhe pse s'janë i njëjti varg.
 */
function eshtePersëritje(rreshti, emriPlote) {
  if (rreshti.length > emriPlote.length * 2 + 30) return false;
  const a = new Set(pathekse(emriPlote).split(' ').filter((w) => w.length > 2));
  const b = pathekse(rreshti).split(' ').filter((w) => w.length > 2);
  if (a.size === 0 || b.length === 0) return false;
  const perbashket = b.filter((w) => a.has(w)).length;
  return perbashket / a.size >= 0.7;
}

/** Emri i konkurrentit nuk qëndron te faqja e Rei-t. */
const KONKURRENTI = /farma\s*-?\s*city|farmacity/gi;

function pershtatShqip(html, emriPlote) {
  const rreshtat = pastroHtml(html)
    .split('\n')
    .map((r) => r.replace(KONKURRENTI, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const hyrja = [];
  const seksionet = new Map();

  // `null` nga `titulli()` do të thotë titull që hidhet — teksti nën të është
  // përshkrim i zakonshëm ("Karakteristikat kryesore" ndiqet nga fjali të
  // dobishme), ndaj kthehet te hyrja, jo te një seksion i vetin.
  let tani = null;

  for (const r of rreshtat) {
    const t = titulli(r);
    if (t !== false) { tani = t; continue; }
    if (tani === null) {
      if (hyrja.length === 0 && eshtePersëritje(r, emriPlote)) continue;
      hyrja.push(r);
      continue;
    }
    if (!seksionet.has(tani)) seksionet.set(tani, []);
    seksionet.get(tani).push(r);
  }

  // Fjalitë e hyrjes bashkohen në një paragraf; rreshtat e shkurtër te
  // FarmaCity janë pika liste, dhe si pika liste do të dukeshin të prera.
  const nje = (rreshtat) =>
    rreshtat
      .map((r) => (/[.!?…]$/.test(r) ? r : `${r}.`))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

  const paragrafet = [];
  const kryesori = shkurto(nje(hyrja), 620);
  if (kryesori) paragrafet.push(kryesori);

  for (const etiketa of ['Përdorimi', 'Përbërja', 'Kujdes']) {
    const rr = seksionet.get(etiketa);
    if (!rr || !rr.length) continue;
    const teksti = shkurto(nje(rr), etiketa === 'Përdorimi' ? 340 : 240);
    if (teksti) paragrafet.push(`${etiketa}: ${teksti}`);
  }

  // Pa hyrje por me udhëzime, paragrafi i vetëm do të niste me "Përdorimi:"
  // pa thënë kurrë ç'është produkti. Më mirë asgjë sesa aq.
  if (!kryesori) return '';

  return paragrafet.join('\n\n');
}

/**
 * Anglishtja ndërtohet nga faktet, nuk përkthehet.
 *
 * FarmaCity nuk ka version anglisht — u kontrollua: `/en/` kthen 404 dhe s'ka
 * asnjë shtojcë përkthimi. Pra burim anglisht nuk ekziston, dhe një përkthim
 * i bërë nga kodi mbi 5579 tekste farmaceutike do të prodhonte pretendime
 * shëndetësore që nuk i ka shkruar askush.
 *
 * Ndaj këtu shkruhet vetëm ajo që dihet me siguri: çfarë është produkti, kush
 * e bën, sa është dhe ku blihet. E shkurtër, e vërtetë, dhe kurrë premtim.
 */
function anglishtja({ emri, marka, kategoria, sasia }) {
  const koka = [marka, emri].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const me_sasi = sasia ? `${koka}, ${sasia}` : koka;

  // Emri i kategorisë përkthyer fjalë për fjalë jepte "A make up & fragrance
  // product by Salvia" — anglishte e ngathët. Këtu rri emërtimi që përdoret
  // vërtet në anglisht për atë lloj produkti.
  const lloji = LLOJI_EN[kategoria] ?? 'pharmacy product';
  const kokëshkronjë = lloji.charAt(0).toUpperCase() + lloji.slice(1);
  const dyta = marka ? `${kokëshkronjë} from ${marka}.` : `${kokëshkronjë}.`;

  return `${me_sasi}. ${dyta} Available at Farmaci Rei in Tirana — order online and pay on delivery.`;
}

/** Sasia nga emri: "400ml", "30 caps", "12 copë". Vetëm nëse është e shkruar. */
function nxirrSasine(emri) {
  const m = emri.match(
    /(\d+(?:[.,]\d+)?)\s?(ml|mL|l|g|gr|mg|kg|cps|caps?|capsules|tablets|tabs|cope|copë|pcs|sachets|bustina)\b/i,
  );
  if (!m) return '';
  const njesia = m[2].toLowerCase().replace('copë', 'pcs').replace('cope', 'pcs');
  return `${m[1]} ${njesia}`;
}

/**
 * Marka nxirret nga emri vetëm kur ndarësi është vizë e gjatë.
 *
 * FarmaCity i shkruan emrat si "Vichy – Dercos Shampoo". Viza e shkurtër `-`
 * nuk vlen si shenjë: "Omega-3" do të kthehej në markën "Omega".
 */
function ndajMarken(emri) {
  const i = emri.indexOf(' – ');
  if (i === -1) return { marka: '', emri };
  const marka = emri.slice(0, i).trim();
  const mbetja = emri.slice(i + 3).trim();
  if (!marka || !mbetja || marka.length > 40) return { marka: '', emri };
  return { marka, emri: mbetja };
}

/** Bllok YAML shumërreshtësh, siç i shkruan edhe CMS-ja. */
function bllok(celes, tekst) {
  if (!tekst) return `${celes}: ''`;
  return `${celes}: |-\n${tekst.split('\n').map((r) => `  ${r}`.trimEnd()).join('\n')}`;
}

/** Vlerë e vetme YAML, gjithmonë me thonjëza — emrat kanë `:` dhe `&`. */
function vlereYaml(s) {
  return `'${String(s ?? '').replace(/'/g, "''")}'`;
}

async function merrKategorite() {
  const te_gjitha = [];
  for (let f = 1; f <= 6; f++) {
    const r = await fetch(`${BURIMI}/products/categories?per_page=100&page=${f}`);
    if (!r.ok) break;
    const a = await r.json();
    if (!a.length) break;
    te_gjitha.push(...a);
    if (a.length < 100) break;
  }
  return te_gjitha;
}

async function merrProduktet() {
  const out = [];
  for (let f = 1; f <= 80; f++) {
    const r = await fetch(`${BURIMI}/products?per_page=100&page=${f}`);
    if (!r.ok) break;
    const a = await r.json();
    if (!a.length) break;
    out.push(...a);
    process.stdout.write(`\r  po lexoj katalogun… ${out.length} produkte   `);
    if (a.length < 100) break;
  }
  process.stdout.write('\r                                        \r');
  return out;
}

/**
 * Kategoritë e një produkti bashkë me prindërit e tyre.
 *
 * API-ja jep vetëm kategoritë e caktuara drejtpërdrejt, jo pemën mbi to —
 * 1161 produkte nga 6307 nuk mbanin asnjë kategori rrënjë. Pa këtë hap, secili
 * prej tyre do të mbetej pa kategori te Rei.
 */
function meGjithePrinderit(sllugat, pema) {
  const dalje = new Set();
  for (const s of sllugat) {
    dalje.add(s);
    let k = pema.sipasSllugut.get(s);
    let siguri = 0;
    while (k && siguri++ < 10) {
      dalje.add(k.slug);
      k = k.parent ? pema.sipasId.get(k.parent) : null;
    }
  }
  return dalje;
}

function zgjidhKategorine(sllugat) {
  for (const [reja, burimet] of RREGULLAT) {
    if (burimet.some((b) => sllugat.has(b))) return reja;
  }
  return null;
}

/**
 * Slug-u i pastruar për emër skedari dhe adresë.
 *
 * WordPress-i i kodon shkronjat jo-ASCII te slug-u: "Vitamin 5C³" del si
 * `vitamin-5c%c2%b3`. Ai varg bëhet edhe emër skedari edhe adresë, dhe të dyja
 * prishen — shfletuesi e dekodon `%c2%b3` në `³` dhe kërkon një skedar që në
 * disk quhet fjalë për fjalë `%c2%b3`. Fotoja del e thyer pa asnjë gabim në
 * build. Ndodhi njëherë; këtu ndalet.
 */
function slugPastruar(slug) {
  let s = slug;
  try {
    s = decodeURIComponent(slug);
  } catch {
    // Përqindje e vetmuar që s'është kod i vlefshëm — mbetet siç është.
  }
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ë/g, 'e')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || slug.replace(/[^a-z0-9]+/gi, '-')
  );
}

function emriFotos(url, slug) {
  const pa = url.split('?')[0];
  const zgjatimi = (pa.match(/\.(jpe?g|png|webp|avif)$/i) || ['.jpg'])[0].toLowerCase();
  return `${slug}${zgjatimi}`;
}

async function shkarko(url, ku) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  await writeFile(ku, Buffer.from(await r.arrayBuffer()));
}

/* ------------------------------------------------------------------ */

console.log('');
if (!SHKRUAJ) {
  console.log('  PROVË — asnjë skedar nuk shkruhet. Shto --shkruaj për ta bërë vërtet.');
  console.log('');
}

const [pemaRaw, produktet] = await Promise.all([merrKategorite(), merrProduktet()]);

const pema = {
  sipasId: new Map(pemaRaw.map((c) => [c.id, c])),
  sipasSllugut: new Map(pemaRaw.map((c) => [c.slug, c])),
};

const ekzistuese = new Set(
  (await readdir(PRODUKTET)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
);
const kategoriteTona = new Set(
  (await readdir(KATEGORITE)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
);

const numra = {
  gjithsej: produktet.length,
  jashteDege: 0, iKemi: 0, pakategori: 0, paCmim: 0, paFoto: 0, variable: 0, jashteFiltrit: 0,
};
const perTeShkruar = [];

for (const p of produktet) {
  const sllugat = meGjithePrinderit((p.categories || []).map((c) => c.slug), pema);
  const slug = slugPastruar(p.slug);

  if ([...sllugat].some((s) => JASHTE.has(s))) { numra.jashteDege++; continue; }
  if (KATEGORIA && !sllugat.has(KATEGORIA)) { numra.jashteFiltrit++; continue; }
  if (p.type !== 'simple') { numra.variable++; continue; }
  if (ekzistuese.has(slug)) { numra.iKemi++; continue; }

  const kategoria = zgjidhKategorine(sllugat);
  if (!kategoria) { numra.pakategori++; continue; }
  if (VETEM_TONAT && !kategoriteTona.has(kategoria)) { numra.jashteFiltrit++; continue; }

  const njesi = 10 ** (p.prices?.currency_minor_unit ?? 2);
  const cmimi = Math.round(Number(p.prices?.regular_price ?? p.prices?.price ?? 0) / njesi);
  if (!cmimi || cmimi <= 0) { numra.paCmim++; continue; }

  const fotot = (p.images || []).map((i) => i.src).filter(Boolean);
  if (fotot.length === 0) { numra.paFoto++; continue; }

  const plote = pastroTekstin(p.name);
  const { marka, emri } = ndajMarken(plote);

  const desc_sq = ME_PERSHKRIME
    ? pershtatShqip(p.description || p.short_description, plote)
    : '';
  const desc_en = ME_PERSHKRIME
    ? anglishtja({ emri: emri || plote, marka, kategoria, sasia: nxirrSasine(plote) })
    : '';

  perTeShkruar.push({
    slug,
    kategoria,
    cmimi,
    marka,
    emri: emri || plote,
    stok: p.is_in_stock !== false,
    fotot: FOTO_SHTESE ? fotot.slice(0, 4) : fotot.slice(0, 1),
    desc_sq,
    desc_en,
  });

  if (perTeShkruar.length >= KUFI) break;
}

/* --------------------------- raporti ------------------------------ */

const sipasKategorise = new Map();
for (const x of perTeShkruar) {
  sipasKategorise.set(x.kategoria, (sipasKategorise.get(x.kategoria) ?? 0) + 1);
}

console.log(`  katalogu i FarmaCity        ${numra.gjithsej}`);
console.log(`  i kemi tashmë               ${numra.iKemi}`);
console.log(`  me variante (të pamundur)   ${numra.variable}`);
console.log(`  pa kategori të përputhur    ${numra.pakategori}`);
console.log(`  pa çmim                     ${numra.paCmim}`);
console.log(`  pa foto                     ${numra.paFoto}`);
console.log(`  degë të përjashtuara        ${numra.jashteDege}`);
if (numra.jashteFiltrit) console.log(`  jashtë filtrit              ${numra.jashteFiltrit}`);
console.log('');
console.log(`  PËR TU IMPORTUAR            ${perTeShkruar.length}`);
console.log('');

for (const [k, sa] of [...sipasKategorise].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(sa).padStart(5)}  ${k}${kategoriteTona.has(k) ? '' : '   (kategori e re)'}`);
}
console.log('');

const fotoGjithsej = perTeShkruar.reduce((s, x) => s + x.fotot.length, 0);
const skedareTani = 316;
console.log(`  foto për të shkarkuar       ${fotoGjithsej}`);
console.log(`  skedare te dist/ pas kësaj  ~${skedareTani + perTeShkruar.length * 2 + fotoGjithsej}`);
console.log('  kufiri i Cloudflare falas   20000');

if (ME_PERSHKRIME) {
  const me = perTeShkruar.filter((x) => x.desc_sq).length;
  console.log('');
  console.log(`  me përshkrim shqip          ${me} (${Math.round((me / (perTeShkruar.length || 1)) * 100)}%)`);
  console.log(`  pa përshkrim shqip          ${perTeShkruar.length - me}  — faqja del gjithsesi e plotë`);
}
console.log('');

// Në provë tregohen tre shembuj të gatshëm. Një raport me numra nuk e thotë
// nëse teksti del i lexueshëm; teksti vetë e thotë.
if (!SHKRUAJ && ME_PERSHKRIME) {
  const shembuj = perTeShkruar.filter((x) => x.desc_sq);
  for (const x of [shembuj[0], shembuj[Math.floor(shembuj.length / 2)], shembuj[shembuj.length - 1]]) {
    if (!x) continue;
    console.log('  ' + '─'.repeat(66));
    console.log(`  ${x.marka ? x.marka + ' — ' : ''}${x.emri}   [${x.kategoria}]`);
    console.log('');
    for (const rr of x.desc_sq.split('\n\n')) console.log(`    ${rr}`);
    console.log('');
    console.log(`    EN: ${x.desc_en}`);
    console.log('');
  }
}

if (!SHKRUAJ) {
  console.log('  Provë. Asgjë nuk u shkrua.');
  console.log('');
  process.exit(0);
}

/* --------------------------- shkrimi ------------------------------ */

await mkdir(FOTOT, { recursive: true });

// Kategoritë para produkteve: një produkt që tregon kategori që s'ekziston del
// gjithsesi te /produktet — `getOrphanProducts()` kujdeset — por pa filtrin e vet.
for (const k of new Set(perTeShkruar.map((x) => x.kategoria))) {
  if (kategoriteTona.has(k)) continue;
  const d = TE_REJAT[k];
  if (!d) {
    console.log(`  [kategori] ${k} nuk ka tekst te TE_REJAT — po e kapërcej`);
    continue;
  }
  const f = join(KATEGORITE, `${k}.md`);
  if (existsSync(f)) continue;
  await writeFile(f, [
    '---',
    `name_sq: ${vlereYaml(d.name_sq)}`,
    `name_en: ${vlereYaml(d.name_en)}`,
    `blurb_sq: ${vlereYaml(d.blurb_sq)}`,
    `blurb_en: ${vlereYaml(d.blurb_en)}`,
    'order: 99',
    '---',
    '',
  ].join('\n'), 'utf8');
  console.log(`  [kategori] u krijua ${k}`);
}

let shkruar = 0;
let deshtuan = 0;

for (const x of perTeShkruar) {
  const emratLokale = [];
  try {
    for (let i = 0; i < x.fotot.length; i++) {
      const emri = emriFotos(x.fotot[i], i === 0 ? x.slug : `${x.slug}-${i + 1}`);
      const ku = join(FOTOT, emri);
      if (!existsSync(ku)) await shkarko(x.fotot[i], ku);
      emratLokale.push(`/foto/${emri}`);
    }
  } catch (e) {
    // Një foto e prishur nuk e ndal importin: produkti kapërcehet dhe raportohet.
    deshtuan++;
    console.log(`  [foto] ${x.slug}: ${e.message}`);
    continue;
  }

  const shtesat = emratLokale.slice(1);
  const trupi = [
    '---',
    `name_sq: ${vlereYaml(x.emri)}`,
    // Emrat janë me shkronja latine dhe kryesisht anglisht që në origjinë
    // ("Purifying Nettle Shampoo"), ndaj shkruhet i njëjti te të dyja gjuhët —
    // kështu klienti e sheh të plotësuar te CMS-ja dhe mund ta ndryshojë.
    `name_en: ${vlereYaml(x.emri)}`,
    `price: ${x.cmimi}`,
    'oldPrice: null',
    `category: ${x.kategoria}`,
    `brand: ${vlereYaml(x.marka)}`,
    `image: ${vlereYaml(emratLokale[0])}`,
    shtesat.length ? `images:\n${shtesat.map((s) => `  - ${vlereYaml(s)}`).join('\n')}` : 'images: []',
    bllok('desc_sq', x.desc_sq),
    bllok('desc_en', x.desc_en),
    `inStock: ${x.stok}`,
    'featured: false',
    'order: 99',
    '---',
    '',
  ].join('\n');

  await writeFile(join(PRODUKTET, `${x.slug}.md`), trupi, 'utf8');
  shkruar++;
  if (shkruar % 25 === 0) process.stdout.write(`\r  u shkruan ${shkruar}/${perTeShkruar.length}   `);
}

process.stdout.write('\r                                        \r');
console.log(`  u shkruan ${shkruar} produkte, ${deshtuan} u kapërcyen te fotoja.`);
console.log('');
console.log('  Hapi tjetër:  npm run fotot  &&  npm run build');
console.log('');
