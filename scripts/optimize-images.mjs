/**
 * Zvogëlon fotot që hidhen te `public/blog/` dhe `public/foto/`.
 *
 * Pse duhet: një foto nga telefoni është 4–6 MB. Pa këtë, faqja hapet ngadalë
 * me të dhëna celulare dhe repo-ja fryhet sa herë klienti shton një produkt.
 *
 * Katër gjëra bëhen njëherësh:
 *  1. Prerje e sfondit bosh — vetëm te fotot e produkteve. Shih më poshtë.
 *  2. Zvogëlim deri në MAX_WIDTH dhe rikodim me cilësi të arsyeshme.
 *  3. Rrotullim sipas EXIF — fotot vertikale nga telefoni ndryshe dalin anash.
 *  4. Heqje e EXIF-it. Fotot e telefonit mbajnë koordinatat GPS të vendit ku
 *     u shkrepën; ato nuk kanë pse të publikohen.
 *
 * Nuk e rikompreson dy herë të njëjtën foto: mban një shenjë të asaj që nxori
 * vetë, dhe nëse file-i nuk ka ndryshuar, e kapërcen. Pa këtë, çdo build do ta
 * ulte cilësinë edhe pak.
 *
 * Përdorim:  npm run fotot     (nis vetë edhe para `npm run build`)
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, sep } from 'node:path';

const FOLDERS = ['public/blog', 'public/foto'];
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const CACHE = 'scripts/.image-cache.json';

/**
 * Prerja e sfondit — vetëm te fotot e produkteve.
 *
 * Klienti i ngarkon fotot me sfond të bardhë, por rrallë të prera: produkti
 * rri i vogël në mes dhe rreth tij ka bardhësi bosh. Faqja pastaj e tregon
 * atë bardhësi si pjesë të fotos, dhe produkti duket i humbur në kartë
 * (fotoja e parë reale: 43% e sipërfaqes ishte sfond bosh).
 *
 * Këtu hiqet vetë. Pas kësaj produkti mbush kornizën si te dyqanet e tjera,
 * pa i kërkuar klientit të dijë të presë foto.
 *
 * Blogu NUK preket: aty fotoja është pamje me kompozim, jo produkt mbi sfond,
 * dhe prerja do ta prishte.
 */
const TRIM_FOLDERS = ['public/foto'];

// Sa larg ngjyrës së qoshes lejohet një piksel e prapë të quhet sfond.
// 10 është i kujdesshëm: heq bardhësinë, nuk han nga produkti. Provuar deri
// në 40 — ndryshimi ishte 3% e sipërfaqes, pra pragu i lartë nuk fiton gjë
// dhe rrezikon të hajë buzët e çelëta të një kutie.
const TRIM_THRESHOLD = 10;

// Rrjeta e sigurisë: nëse pas prerjes mbetet një copëz, prerja hodhi poshtë
// vetë produktin dhe fotoja ruhet siç ishte.
//
// Kusht mbi sipërfaqen nuk vihet me qëllim. U provua një i tillë dhe refuzonte
// pikërisht rastin që duam të ndreqim: produkt 300x220 në kornizë 2000x2000
// zë 2% të sipërfaqes, pra çdo prag do ta linte të vogël në kartë. Vetë pragu
// i ngjyrës e mbron produktin — një produkt që dallon nga sfondi më pak se
// TRIM_THRESHOLD nuk duket as me sy (provuar: #fdfdfd mbi të bardhë nuk
// pritet fare).
const TRIM_MIN_SIDE = 150;

// Ndryshon kur ndryshon vetë pipeline-i. Fotot e produkteve që janë përpunuar
// me një version më të vjetër kalojnë edhe një herë; blogu jo, që të mos
// rikompresohet pa nevojë.
const PIPELINE_VERSION = 2;

const hash = (buffer) => createHash('sha1').update(buffer).digest('hex');
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

// Windows i shkruan shtigjet me `\`, Linux me `/`. Netlify ndërton në Linux:
// pa këtë, çelësat e ruajtur këtu nuk përputheshin atje dhe çdo publikim do
// t'i rikompresonte fotot nga e para.
const key = (path) => path.split(sep).join('/');

// Shkruar si konstante sepse ky file kalon nëpër skripte që i përpunojnë
// sekuencat me kundërpjerrëse.
const NEWLINE = String.fromCharCode(10);

let cache = {};
if (existsSync(CACHE)) {
  try {
    cache = JSON.parse(await readFile(CACHE, 'utf8'));
  } catch {
    cache = {}; // Cache i prishur nuk është arsye për ta ndalur build-in.
  }
}

// Pipeline i ri → fotot e produkteve rikalohen njëherë, që edhe ato që janë
// ngarkuar para këtij ndryshimi të marrin prerjen.
if (cache.__pipeline !== PIPELINE_VERSION) {
  for (const stored of Object.keys(cache)) {
    if (TRIM_FOLDERS.some((f) => stored.startsWith(`${f}/`))) delete cache[stored];
  }
  cache.__pipeline = PIPELINE_VERSION;
}

