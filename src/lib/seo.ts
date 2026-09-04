/**
 * Ndërtimi i meta description-it.
 *
 * Pse duhet: përshkrimet i shkruan klienti nga CMS-ja dhe ai shkruan gjatë —
 * përshkrimet e para reale dolën 300 shkronja. Google e pret rreth 160-s, pra
 * fjalia mbetet e gjysmuar në rezultatet e kërkimit. Prerja bëhet këtu, te
 * fundi i një fjale, jo në mes të saj.
 */

/** Sa gjatë e lexon Google-i para se ta presë vetë. Auditi kërkon nën 165. */
const MAX = 158;

/** Pret te hapësira e fundit para kufirit, që të mos mbetet gjysmë fjale. */
function preTeFjala(text: string, kufi: number): string {
  const i = text.trim();
  if (i.length <= kufi) return i;
  const prere = i.slice(0, kufi);
  const hapesira = prere.lastIndexOf(' ');
  // Fjalë e vetme më e gjatë se kufiri: pritet aty ku bie.
  const trupi = hapesira > kufi * 0.5 ? prere.slice(0, hapesira) : prere;
  return trupi.replace(/[\s.,;:—–-]+$/, '') + '…';
}

/**
 * Përshkrimi i produktit plus bishti me markën dhe qytetin.
 *
 * Bishti ka përparësi: ai mban emrin e farmacisë dhe Tiranën, pjesa që bën
 * punë për kërkimin lokal. Përshkrimit i mbetet ajo që tepron.
 */
export function productDescription(desc: string, cmimi: string, bishti: string): string {
  const bisht = ` ${cmimi}${bishti}`;
  const hapesire = MAX - bisht.length;

  // Bisht më i gjatë se i gjithë buxheti nuk duhet të ndodhë, po nëse ndodh,
  // më mirë vetëm përshkrimi sesa një description i prerë në mes të markës.
  if (hapesire < 40) return preTeFjala(desc, MAX);

  return preTeFjala(desc, hapesire) + bisht;
}

/** Përshkrim i thjeshtë nga një tekst i vetëm — për blogun. */
export function trimDescription(text: string): string {
  return preTeFjala(text, MAX);
}
