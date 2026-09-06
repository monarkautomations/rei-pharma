/**
 * Lista e dëshirave: produktet që vizitori ruan për më vonë.
 *
 * Pa React dhe pa nanostores — rregulli 3. Shporta i ka të dyja sepse mban
 * sasira, çmime dhe një panel të tërë; kjo mban vetëm një listë adresash
 * produktesh, dhe për aq gjë një ishull React do të ishte tepricë.
 *
 * Ruhet te `localStorage`, pra rri vetëm te shfletuesi i atij vizitori: nuk
 * kërkon llogari, nuk shkon askund, dhe nuk e sheh as farmacia. Kjo është
 * zgjedhje, jo mangësi — një listë dëshirash nuk vlen sa të kërkosh regjistrim.
 */

const KEY = 'rei-wishlist-v1';

/** Sa produkte lejohen. Mbi këtë numër, faqja bëhet listë blerjesh, jo dëshirash. */
const MAX = 60;

/**
 * `localStorage` mund të mos ekzistojë (dritare private në disa shfletues) ose
 * të hedhë gabim kur kuota mbaron. Asnjë prej tyre nuk duhet ta prishë faqen:
 * në rastin më të keq lista mbetet bosh dhe pjesa tjetër punon.
 */
function lexo(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function ruaj(lista: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    // Kuota e mbushur ose ruajtja e bllokuar. Nuk ka ç'i themi vizitorit —
    // veprimi thjesht nuk mbahet mend, dhe faqja vazhdon.
  }
}

export function teGjitha(): string[] {
  return lexo();
}

export function eKa(slug: string): boolean {
  return lexo().includes(slug);
}

export function sa(): number {
  return lexo().length;
}

/**
 * Shton ose heq, dhe kthen gjendjen e re.
 *
 * Produkti i ri shkon në krye: kush ruan diçka tani, e pret atë të parën kur
 * hap listën.
 */
export function nderro(slug: string): boolean {
  const lista = lexo();
  const i = lista.indexOf(slug);

  if (i === -1) {
    ruaj([slug, ...lista]);
    njofto();
    return true;
  }

  lista.splice(i, 1);
  ruaj(lista);
  njofto();
  return false;
}

/** Emri i ngjarjes që dëgjojnë numëruesi te header-i dhe faqja e listës. */
export const NGJARJA = 'rei:wishlist';

function njofto(): void {
  window.dispatchEvent(new CustomEvent(NGJARJA, { detail: { sa: sa() } }));
}

/**
 * Dëgjon ndryshimet, edhe ato që vijnë nga një skedë tjetër e hapur.
 *
 * `storage` shkrepet vetëm te skedat e TJERA, kurrë te ajo që bëri ndryshimin
 * — prandaj duhen të dyja ngjarjet.
 */
export function degjo(cfare: (sa: number) => void): void {
  window.addEventListener(NGJARJA, () => cfare(sa()));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) cfare(sa());
  });
}
