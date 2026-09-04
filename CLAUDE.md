# Rei Pharma — kontekst projekti

Site e-commerce për Farmaci Rei, Rruga Albanopoli, Tiranë.
Klient real, projekt i paguar. Mos e trajto si demo.

## Komandat

```bash
npm run dev      # http://localhost:4321
npm run build    # duhet të kalojë pa gabime para çdo publikimi
npm run preview
npm run audit    # kontrollon dist/: titujt, description, JSON-LD, fotot e thyera
npm run logo     # rigjeneron asetet e logos dhe kapakët e blogut
npm run fotot    # zvogëlon fotot te public/blog dhe public/foto
```

`npm run audit` duhet të japë "Asnjë problem" para çdo publikimi.

## Stack

Astro 5 + Tailwind v4 (konfigurim me CSS te `src/styles/global.css`) + React
vetëm për shportën. nanostores për gjendjen. vaul për panelin e shportës.

## Rregulla që nuk ndryshohen

1. **Output-i duhet static/server-rendered.** Kurrë SPA client-side. Crawler-at
   e AI-së dhe Google duhet ta lexojnë përmbajtjen pa ekzekutuar JavaScript.
2. **JSON-LD i detyrueshëm.** `Pharmacy` te `Base.astro`, `Product` te çdo
   kartë produkti. Çdo faqe e re duhet të ketë schema-n e vet.
3. **Islands React vetëm ku duhet ndërveprim.** Sot: `CartWidget` (client:load)
   dhe `AddToCart` (client:visible). Mos shto të tjera pa arsye të fortë.
   Kërkimi, menuja dhe numëruesi janë JavaScript i thjeshtë, pa React.
4. **Mobile-first.** Shumica e vizitorëve janë në telefon. Çdo ndryshim
   verifikohet në 375px para se të konsiderohet i mbaruar.
5. **Zona prekjeje minimale 44px** për çdo buton dhe link.
6. **Ngjyrat vetëm nga token-at** te `global.css`. Asnjë hex i koduar në
   komponentë.
7. **Asnjë animim nuk guxon ta fshehë përmbajtjen.** Shfaqja graduale
   (`data-reveal`) bëhet me `animation-timeline: view()`, pra vetëm CSS.
   Mos e kthe në variantin me `opacity: 0` + JavaScript: nëse skripti nuk
   niset, faqja mbetet bosh. Shfletuesit pa mbështetje e tregojnë përmbajtjen
   normalisht.
8. **Dekori nuk meriton JavaScript.** `AuroraBackground.astro` është vetëm CSS.
   Erdhi si komponent React me `framer-motion`; u rishkrua sepse hero-ja mban
   `<h1>`-in dhe s'duhet të varet nga skripti. Kryefaqja sot dërgon ~3 KB JS.

## Ngjyrat

Nga logoja: jeshile `#122B25`, ar `#B28B4A`.
Ari `#B28B4A` mbi të bardhë jep 3.14:1 — **nuk përdoret për tekst**. Për tekst
përdor `gold-600` (`#8A6A34`, 5.01:1). Mbi sfond jeshil përdor `gold-300`.

## Struktura

- `src/config/site.ts` — të dhënat e biznesit. Burimi i vetëm.
- `src/content/categories/*.md` — kategoritë. Do të redaktohen nga CMS-ja.
- `src/content/products/*.md` — produktet. Do të redaktohen nga CMS-ja.
- `src/content/posts/*.md` — shkrimet e blogut. Do të redaktohen nga CMS-ja.
- `src/lib/catalog.ts` — leximi i koleksioneve, gjuha, kategoritë e fshira.
- `src/lib/cart.ts` — shporta, localStorage, ndërtimi i mesazhit WhatsApp.
- `src/lib/search.ts` — kërkimi, pa DOM. `scripts/test-search.mjs` e provon.
- `src/lib/i18n.ts` — të gjitha fjalët e ndërfaqes dhe të gjitha adresat.
- `src/lib/legal.ts` — teksti i kushteve dhe i privatësisë, në të dyja gjuhët.
- `src/components/pages/` — trupi i çdo faqeje, merr `lang`.
- `src/pages/` — vetëm rrugë të holla që thërrasin komponentin me gjuhën e vet.
- `src/components/` — Header, Footer, LangSwitch, Search, ProductCard, PostCard,
  CartWidget, AddToCart, TrustStrip, StatsCounter, AuroraBackground, HeroFlourish.
- `scripts/` — build-logo, build-blog-placeholders, optimize-images, audit, test-search.
- `public/admin/` — Sveltia CMS (`index.html` + `config.yml`). Shih "Gjendja aktuale".

