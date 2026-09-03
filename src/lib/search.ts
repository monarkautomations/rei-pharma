/**
 * Kërkimi — logjika e pastër, pa DOM. Punon në shfletues mbi `/kerko.json`.
 */

export type SearchItem = {
  slug: string;
  sq: string;
  en: string;
  dsq: string;
  den: string;
  brand: string;
  cat: string;
  caten: string;
  price: number;
  image: string;
  stock: boolean;
};

/**
 * Heq theksat që "flokëve" të gjendet edhe kur shkruhet "flokeve",
 * dhe "çaj" edhe kur shkruhet "caj". Shumica shkruajnë pa ë dhe ç.
 */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ë/g, 'e');
}

type Scored = { item: SearchItem; score: number };

/**
 * Rendit sipas vendit ku përputhet: emri para përshkrimit, fillimi para mesit.
 * Të gjitha fjalët e kërkimit duhen gjetur diku — kërkimi për "krem dielli"
 * nuk duhet të kthejë çdo krem.
 */
export function searchProducts(
  items: SearchItem[],
  query: string,
  lang: 'sq' | 'en' = 'sq',
  limit = 8,
): SearchItem[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const results: Scored[] = [];

  for (const item of items) {
    const name = fold(lang === 'en' ? item.en : item.sq);
    const desc = fold(lang === 'en' ? item.den : item.dsq);
    const cat = fold(lang === 'en' ? item.caten : item.cat);
    const brand = fold(item.brand);

    let score = 0;
    let matchedAll = true;

    for (const word of words) {
      const inName = name.indexOf(word);
      const inBrand = brand.indexOf(word);
      const inCat = cat.indexOf(word);
      const inDesc = desc.indexOf(word);

      if (inName === 0) score += 100;
      else if (inName > 0) score += 60;
      else if (inBrand >= 0) score += 40;
      else if (inCat >= 0) score += 25;
      else if (inDesc >= 0) score += 10;
      else {
        matchedAll = false;
        break;
      }
    }

    if (!matchedAll) continue;
    if (!item.stock) score -= 15; // jashtë stoku zbret, por nuk fshihet
    results.push({ item, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}
