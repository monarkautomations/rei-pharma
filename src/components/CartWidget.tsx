import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Drawer } from 'vaul';
import {
  cart,
  cartOpen,
  itemCount,
  total,
  setQty,
  removeItem,
  orderLink,
} from '../lib/cart';
import { formatPrice, PRODUCT_PLACEHOLDER } from '../config/site';
import { path, t, type Lang } from '../lib/i18n';

function useIsDesktop() {
  const [big, setBig] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setBig(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return big;
}

/**
 * Shporta lexohet nga localStorage sapo ngarkohet moduli, ndaj rendërimi i parë
 * në klient e di numrin ndërsa HTML-ja e serverit jo. Pa këtë, React ankohet me
 * "Hydration failed". Numri shfaqet vetëm pasi komponenti të jetë montuar.
 */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function CartWidget({ lang = 'sq' }: { lang?: Lang }) {
  const lines = useStore(cart);
  const open = useStore(cartOpen);
  const storedCount = useStore(itemCount);
  const sum = useStore(total);
  const isDesktop = useIsDesktop();
  const mounted = useMounted();
  const count = mounted ? storedCount : 0;

  const productsHref = path(lang, 'products');

  return (
    <>
      <button
        type="button"
        onClick={() => cartOpen.set(true)}
        className="relative grid h-11 w-11 place-items-center rounded-md text-forest-900 hover:bg-bone"
        aria-label={
          count > 0
            ? `${t(lang, 'cart')}, ${count}`
            : t(lang, 'cartEmptyLabel')
        }
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-forest-900 px-1 text-[11px] font-medium text-white">
            {count}
          </span>
        )}
      </button>

      <Drawer.Root
        open={open}
        onOpenChange={(v) => cartOpen.set(v)}
        direction={isDesktop ? 'right' : 'bottom'}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-forest-950/55" />
          <Drawer.Content
            className="fixed z-50 flex flex-col bg-white
              inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl
              lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[420px] lg:rounded-none lg:rounded-l-2xl"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-mist lg:hidden" />

            <div className="flex items-center justify-between border-b border-mist px-5 py-4">
              <Drawer.Title className="font-display text-[22px]">
                {t(lang, 'cart')}
              </Drawer.Title>
              <Drawer.Close
                className="grid h-11 w-11 place-items-center rounded-md hover:bg-bone"
                aria-label={t(lang, 'cartClose')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </Drawer.Close>
            </div>
            <Drawer.Description className="sr-only">
              {t(lang, 'cartDescription')}
            </Drawer.Description>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                <p className="text-[16px] text-graphite">
                  {t(lang, 'cartEmpty')}
                </p>
                <a
                  href={productsHref}
                  onClick={() => cartOpen.set(false)}
                  className="inline-flex min-h-[48px] items-center rounded-full border border-forest-900/20 px-6 text-[15px] font-medium"
                >
                  {t(lang, 'seeProducts')}
                </a>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-mist overflow-y-auto px-5">
                  {lines.map((l) => (
                    <li key={l.id} className="flex gap-3 py-4">
                      <img
                        src={l.image}
                        alt=""
                        width="64"
                        height="64"
                        // Bezhi vetëm te placeholder-i: fotot reale kanë sfond
                        // të bardhë dhe mbi bezh dilnin si katror i bardhë.
                        className={`h-16 w-16 shrink-0 rounded-md object-contain p-1.5 ${
                          l.image === PRODUCT_PLACEHOLDER ? 'bg-bone' : 'bg-white'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] leading-snug">{l.name}</p>
                        <p className="mt-0.5 text-[13px] text-slate">
                          {formatPrice(l.price)} {t(lang, 'each')}
                        </p>

                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex items-center rounded-md border border-mist">
                            <button
                              type="button"
                              onClick={() => setQty(l.id, l.qty - 1)}
                              className="grid h-11 w-11 place-items-center text-[18px] leading-none hover:bg-bone"
                              aria-label={`${t(lang, 'removeOne')} ${l.name}`}
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-[15px] tabular-nums">
                              {l.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(l.id, l.qty + 1)}
                              className="grid h-11 w-11 place-items-center text-[18px] leading-none hover:bg-bone"
                              aria-label={`${t(lang, 'addOne')} ${l.name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(l.id)}
                            className="inline-flex min-h-[44px] items-center px-1 text-[13px] text-slate underline underline-offset-2 hover:text-forest-900"
                          >
                            {t(lang, 'remove')}
                          </button>
                        </div>
                      </div>

                      <p className="shrink-0 text-[15px] font-medium tabular-nums">
                        {formatPrice(l.price * l.qty)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-mist px-5 pt-4 pb-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] text-graphite">
                      {t(lang, 'cartTotal')}
                    </span>
                    <span className="text-[22px] font-medium tabular-nums">
                      {formatPrice(sum)}
                    </span>
                  </div>

                  <p className="mt-1 text-[13px] text-slate">
                    {t(lang, 'cartPayNote')}
                  </p>

                  <a
                    href={orderLink(lines, sum, lang)}
                    target="_blank"
                    rel="noopener"
                    className="mt-4 flex min-h-[54px] items-center justify-center rounded-full bg-forest-900 px-6 text-[16px] font-medium text-white transition-colors hover:bg-forest-700"
                  >
                    {t(lang, 'cartCheckout')}
                  </a>

                  <p className="mt-3 text-center text-[12px] text-slate">
                    {t(lang, 'cartCheckoutNote')}
                  </p>
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
