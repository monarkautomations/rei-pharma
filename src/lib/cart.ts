import { atom, computed } from 'nanostores';
import { site, formatPrice, waLink } from '../config/site';

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

const STORAGE_KEY = 'rei-cart-v1';
const MAX_LINES = 15;

function load(): CartLine[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Modaliteti privat mund ta bllokojë. Shporta punon gjithsesi brenda sesionit.
  }
}

export const cart = atom<CartLine[]>(load());
export const cartOpen = atom(false);

cart.listen((lines) => save(lines));

export const itemCount = computed(cart, (lines) =>
  lines.reduce((n, l) => n + l.qty, 0),
);

export const total = computed(cart, (lines) =>
  lines.reduce((sum, l) => sum + l.price * l.qty, 0),
);

export function addItem(line: Omit<CartLine, 'qty'>) {
  const lines = cart.get();
  const existing = lines.find((l) => l.id === line.id);

  if (existing) {
    cart.set(
      lines.map((l) => (l.id === line.id ? { ...l, qty: l.qty + 1 } : l)),
    );
    return { ok: true as const };
  }

  if (lines.length >= MAX_LINES) {
    // Kthen kod arsyeje, jo tekst: fjalët varen nga gjuha e faqes.
    return { ok: false as const, reason: 'full' as const, max: MAX_LINES };
  }

  cart.set([...lines, { ...line, qty: 1 }]);
  return { ok: true as const };
}

export function setQty(id: string, qty: number) {
  if (qty <= 0) {
    cart.set(cart.get().filter((l) => l.id !== id));
    return;
  }
  cart.set(cart.get().map((l) => (l.id === id ? { ...l, qty } : l)));
}

export function removeItem(id: string) {
  cart.set(cart.get().filter((l) => l.id !== id));
}

export function clearCart() {
  cart.set([]);
}

type Lang = 'sq' | 'en';

// Mesazhi i WhatsApp shkon te një farmacist shqiptar, por e shkruan klienti.
// Nëse klienti po shfleton në anglisht, edhe mesazhi duhet anglisht — ndryshe
// i dalin fjalë që nuk i kupton në aplikacionin e vet.
const orderWords = {
  sq: {
    greeting: 'Përshëndetje! Dua të porosis nga Rei Pharma:',
    total: 'Totali',
    payment: 'Pagesa: cash në dorëzim',
    name: 'Emri',
    address: 'Adresa',
    phone: 'Telefoni',
    summary: (lines: number, pieces: number) =>
      `${lines} produkte, gjithsej ${pieces} copë.`,
    fullListNote: '(Listën e plotë e dërgoj menjëherë pas këtij mesazhi.)',
  },
  en: {
    greeting: 'Hello! I would like to order from Rei Pharma:',
    total: 'Total',
    payment: 'Payment: cash on delivery',
    name: 'Name',
    address: 'Address',
    phone: 'Phone',
    summary: (lines: number, pieces: number) =>
      `${lines} products, ${pieces} items in total.`,
    fullListNote: '(I will send the full list right after this message.)',
  },
} as const;

/**
 * Ndërton mesazhin e WhatsApp.
 * Mbi kufirin e artikujve, kalon në përmbledhje — përndryshe URL-ja pritet.
 */
export function buildOrderMessage(
  lines: CartLine[],
  sum: number,
  lang: Lang = 'sq',
) {
  if (lines.length === 0) return '';

  const w = orderWords[lang];
  const footer = `\n${w.total}: ${formatPrice(sum)}\n${w.payment}\n\n${w.name}:\n${w.address}:\n${w.phone}:`;

  if (lines.length > site.cartMessageLimit) {
    const pieces = lines.reduce((n, l) => n + l.qty, 0);
    return `${w.greeting}\n\n${w.summary(lines.length, pieces)}${footer}\n\n${w.fullListNote}`;
  }

  const body = lines
    .map((l) => `• ${l.name} × ${l.qty} — ${formatPrice(l.price * l.qty)}`)
    .join('\n');

  return `${w.greeting}\n\n${body}${footer}`;
}

export function orderLink(lines: CartLine[], sum: number, lang: Lang = 'sq') {
  return waLink(buildOrderMessage(lines, sum, lang));
}
