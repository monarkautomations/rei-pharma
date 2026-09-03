/**
 * Nxjerr asetet e logos nga `public/logo-full.jpg`.
 *
 * Origjinali është katror me sfond të bardhë — nuk hyn në një header 64px dhe
 * lë një drejtkëndësh të bardhë mbi çdo sfond të errët. Ky skript pret pjesët,
 * heq sfondin dhe ndërton një logo horizontale.
 *
 * Përdorim:  node scripts/build-logo.mjs
 * Rilexohet vetëm kur klienti dërgon logo të re.
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SRC = 'public/logo-full.jpg';

// Kufijtë e matur te origjinali 1254x1254.
const MARK = { left: 428, top: 281, width: 441, height: 429 };
const WORD = { left: 186, top: 763, width: 887, height: 97 };

/** Sfondi i logos është ~#f9f9f9. E kthejmë në të tejdukshme. */
async function transparent(region) {
  const { data, info } = await sharp(SRC)
    .extract(region)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Sa e ndritshme është piksela krahasuar me sfondin. E bardha bëhet
    // plotësisht e tejdukshme, gri-ja e çelët gjysmë — kështu skajet mbeten
    // të buta në vend që të dhëmbëzohen.
    const lightest = Math.max(r, g, b);
    if (lightest >= 240) {
      data[i + 3] = 0;
    } else if (lightest > 205) {
      data[i + 3] = Math.round(255 * ((240 - lightest) / 35));
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png();
}

const mark = await transparent(MARK);
const word = await transparent(WORD);

await mark.clone().resize({ height: 512 }).toFile('public/logo-mark.png');
await mark.clone().resize({ height: 180 }).toFile('public/apple-touch-icon.png');
await mark.clone().resize({ height: 64 }).toFile('public/favicon.png');
await word.clone().resize({ height: 128 }).toFile('public/logo-word.png');

// Logo horizontale për header: monogrami majtas, fjala djathtas.
const MARK_H = 132;
const WORD_H = 46;
const GAP = 22;

const markBuf = await mark.clone().resize({ height: MARK_H }).toBuffer();
const wordBuf = await word.clone().resize({ height: WORD_H }).toBuffer();
const markMeta = await sharp(markBuf).metadata();
const wordMeta = await sharp(wordBuf).metadata();

const width = markMeta.width + GAP + wordMeta.width;
const height = MARK_H;

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: markBuf, left: 0, top: 0 },
    {
      input: wordBuf,
      left: markMeta.width + GAP,
      top: Math.round((height - wordMeta.height) / 2),
    },
  ])
  .png()
  .toFile('public/logo-lockup.png');

/**
 * Varianti për sfond të errët.
 *
 * Te logoja origjinale fjala "PHARMA" është jeshile e errët — mbi footer-in
 * jeshil zhduket krejt. Këtu pikselat e errët bëhen krem, ndërsa ari mbahet ar
 * (thjesht pak më i çelët). Një `invert` i thjeshtë do ta zbardhte edhe arin
 * dhe do ta humbte markën.
 */
async function lightVariant(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const warmth = r - b; // ari është dukshëm më i ngrohtë se jeshilja

    if (warmth < 30) {
      // Jeshile ose e zezë → krem.
      data[i] = 0xf4;
      data[i + 1] = 0xf2;
      data[i + 2] = 0xee;
    } else {
      // Ar → ar i çelët, që të mbetet i lexueshëm mbi errësirë.
      data[i] = Math.min(255, Math.round(r * 0.55 + 0xd9 * 0.45));
      data[i + 1] = Math.min(255, Math.round(g * 0.55 + 0xb9 * 0.45));
      data[i + 2] = Math.min(255, Math.round(b * 0.55 + 0x78 * 0.45));
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  }).png();
}

const lockupBuffer = await sharp('public/logo-lockup.png').toBuffer();
await (await lightVariant(lockupBuffer)).toFile('public/logo-lockup-light.png');
console.log('logo-lockup-light.png (për sfond të errët)');

// Favicon SVG që mbështjell PNG-në — mbetet i qartë në çdo madhësi tab-i.
const faviconPng = await mark.clone().resize({ height: 96 }).toBuffer();
const faviconMeta = await sharp(faviconPng).metadata();
const size = Math.max(faviconMeta.width, faviconMeta.height);
await writeFile(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    `<image href="data:image/png;base64,${faviconPng.toString('base64')}" ` +
    `x="${(size - faviconMeta.width) / 2}" y="${(size - faviconMeta.height) / 2}" ` +
    `width="${faviconMeta.width}" height="${faviconMeta.height}"/></svg>`,
);

console.log(`logo-lockup.png  ${width}x${height}`);
console.log('logo-mark.png, logo-word.png, favicon.png, favicon.svg, apple-touch-icon.png');
