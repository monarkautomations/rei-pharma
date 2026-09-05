/**
 * Fshin cache-in e përmbajtjes së Astro-s para çdo ndërtimi.
 *
 * Pse duhet: Astro e ruan përmbajtjen e nxjerrë te `.astro/`, dhe Cloudflare e
 * rikthen atë dosje nga ndërtimi i mëparshëm ("Restoring from build output
 * cache"). Kur skema ndryshon — p.sh. i shtohet fusha `images` — Astro nuk e
 * rilexon përmbajtjen: e merr nga cache-ja, e nxjerrë me skemën e VJETËR.
 *
 * Pasoja e vërtetë, 6 shtator 2026: build-i ra me
 *
 *     Cannot read properties of undefined (reading 'map')
 *
 * sepse `d.images` nuk ekzistonte te të dhënat e ruajtura. Te log-u dukej
 * qartë: "[content] Synced content" për 45 milisekonda, pra pa lexuar asgjë.
 *
 * Lokalisht nuk ndodhte, sepse `.astro` fshihej sa herë ndryshonte skema.
 *
 * Rileximi zgjat rreth dy sekonda për këtë katalog — çmim i vogël përkundrejt
 * një publikimi që dështon pa shkak të dukshëm sa herë shtohet fushë e re.
 */
import { rmSync } from 'node:fs';

for (const dosja of ['.astro', 'node_modules/.astro']) {
  rmSync(dosja, { recursive: true, force: true });
}

console.log('Cache-i i përmbajtjes u pastrua.');
