/**
 * Zvogëlon fotot që hidhen te `public/blog/` dhe `public/foto/`.
 *
 * Pse duhet: një foto nga telefoni është 4–6 MB. Pa këtë, faqja hapet ngadalë
 * me të dhëna celulare dhe repo-ja fryhet sa herë klienti shton një produkt.
 *
 * Tri gjëra bëhen njëherësh:
 *  1. Zvogëlim deri në MAX_WIDTH dhe rikodim me cilësi të arsyeshme.
 *  2. Rrotullim sipas EXIF — fotot vertikale nga telefoni ndryshe dalin anash.
 *  3. Heqje e EXIF-it. Fotot e telefonit mbajnë koordinatat GPS të vendit ku
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

const hash = (buffer) => createHash('sha1').update(buffer).digest('hex');
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

// Windows i shkruan shtigjet me `\`, Linux me `/`. Netlify ndërton në Linux:
// pa këtë, çelësat e ruajtur këtu nuk përputheshin atje dhe çdo publikim do
// t'i rikompresonte fotot nga e para.
const key = (path) => path.split(sep).join('/');

let cache = {};
if (existsSync(CACHE)) {
  try {
    cache = JSON.parse(await readFile(CACHE, 'utf8'));
  } catch {
    cache = {}; // Cache i prishur nuk është arsye për ta ndalur build-in.
  }
}

let processed = 0;
let skipped = 0;
let savedBytes = 0;

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
    const original = await readFile(path);
    const before = original.length;
    const currentHash = hash(original);

    // E kemi nxjerrë ne këtë file dhe s'ka ndryshuar që atëherë.
    if (cache[key(path)] === currentHash) {
      skipped++;
      continue;
    }

    const image = sharp(original).rotate(); // rrotullim sipas EXIF
    const meta = await image.metadata();

    let pipeline = image;
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // sharp e heq EXIF-in si parazgjedhje — mos shto `.withMetadata()`.
    const output =
      ext === '.png'
        ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
        : await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toBuffer();

    // Nëse "optimizimi" e rëndon file-in, mbaje origjinalin.
    if (output.length >= before && (!meta.width || meta.width <= MAX_WIDTH)) {
      cache[key(path)] = currentHash;
      skipped++;
      continue;
    }

    await writeFile(path, output);
    cache[key(path)] = hash(output);
    processed++;
    savedBytes += before - output.length;

    console.log(
      `  ${key(path)}  ${kb(before)} → ${kb(output.length)}` +
        (meta.width > MAX_WIDTH ? `  (${meta.width}px → ${MAX_WIDTH}px)` : ''),
    );
  }
}

// Hiq shënimet e fotove që nuk ekzistojnë më, që lista të mos rritet pafund.
for (const stored of Object.keys(cache)) {
  if (!existsSync(stored)) delete cache[stored];
}

await writeFile(CACHE, JSON.stringify(cache, null, 2) + '\n');

if (processed === 0) {
  console.log(`Fotot: asnjë e re. ${skipped} tashmë të optimizuara.`);
} else {
  console.log(
    `Fotot: ${processed} u zvogëluan, ${skipped} u kapërcyen. U kursyen ${kb(savedBytes)}.`,
  );
}
