// Të gjitha të dhënat e biznesit në një vend të vetëm.
// Ndrysho këtu, ndryshon kudo në site.

export const site = {
  // KUJDES: emri në Google Business është "Farmaci Rei".
  // E mbajmë të njëjtë që Google ta lidhë biznesin me site-in.
  legalName: 'Farmaci Rei',
  brandName: 'Rei Pharma',
  tagline: {
    sq: 'Shëndeti juaj, kujdesi ynë',
    en: 'Your health, our care',
  },

  // Konfirmuar. Google Business tregon +355 69 389 4346, por ky mbetet
  // numri zyrtar i site-it — vendim i klientit.
  phone: '+355 69 548 9816',
  phoneDigits: '355695489816', // për wa.me dhe tel:

  address: {
    street: 'Rruga Albanopoli',
    city: 'Tiranë',
    country: 'AL',
    lat: 41.3400112,
    lng: 19.8073619,
    mapsUrl: 'https://maps.google.com/?cid=10040334315914623331',
  },

  // Konfirmuar. Google Business tregon 08:30–21:30 dhe të dielën 10:00–19:00,
  // por ky mbetet orari zyrtar i site-it — vendim i klientit.
  hours: [
    {
      days: { sq: 'E hënë – E shtunë', en: 'Monday – Saturday' },
      open: '08:00',
      close: '21:00',
      schema: 'Mo-Sa',
    },
    {
      days: { sq: 'E diel', en: 'Sunday' },
      open: '16:00',
      close: '20:00',
      schema: 'Su',
    },
  ],

  social: {
    instagram: '',
    facebook: '',
  },

  // Kufiri i shportës — mbi këtë numër, mesazhi i WhatsApp bëhet përmbledhës
  cartMessageLimit: 10,
} as const;

/**
 * Numrat që animohen te kryefaqja. Konfirmuar nga klienti.
 */
export const stats = [
  {
    // 15, jo 12 — korrigjuar nga klienti më 5 shtator 2026.
    value: 15,
    suffix: '+',
    label: { sq: 'Vite në shërbim të Tiranës', en: 'Years serving Tirana' },
  },
  {
    value: 2500,
    suffix: '+',
    label: { sq: 'Produkte në raft', en: 'Products on the shelf' },
  },
  {
    value: 8000,
    suffix: '+',
    label: { sq: 'Klientë të shërbyer', en: 'Customers served' },
  },
  {
    value: 100,
    suffix: '%',
    label: { sq: 'Produkte origjinale', en: 'Genuine products' },
  },
] as const;

// Kategoritë NUK janë më këtu. Kaluan te src/content/categories/*.md
// që klienti t'i redaktojë vetë nga CMS-ja. Lexoji me src/lib/catalog.ts.

export function waLink(message: string) {
  return `https://wa.me/${site.phoneDigits}?text=${encodeURIComponent(message)}`;
}

const NBSP = String.fromCharCode(0xa0); // ndarësi i mijësheve në shqip

/**
 * Formaton çmimin në lekë.
 *
 * NUK përdor toLocaleString: Chrome-i nuk e ka lokalen 'sq' dhe bie te en-US,
 * ndaj serveri jepte "2400 L" dhe browser-i "2,400 L" për të njëjtin çmim.
 * Këtu rregulli shqip zbatohet me dorë, njësoj në server dhe në klient:
 * pa ndarës nën 10 000, me hapësirë të pandashme mbi të.
 */
export function formatPrice(lek: number) {
  const n = Math.round(lek);
  const digits = String(Math.abs(n));
  const grouped =
    digits.length > 4
      ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
      : digits;
  return `${n < 0 ? '-' : ''}${grouped} L`;
}

/**
 * Fotoja që del kur produkti s'ka ende foto nga klienti.
 *
 * E njohin pesë vende: skema e produkteve dhe çdo komponent që e vesh ndryshe
 * kornizën — bezh për placeholder-in, e bardhë për fotot reale. Si varg i
 * shkruar veç-e-veç, mjaftonte një gabim shkrimi që një kartë të dilte
 * ndryshe nga të tjerat.
 *
 * Burimi është `src/lib/schema.mjs`, sepse atë file e lexon edhe testi i
 * skemës, i cili nuk mund të importojë nga këtu pa tërhequr Astro-n.
 */
export { PRODUCT_PLACEHOLDER } from '../lib/schema.mjs';
