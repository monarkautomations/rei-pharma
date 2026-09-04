import { useState, useRef, useEffect } from 'react';
import { addItem, cartOpen } from '../lib/cart';
import { t, type Lang } from '../lib/i18n';

type Props = {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  lang?: Lang;
  /**
   * `icon` — rreth i vogël pranë çmimit, për kartat te grid-i.
   * `full`  — buton i plotë me tekst, për faqen e produktit.
   */
  variant?: 'full' | 'icon';
};

function CartPlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M12 10v6M9 13h6" />
    </svg>
  );
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function AddToCart({
  id,
  name,
  price,
  image,
  inStock,
  lang = 'sq',
  variant = 'full',
}: Props) {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleAdd() {
    const res = addItem({ id, name, price, image });
    if (timer.current) clearTimeout(timer.current);

    if (res.ok) {
      setMsg({ text: t(lang, 'added'), ok: true });
      timer.current = setTimeout(() => setMsg(null), 2600);
    } else {
      setMsg({
        text:
          lang === 'en'
            ? `The cart holds up to ${res.max} products. Send this order and start another.`
            : `Shporta mban deri në ${res.max} produkte. Dërgo këtë porosi dhe hap një tjetër.`,
        ok: false,
      });
      timer.current = setTimeout(() => setMsg(null), 5000);
    }
  }

  const added = msg?.ok === true;

  // ---------------------------------------------------------------- ikona
  if (variant === 'icon') {
    // Karta e tregon vetë "Jashtë stoku" me shenjë mbi foto. Po ta përsërisnim
    // këtu, teksti i hante vendin çmimit dhe në 375px çmimi thyhej në dy
    // rreshta ("2200" mbi "L"). Karta as nuk e thërret më këtë degë.
    if (!inStock) return null;

    return (
      <>
        <button
          type="button"
          onClick={handleAdd}
          // Emri i produktit hyn te etiketa: te një grid me dhjetë karta,
          // dhjetë butona "Shto në shportë" janë të padallueshëm me zë.
          aria-label={`${t(lang, 'addToCart')} — ${name}`}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
            added
              ? 'bg-forest-500 text-white'
              : 'bg-forest-900 text-white hover:bg-gold-500 hover:text-forest-950'
          }`}
        >
          {added ? <CheckIcon /> : <CartPlusIcon />}
        </button>

        <span aria-live="polite" className="sr-only">
          {msg?.text ?? ''}
        </span>
      </>
    );
  }

  // ----------------------------------------------------------------- plotë
  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="min-h-[52px] w-full cursor-not-allowed rounded-full border border-mist px-4 text-[15px] text-slate"
      >
        {t(lang, 'outOfStock')}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAdd}
        className={`flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full px-6 text-[16px] font-medium transition-colors ${
          added
            ? 'bg-forest-500 text-white'
            : 'bg-forest-900 text-white hover:bg-forest-700'
        }`}
      >
        {added ? <CheckIcon size={19} /> : <CartPlusIcon size={19} />}
        {added ? t(lang, 'added') : t(lang, 'addToCart')}
      </button>

      <p aria-live="polite" className="min-h-[20px]">
        {msg && !msg.ok && (
          <span className="mt-2 block text-[13px] text-alert">{msg.text}</span>
        )}
        {added && (
          <span className="mt-2 block text-[13px] text-forest-500">
            <button
              type="button"
              onClick={() => cartOpen.set(true)}
              className="underline underline-offset-2"
            >
              {t(lang, 'view')}
            </button>
          </span>
        )}
      </p>
    </div>
  );
}