### Fotot

Klienti i hedh fotot te `public/blog/` (kapakët e shkrimeve) dhe `public/foto/`
(produktet). `npm run fotot` nis vetë para çdo build-i dhe bën katër gjëra:
zvogëlon deri në 1600px, rrotullon sipas EXIF-it (pa këtë fotot vertikale nga
telefoni dalin anash), heq EXIF-in — fotot e telefonit mbajnë koordinatat
GPS dhe ato nuk publikohen — dhe **pret sfondin bosh te fotot e produkteve**.

Prerja vlen vetëm për `public/foto`. Klienti i ngarkon fotot me sfond të
bardhë por të pakuadruara: produkti rri i vogël në mes dhe faqja e tregon
bardhësinë bosh si pjesë të fotos. Skripti e heq vetë, që produkti të mbushë
kartën pa i kërkuar klientit të dijë të presë foto. Blogu nuk preket — aty
fotoja është pamje me kompozim dhe prerja do ta prishte.

E vetmja gjë që i thuhet klientit: **sfondi i fotos të jetë i bardhë.** Forma
nuk ka rëndësi — korniza është katrore dhe fotoja shfaqet me `object-contain`,
pra kutitë e gjera mbushin gjerësinë, shishet e gjata lartësinë. Asnjë foto
nuk pritet nga CSS-ja; `object-cover` hante deri në gjysmën.

Korniza e fotos është **e bardhë te fotot reale, bezh vetëm te placeholder-i**.
Sepse sfondi i fotos është i bardhë: mbi bezh dilte si katror i bardhë brenda
një kutie. Vlen te të katër vendet ku del foto e produktit — karta, faqja e
produktit, lista e kërkimit, shporta. Placeholder-i e mban bezhin, përndryshe
vizatimi gri do të notonte mbi të bardhë pa asnjë kufi. Krahasimi bëhet me
`PRODUCT_PLACEHOLDER` te `site.ts`, kurrë me varg të shkruar me dorë.

`PIPELINE_VERSION` te skripti ndryshohet kur ndryshon vetë përpunimi — fotot e
produkteve rikalohen njëherë, blogu jo, që të mos rikompresohet pa nevojë.

`scripts/.image-cache.json` mban shenjën e asaj që ka nxjerrë vetë skripti, që
e njëjta foto të mos rikompresohet në çdo build dhe të humbasë cilësi. Çelësat
ruhen me `/`, jo me `\`, sepse Netlify ndërton në Linux.

### Dygjuhësia

Shqipja rri te rrënja (`/produktet`), anglishtja nën `/en/` me adresa angleze
(`/en/products`). Rrugët nuk shkruhen me dorë — merren me `path(lang, 'products')`
te `src/lib/i18n.ts`. Aty janë edhe të gjitha fjalët; **mos shkruaj tekst
ndërfaqeje drejt e në komponentë.**

Çdo faqe duhet t'i japë `Base`-it fushën `alternates` me të dyja adresat. Prej
saj dalin `hreflang`, `og:locale:alternate` dhe ndërruesi i gjuhës. Tipi e
kërkon shprehimisht; `null` lejohet vetëm te 404-a, që merr `noindex`.
`npm run audit` e kontrollon këtë te çdo faqe e ndërtuar.

Shkrimet e blogut janë një file për gjuhë. Posti anglisht mban `translationOf`
me slug-un e postit shqip; pa të, ndërruesi çon te lista e blogut, jo te 404.

### Kategoritë — kërkesë e klientit

Kategoritë NUK dalin në navbar. Jetojnë brenda `/produktet` dhe brenda çdo faqeje
kategorie, si filtra. Navbar-i mban Kryefaqja, Produktet, Këshilla, Kontakt.
Arsyeja: klienti do t'i shtojë e fshijë vetë nga CMS-ja pa e prekur navigimin.

"Rreth nesh" u hoq nga navbar-i me kërkesë të klientit, por faqja rri aty ku
ishte dhe lidhet nga footer-i.

Fusha `category` te produktet është string i thjeshtë, jo `reference()`. Me
qëllim: nëse fshihet një kategori që ka produkte brenda, build-i vazhdon,
produktet mbeten te `/produktet` dhe del njoftim në terminal. Shih
`getOrphanProducts()`.

## Porosia

Nuk ka pagesë me kartë. Klienti mbush shportën, klikon, hapet WhatsApp me
mesazhin gati, e dërgon vetë. Pagesa cash në dorëzim.

URL-ja e WhatsApp ka limit karakteresh — mbi `site.cartMessageLimit` artikuj,
mesazhi kalon në përmbledhje. Mos e hiq këtë logjikë.

## Kufizim ligjor

Barnat me recetë NUK shiten online. Vetëm OTC, kozmetikë, suplemente, pajisje.
Mos shto kategori ose produkte që bien ndesh me këtë.

## Gjendja aktuale

Të mbaruara, në të dyja gjuhët: kryefaqja, produktet, kategoritë, faqja e
produktit, blogu, kërkimi, kontakti, rreth nesh, privatësia, kushtet, 404,
shporta me checkout WhatsApp. 43 faqe gjithsej.

**Publikuar.** Repo në GitHub (`monarkautomations/rei-pharma`), lidhur me
Netlify — çdo `git push` në `main` del online vetvetiu brenda ~1-2 minutash.
Sitemap real gjenerohet në build (`@astrojs/sitemap`, shih `astro.config.mjs`);
`robots.txt` nuk gënjen më dhe bllokon `/admin/`.

**CMS gati.** Sveltia CMS te `/admin` (file-t: `public/admin/index.html` dhe
`public/admin/config.yml`). Backend GitHub përmes proxy-t OAuth të Netlify-t
(`base_url: https://api.netlify.com`) — s'kërkon Netlify Identity, s'kërkon
aplikacion OAuth të veçantë. Klienti hyn me llogari GitHub; për të shkruar,
duhet të jetë bashkëpunëtor (collaborator) i ftuar te repo-ja.

