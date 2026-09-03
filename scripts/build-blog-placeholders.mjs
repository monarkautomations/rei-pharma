/**
 * Kapakë të përkohshëm për postet e blogut.
 *
 * Nuk janë dekor — janë vendmbajtëse. Sapo klienti dërgon fotot reale, ato
 * kopjohen mbi këto file me të njëjtin emër dhe nuk ndryshon asnjë rresht kodi.
 *
 * Përdorim:  node scripts/build-blog-placeholders.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1200;
const H = 750;

// Emri i file-it ↔ nuanca. Emrat përputhen me `cover` te src/content/posts/.
const covers = [
  { file: 'krem-dielli.jpg', from: '#1E4438', to: '#0B1A16' },
  { file: 'vitamina-d.jpg', from: '#17362D', to: '#0B1A16' },
  { file: 'kujdesi-flokeve.jpg', from: '#122B25', to: '#0B1A16' },
];

await mkdir('public/blog', { recursive: true });

const mark = await sharp('public/logo-mark.png')
  .resize({ height: 300 })
  .composite([
    // E zbeh monogramin që të mos konkurrojë me titullin mbi të.
    {
      input: Buffer.from([255, 255, 255, 38]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    },
  ])
  .toBuffer();

const markMeta = await sharp(mark).metadata();

for (const cover of covers) {
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="${cover.from}"/>
           <stop offset="100%" stop-color="${cover.to}"/>
         </linearGradient>
         <radialGradient id="glow" cx="0.22" cy="0.15" r="0.75">
           <stop offset="0%" stop-color="#B28B4A" stop-opacity="0.30"/>
           <stop offset="100%" stop-color="#B28B4A" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#g)"/>
       <rect width="${W}" height="${H}" fill="url(#glow)"/>
       <rect x="0" y="${H - 6}" width="${W}" height="6" fill="#B28B4A" opacity="0.85"/>
     </svg>`,
  );

  await sharp(background)
    .composite([
      {
        input: mark,
        left: Math.round(W - markMeta.width - 70),
        top: Math.round((H - markMeta.height) / 2),
      },
    ])
    .jpeg({ quality: 82 })
    .toFile(`public/blog/${cover.file}`);

  console.log(`public/blog/${cover.file}  ${W}x${H}`);
}