/**
 * Provon prerjen dhe kthen `true` vetëm nëse rezultati është i besueshëm.
 * Prerja bëhet me `sharp`, që merr ngjyrën e qoshes si sfond.
 */
async function trimIsSafe(buffer) {
  try {
    const { info } = await sharp(buffer)
      .rotate()
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });

    return info.width >= TRIM_MIN_SIDE && info.height >= TRIM_MIN_SIDE;
  } catch {
    // Foto krejt njëngjyrëshe e bën `trim` të dështojë. Mbetet siç ishte.
    return false;
  }
}

let processed = 0;
let skipped = 0;
let savedBytes = 0;
let deshtuan = 0;

for (const folder of FOLDERS) {
  if (!existsSync(folder)) {
    await mkdir(folder, { recursive: true });
    continue;
  }

  const files = await readdir(folder);

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const path = join(folder, file);

    // Asnjë foto e vetme nuk guxon ta ndalë build-in.
    //
    // Këtu vjen çdo gjë që ngarkon klienti: file i cunguar nga interneti i
    // dobët, `.jpg` që në të vërtetë është HEIC, foto e madhe sa kujtesa e
    // ndërtuesit. Pa këtë, njëra prej tyre do ta rrëzonte `npm run build` dhe
    // asgjë nuk do të publikohej — as produktet e tjera, as puna e mëparshme.
    // Fotoja e prishur mbetet siç është; nëse s'ekziston fare, `catalog.ts`
    // vë vizatimin e përkohshëm në vend të një fotoje të thyer.
    try {
      const original = await readFile(path);
      const before = original.length;
      const currentHash = hash(original);

      // E kemi nxjerrë ne këtë file dhe s'ka ndryshuar që atëherë.
      if (cache[key(path)] === currentHash) {
        skipped++;
        continue;
      }

      const meta = await sharp(original).metadata();

      // Pas rrotullimit sipas EXIF-it, gjerësia dhe lartësia ndërrojnë vend.
      const sideways = (meta.orientation ?? 1) >= 5;
      const srcWidth = sideways ? meta.height : meta.width;

      let pipeline = sharp(original).rotate(); // rrotullim sipas EXIF

      const trimmed = TRIM_FOLDERS.includes(folder) && (await trimIsSafe(original));
      if (trimmed) {
        pipeline = pipeline.trim({ threshold: TRIM_THRESHOLD });
      }

      if (srcWidth && srcWidth > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }

      // sharp e heq EXIF-in si parazgjedhje — mos shto `.withMetadata()`.
      const output =
        ext === '.png'
          ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
          : await pipeline
              .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
              .toBuffer();

      // Nëse "optimizimi" e rëndon file-in, mbaje origjinalin. Prerja bën
      // përjashtim: ajo ndryshon pamjen, jo peshën, prandaj ruhet gjithsesi.
      if (!trimmed && output.length >= before && (!srcWidth || srcWidth <= MAX_WIDTH)) {
        cache[key(path)] = currentHash;
        skipped++;
        continue;
      }

      await writeFile(path, output);
      cache[key(path)] = hash(output);
      processed++;
      savedBytes += before - output.length;

      const notes = [
        trimmed ? 'u pre sfondi' : null,
        srcWidth > MAX_WIDTH ? `${srcWidth}px → ${MAX_WIDTH}px` : null,
      ].filter(Boolean);

      console.log(
        `  ${key(path)}  ${kb(before)} → ${kb(output.length)}` +
          (notes.length ? `  (${notes.join(', ')})` : ''),
      );
    } catch (err) {
      deshtuan++;
      const arsyeja = String(err?.message ?? err).split(NEWLINE)[0];
      console.warn(`  ${key(path)}  NUK U PËRPUNUA: ${arsyeja}`);
      console.warn('    Fotoja mbetet siç është. Build-i vazhdon.');
    }
  }
}

// Hiq shënimet e fotove që nuk ekzistojnë më, që lista të mos rritet pafund.
// `__pipeline` nuk është foto — pa këtë kusht fshihej në çdo nisje dhe fotot
// do të riprocesoheshin pambarim.
for (const stored of Object.keys(cache)) {
  if (stored !== '__pipeline' && !existsSync(stored)) delete cache[stored];
}

await writeFile(CACHE, JSON.stringify(cache, null, 2) + NEWLINE);

if (deshtuan > 0) {
  console.warn(`Fotot: ${deshtuan} nuk u përpunuan dot (shih më lart).`);
}

if (processed === 0) {
  console.log(`Fotot: asnjë e re. ${skipped} tashmë të optimizuara.`);
} else {
  console.log(
    `Fotot: ${processed} u zvogëluan, ${skipped} u kapërcyen. U kursyen ${kb(savedBytes)}.`,
  );
}