Tri koleksionet përputhen fjalë për fjalë me `content.config.ts` — çdo ndryshim
skeme atje kërkon të njëjtin ndryshim te `config.yml`, përndryshe CMS-ja do të
shkruajë fusha që Zod i refuzon. Sllugu transliterohet vetë (ë→e, ç→c) sipas
kërkesës së PUNA.md — provuar kundrejt file-ave ekzistues.

Fotot e ngarkuara nga CMS-ja shkojnë te `public/foto` (produkte, kategori) ose
`public/blog` (kapakët e shkrimeve) — të dyja tashmë të mbuluara nga
`npm run fotot`.

**Kurth i provuar:** `media_folder`/`public_folder` DUHEN te niveli i
koleksionit (siç janë tani), KURRË te fusha individuale (`image:`, `cover:`).
Sveltia CMS i shpërfill heshtazi mbivendosjet e vendosura te fusha — klienti
ngarkoi një foto kategorie dhe shkoi te `src/content/categories/public/foto/`
në vend të `public/foto/`. Shih Sveltia CMS discussion #190. Nëse shtohet
koleksion i ri me foto, vendos `media_folder: "/public/..."` (me `/` — e
detyrueshme që të llogaritet nga rrënja e repos, jo nga dosja e koleksionit)
te vetë koleksioni, jo brenda `fields:`.

### Logoja

Origjinali është `public/logo-full.jpg` — katror, me sfond, i padobishëm në një
header 64px. `npm run logo` nxjerr prej tij monogramin, fjalën, logon
horizontale, variantin e çelët për sfond të errët, favicon-in dhe kapakët e
blogut. Kur klienti dërgon logo të re, zëvendëso `logo-full.jpg` dhe rinis
komandën — asnjë rresht kodi nuk ndryshon.

### Numrat te kryefaqja

`stats` te `site.ts` janë konfirmuar nga klienti. Nuk duhen rikonfirmuar.

Mungon:
- Produktet reale (të 7-tat janë placeholder, marka shkruan "PLACEHOLDER") —
  klienti do t'i shtojë vetë nga CMS-ja kur ta ketë gati. Mos i shpik ti.
- Fotot e produkteve (sot vizatimi gri). Fotot e blogut tashmë janë vendosur.
- Domeni `reipharma.al` — sot site-i rri te adresa falas e Netlify-t.
  `astro.config.mjs` dhe `site.ts` presin `reipharma.al`; kur domeni të lidhet
  vërtet, kontrollo që s'ka mbetur gjë e koduar me adresën e vjetër Netlify.

## Konfirmuar me klientin

Telefoni, orari dhe emri te `site.ts` janë konfirmuar — mbeten siç janë, edhe
pse ndryshojnë nga Google Business (shih komentet te `site.ts`). Numrat te
kryefaqja gjithashtu janë konfirmuar. Asnjë prej tyre nuk duhet rihapur.

## Stili i punës

Shkruaj në shqip me përdoruesin. Ai është në fillim me terminalin — shpjego
komandat, mos i supozo. Verifiko me `npm run build` para se të thuash që diçka
u mbarua.
