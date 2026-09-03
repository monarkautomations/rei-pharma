/**
 * Kontroll i shpejtë mbi `dist/` pas çdo build-i.
 *
 * Kap gjërat që thyhen pa u vënë re: një faqe pa titull, një përshkrim që
 * mungon, një JSON-LD i prishur nga një apostrof, një foto e lidhur gabim.
 *
 * Përdorim:  npm run build && node scripts/audit.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}

if (!existsSync('dist')) {
  console.error('Nuk ka dosje dist/. Nis "npm run build" më parë.');
  process.exit(1);
}

const all = walk('dist');
// /admin është paneli i CMS-së, jo faqe e site-it — s'ka title/description/
// JSON-LD me qëllim, dhe nuk duhet indeksuar nga Google.
const pages = all.filter((f) => f.endsWith('.html') && !f.includes(`${sep}admin${sep}`));

let problems = 0;

for (const file of pages.sort()) {
  const html = readFileSync(file, 'utf8');
  const url =
    '/' +
    relative('dist', file).split(sep).join('/').replace(/index\.html$/, '');

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const description =
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';

  const types = [];
  let jsonLdOk = true;
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      types.push(JSON.parse(match[1])['@type']);
    } catch {
      jsonLdOk = false;
    }
  }

  // Foto lokale që tregojnë nga një file që nuk ekziston te dist/.
  const missingImages = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:png|jpg|jpeg|webp|svg))"/g)]
    .map((m) => m[1])
    .filter((src, i, arr) => arr.indexOf(src) === i)
    .filter((src) => !existsSync(join('dist', src)));

  // hreflang duhet të tregojë nga një faqe që ekziston vërtet te dist/.
  const hreflangs = [
    ...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g),
  ].map((m) => ({ lang: m[1], href: m[2] }));

  const brokenAlternates = hreflangs
    .filter((h) => h.lang !== 'x-default')
    .map((h) => new URL(h.href).pathname)
    .filter((p) => {
      const candidate = p.endsWith('/') ? join('dist', p, 'index.html') : null;
      return !(
        (candidate && existsSync(candidate)) ||
        existsSync(join('dist', p)) ||
        existsSync(join('dist', p, 'index.html'))
      );
    });

  const issues = [];
  if (!title) issues.push('pa <title>');
  if (!description) issues.push('pa meta description');
  // Faqet me noindex (404-a) me qëllim nuk kanë hreflang.
  const noindex = /<meta name="robots" content="noindex"/.test(html);
  if (!noindex && hreflangs.length < 2)
    issues.push('pa hreflang për të dyja gjuhët');
  if (brokenAlternates.length)
    issues.push(`hreflang te faqe që s'ekzistojnë: ${brokenAlternates.join(', ')}`);
  if (title.length > 65) issues.push(`titull ${title.length} shkronja (>65)`);
  if (description.length > 165)
    issues.push(`description ${description.length} shkronja (>165)`);
  if (!jsonLdOk) issues.push('JSON-LD i pavlefshëm');
  if (missingImages.length) issues.push(`foto që mungojnë: ${missingImages.join(', ')}`);

  if (issues.length) {
    problems++;
    console.log(`  ✗ ${url}\n      ${issues.join('\n      ')}`);
  } else {
    console.log(`  ✓ ${url.padEnd(44)} [${[...new Set(types)].join(', ')}]`);
  }
}

console.log(`\n${pages.length} faqe.`);
console.log(problems ? `${problems} me probleme.` : 'Asnjë problem.');
process.exit(problems ? 1 : 0);
