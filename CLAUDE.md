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

Auditi i dekodon entitetet HTML para se të masë gjatësinë e titullit dhe të
description-it: kufijtë 65 dhe 165 janë për atë që tregon Google, dhe Google
tregon `&`, jo `&amp;`. Pa këtë, tetë faqe me `&` te emri u shënuan gabimisht
si të tejkaluara kur katalogu u rrit.

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
  CartWidget, AddToCart, TrustStrip, StatsCounter, AuroraBackground, HeroFlourish,
  ProductGallery, PriceFilter, CategorySelect, Pagination, WishButton.
- `scripts/` — build-logo, build-blog-placeholders, optimize-images, audit,
  test-search, test-schema, check-slugs, mungesat, importo.
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
ruhen me `/`, jo me `\`, sepse ndërtimi bëhet në Linux.

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

## Fotot e shumta, zmadhimi, filtri i çmimit

Tri kërkesa të klientit, shtator 2026. Të treta pa React — rregulli 3.

**Galeria** (`ProductGallery.astro`). Fusha `images` te CMS-ja mban foto shtesë;
`image` mbetet kryesorja dhe vetëm ajo del te kartat, shporta, kërkimi dhe
JSON-LD. `catalog.ts` e ndërton `product.gallery`: kryesorja e para, pastaj
shtesat që ekzistojnë vërtet te `public/`, pa përsëritje. Me një foto të vetme,
miniaturat nuk shfaqen fare.

**Zmadhimi sillet ndryshe sipas pajisjes**, sepse edhe pritshmëria është tjetër:

- **me mi** — fotoja rritet dy herë dhe ndjek kursorin, si te dyqanet e mëdha.
  Nuk hapet asgjë; lëviz miun dhe sheh detajin.
- **me prekje** — hapet e plota mbi sfond të errët, kurrë e prerë. Zmadhimi që
  ndjek gishtin s'ka kuptim kur gishti e mbulon vetë foton.

Dallimi bëhet me `(hover: hover) and (pointer: fine)`, **jo me gjerësinë e
ekranit**: një laptop me ekran të vogël ka mi, një tablet i madh jo.

Dritarja është `<dialog>` me `showModal()`. Shfletuesi jep vetë sfondin e
errët, mbylljen me Escape dhe kthimin e fokusit. `<dialog>` ka `max-width` dhe
`max-height` të vetat (rreth 90%) që e ngushtonin foton — prandaj vihen 100%
me dorë.

**Filtri i çmimit** (`PriceFilter.astro`) është `<select>` i vërtetë, jo butona
dhe jo menu e ndërtuar me div-a. Pesë intervale bashkë me filtrat e kategorive
do të bënin dy rreshta butonash në telefon; kështu zë një rresht. Dhe `<select>`
hap zgjedhësin e vetë sistemit në telefon, punon me tastierë dhe me lexues
ekrani pa i shkruar ne ato sjellje.

Punon mbi kartat që janë tashmë në HTML: fsheh e shfaq, nuk kërkon gjë nga
serveri dhe nuk e prek adresën. Numrat llogariten në build nga produktet e asaj
faqeje, ndaj përshtaten vetë kur klienti shton produkte. Kovat bosh nuk shfaqen.

Intervalet te `priceBuckets` në `site.ts` nuk janë të rastit — shih komentin
aty. Ndarja standarde 1000/2000/3000/5000 do të fuste 58% të katalogut nën një
filtër të vetëm; kjo e tanishmja e mban maksimumin te 33%. Nëse katalogu
zhvendoset, rimat shpërndarjen para se t'i ndryshosh.

Të tria rrinë të fshehura pa JavaScript në mënyrë që të mos dalin butona që nuk
bëjnë asgjë; përmbajtja — fotot dhe produktet — është gjithmonë në HTML.

## Lista e dëshirave

Zemra mbi çdo kartë ruan një produkt te `localStorage` (`src/lib/wishlist.ts`).
Pa React dhe pa nanostores — rregulli 3. Shporta i ka të dyja sepse mban
sasira, çmime dhe një panel; kjo mban një listë adresash, dhe për aq gjë një
ishull React do të ishte tepricë.

Faqja `/te-preferuarat` (`/en/favourites`) i merr të dhënat nga **indeksi i
kërkimit që ekziston tashmë** (`/kerko.json`), jo nga një burim i dytë: aty
janë emri, çmimi, fotoja dhe kategoria në të dyja gjuhët.

Ajo faqe merr `noindex` edhe pse ka të dyja gjuhët — përmbajtjen e ka te
shfletuesi i vizitorit, ndaj te Google do të dilte bosh. Për këtë u shtua fusha
`noindex` te `Base.astro`; deri atëherë `noindex` vinte vetëm nga
`alternates: null`, që vlen për 404-n.

Zemrat te kartat rrinë të fshehura derisa skripti të niset — një buton që nuk
bën asgjë është më keq se mungesa e tij. Zemra te navbar-i bën përjashtim me
kërkesë të klientit: duket gjithmonë, edhe me listën bosh, sepse është pikë
navigimi jo veprim. Fshihet vetëm numri mbi të.

**Kurth i provuar:** komenti `{/* ... */}` mes `</head>` dhe `<body>` e bën
Astro-n ta hedhë krejt etiketën `<body>`, bashkë me klasat `min-h-screen flex
flex-col` — dhe faqja mbetet pa paraqitjen e vet, pa asnjë gabim në build.
Komentet për `<body>` shkruaji **brenda** tij.

## Ndarja e punës me klientin

Klienti fut nga CMS-ja atë që vetëm ai e di: **fotot, emrin, çmimin, kategorinë**.
Pjesa tjetër plotësohet nga administrimi, kur ai e kërkon.

Prandaj `desc_sq`, `desc_en` dhe `name_en` janë **opsionale** te
`public/admin/config.yml`. Ishin të detyrueshme, dhe CMS-ja nuk e linte të
ruante pa i mbushur — pikërisht ajo që e bllokonte.

Faqja del e plotë edhe pa përshkrim:

- paragrafi nuk shfaqet fare, që të mos mbetet vrimë mes çmimit dhe butonit
- `meta description` dhe JSON-LD ndërtohen nga emri, kategoria dhe çmimi —
  fakte, kurrë tekst i shpikur. Për një farmaci kjo nuk është hollësi stili:
  pretendime shëndetësore që s'i ka shkruar askush nuk dalin dot nga kodi.
- emri anglisht bosh merr shqipen, siç bënte klienti vetë 40 herë nga 72

```bash
npm run mungesat   # lexon produktet dhe tregon ç'ka mbetur mangët
```

Raporton: kategori a foto që mungon, foto që s'ekziston te `public/`,
përshkrim bosh a shumë i shkurtër, përshkrim anglisht i njëjtë me shqipen,
emër që mungon, markë që ende shkruan `PLACEHOLDER`.

Vetëm lexon — nuk ndryshon asgjë.

**Kurthi i parë i kësaj komande, i mbajtur këtu:** versioni i parë lexonte
frontmatter-in me regex mbi një rresht, dhe raportoi 39 "përshkrime të
shkurtra". Ishin blloqe YAML të plota (`desc_sq: |-` me tekstin poshtë). Puna
do të kishte nisur mbi një listë të rreme. Kur shton kontroll të ri atje,
provoje kundrejt një file-i që përdor bllok, jo vetëm kundrejt njërit me vlerë
në një rresht.

## Importi nga FarmaCity

Klienti ra dakord me FarmaCity (`farma-city.al`) për përdorimin e produkteve.
`npm run importo` merr katalogun e tyre dhe shkruan produkte te
`src/content/products/` plus fotot te `public/foto/`.

```bash
npm run importo                       # vetëm raport, nuk prek asgjë
npm run importo -- --vetem-tonat      # vetëm kategoritë që Rei ka sot
npm run importo -- --kufi=150         # sa produkte më së shumti
npm run importo -- --kategori=fytyra  # një degë e vetme e FarmaCity-t
npm run importo -- --shkruaj          # shkruan vërtet
```

Pa `--shkruaj` nuk shkruan asnjë skedar. Import i madh mbi një site të gjallë
klienti nuk duhet ta ketë hapin e parë të pakthyeshëm.

Burimi është **Store API e WooCommerce-it** (`/wp-json/wc/store/v1/products`),
publike dhe pa çelës. Jo lexim HTML-je: çmimi vjen si numër, kategoritë si
listë, fotoja si adresë. Asgjë nuk hamendësohet nga pamja e faqes.

Merr vetëm atë që fut edhe klienti — **emrin, çmimin, foton, kategorinë**.
Përshkrimet rrinë jashtë veç me `--me-pershkrime`, sepse teksti i tyre është
pjesa më e ndjeshme e lejes dhe pjesa që administrimi e shkruan gjithsesi vetë.

Çmimi merret nga `regular_price`, kurrë nga çmimi me zbritje, dhe `oldPrice`
mbetet `null`: një ofertë e FarmaCity-t nuk është ofertë e Rei-t. **Çmimet
janë të tyret dhe duhen parë një nga një nga klienti.**

### Sa u importuan vërtet

**939 produkte**, më 7 shtator 2026. Katalogu sot ka **1011** — 72 të klientit
plus 939 të importuara. Importi u ndal me dorë aty; nuk u shkuan deri në fund
të 5579-at. Shih kufijtë poshtë për arsyen.

    katalogu i tyre        6307
    me variante               702   nuk importohen — s'ka zgjedhës variantesh
    pa kategori                11
    të importueshme          5579
    të marra                  939

Që andej u krijuan 9 kategori të reja; sot janë 17 gjithsej.

Përshkrimet **nuk kopjohen ashtu siç janë** — shih `pershtatShqip()`. Teksti i
FarmaCity-t nis me përsëritjen e emrit (te ne emri është `<h1>` pikërisht
sipër) dhe vazhdon me tituj seksionesh që te ne s'kanë ku shfaqen. Rindërtohet
në formën e këtij site-i: një paragraf çfarë është, pastaj `Përdorimi:`,
`Përbërja:`, `Kujdes:`. Asnjë fjalë e re nuk shtohet.

Anglishtja ndërtohet nga faktet, nuk përkthehet: FarmaCity nuk ka version
anglisht (`/en/` kthen 404, s'ka shtojcë përkthimi). Një përkthim i bërë nga
kodi mbi mijëra tekste farmaceutike do të prodhonte pretendime shëndetësore që
nuk i ka shkruar askush. Prandaj `anglishtja()` shkruan vetëm ç'është produkti,
kush e bën, sa është dhe ku blihet.

**Kurth i provuar:** WordPress-i i kodon shkronjat jo-ASCII te slug-u —
"Vitamin 5C³" del `vitamin-5c%c2%b3`. Ai varg bëhet edhe emër skedari edhe
adresë, dhe të dyja prishen: shfletuesi e dekodon `%c2%b3` në `³` dhe kërkon
një skedar që në disk quhet fjalë për fjalë `%c2%b3`. Fotoja del e thyer pa
asnjë gabim në build. `slugPastruar()` e ndalon.

Kategoritë e tyre janë 254 në tre nivele; te `RREGULLAT` përkthehen në 17 të
Rei-t, **të renditura** — fiton rregulli i parë që përputhet. Prandaj një krem
dielli për bebe shkon te dielli, jo te bebet.

API-ja jep vetëm kategoritë e caktuara drejtpërdrejt, jo prindërit: 1161
produkte nga 6307 nuk mbanin asnjë kategori rrënjë. `meGjithePrinderit()` e
plotëson pemën para se të vendosë; pa të, secili prej tyre do të mbetej pa
kategori.

### Kufijtë, matur — jo hamendësuar

Cloudflare falas pranon **20 000 skedare** për version; hapësira dhe kërkesat
te skedarët statikë janë falas dhe pa kufi. Pra kufiri i vetëm real është numri
i skedarëve. Me 1011 produkte `dist/` ka **3303** — 17% e kufirit.

Me të 5579-at do të bëhej ~17 000: brenda, por pa hapësirë për t'u rritur.
Prandaj `--foto-shtese` mbetet e fikur; 898 produkte kanë më shumë se një foto
dhe ato vetëm do ta kalonin kufirin.

Fotot e importuara zunë 128 MB të papërpunuara dhe **49 MB pas `npm run fotot`**.
Me të 5579-at do të ishin ~690 MB të papërpunuara në repo, dhe sharp do t'i
kalonte të gjitha në çdo ndërtim të pastër te hosti.

**Pyetja që nuk zgjidhet nga kodi, dhe që e ndali importin këtu:** Rei do të
reklamonte produkte që nuk i ka në raft. Porosia vjen te WhatsApp-i dhe
përgjigjja bëhet "nuk e kemi". Vazhdimi është një komandë larg — komanda i
kapërcen vetë ato që ekzistojnë.

## Listat: ndarja në faqe dhe dy zgjedhësit

Të dyja erdhën kur katalogu kaloi nga 72 produkte në 1011. Deri atëherë asnjëra
nuk duhej.

**Ndarja në faqe** (`Pagination.astro`, `productsPerPage` te `site.ts`).
Me 72 produkte `/produktet` peshonte 322 KB. Me 1011 do të bëhej **~4,5 MB** —
secila kartë mban edhe një ishull React për shportën, dhe faqja thjesht nuk
hapej në telefon. Sot është **148 KB**.

24 për faqe, sepse pjesëtohet me 2 (grid-i në telefon) dhe me 4 (desktop):
asnjë rresht i fundit gjysmak.

Faqja e parë mban adresën e vet të pastër — `/produktet`, jo `/produktet/1` —
me `[...faqe]`, që asnjë lidhje ekzistuese të mos prishet dhe Google të mos
shohë dy adresa për të njëjtën përmbajtje. Faqet 2+ marrin titull të vetin;
pa këtë do të dilnin 43 faqe me të njëjtin titull. `alternates` llogaritet për
çdo faqe veç, ndaj `hreflang` çon te faqja **e njëjtë** në gjuhën tjetër.

**Kategoritë si `<select>`** (`CategorySelect.astro`), me kërkesë të klientit.
Ishin butona rrethorë: me 8 kategori zinin dy rreshta, me 17 zinin **gjashtë**
dhe e shtynin produktin e parë poshtë ekranit.

Lidhjet e vjetra nuk u hoqën — rrinë te HTML-ja dhe fshihen vetëm kur skripti
niset. Pa JavaScript butonat mbeten të plotë, dhe crawler-at gjejnë lidhje të
vërteta drejt çdo kategorie (rregulli 1). Një `<select>` i vetëm do t'i linte
17 kategoritë pa asnjë lidhje hyrëse.

**Kufizim i njohur:** filtri i çmimit vepron mbi kartat e faqes që je duke
parë, jo mbi gjithë kategorinë — ato janë kartat që ekzistojnë në HTML. Numrat
pranë intervaleve llogariten po nga ajo faqe, që të përputhen me atë që sheh
vizitori pas zgjedhjes. Për filtër mbi gjithë kategorinë do të duhej të
ndërtohej mbi `/kerko.json`, si faqja e të preferuarave.

### Indeksi i kërkimit ka kufi te përshkrimi

`/kerko.json` mbante `desc_sq` dhe `desc_en` të plota dhe u fry në **1,3 MB**
me 1011 produkte — skedar që e shkarkon çdo vizitor që shtyp te kërkimi ose hap
të preferuarat. Sot përshkrimi pritet në 140 shkronja (`DESC_INDEKS`) dhe
indeksi është **539 KB**.

Nuk humbet gjë: përshkrimi nuk shfaqet asgjëkund, `src/lib/search.ts` e përdor
vetëm për përputhje dhe me peshën më të ulët — 10 pikë kundrejt 100 për emrin.
Fjalia e parë thotë ç'është produkti; pjesa tjetër është udhëzim përdorimi, që
askush nuk e shkruan te kutia e kërkimit.

**Kur ndryshon `kerko.json.ts`, ndrysho njësoj `en/search.json.ts`** — janë
identikë përveç emrit.

## Adresat e produkteve

Adresa vjen nga emri i file-it te `src/content/products/`, i cili vendoset kur
produkti krijohet dhe nuk lëviz kur klienti i ndërron emrin brenda. Kjo është
sjellje e duhur — adresat s'duhet të ndryshojnë vetvetiu — por krijon një kurth:
nëse klienti **ripërdor** një produkt ekzistues në vend që të krijojë të ri,
adresa mbetet duke treguar produktin e vjetër. Ndodhi më 4 shtator:
`/produkt/omega-3/` hapte një vitaminë D3+K2.

U riemërtuan tre file dhe `public/_redirects` mban gjallë adresat e vjetra me
301. Adresat e shkurtra që janë thjesht më të shkurtra se emri i plotë
(`krem-dielli-spf50` për "Krem dielli SPF 50+ për fytyrë") **nuk preken** —
janë të sakta dhe adresa e shkurtër është më e mirë.

Kur të riemërtohet ndonjë tjetër, kontrollo me:

```bash
npm run slugs   # krahason çdo slug me emrin e produktit
```

## Porosia

Nuk ka pagesë me kartë. Klienti mbush shportën, klikon, hapet WhatsApp me
mesazhin gati, e dërgon vetë. Pagesa cash në dorëzim.

URL-ja e WhatsApp ka limit karakteresh — mbi `site.cartMessageLimit` artikuj,
mesazhi kalon në përmbledhje. Mos e hiq këtë logjikë.

## Kufizim ligjor

Barnat me recetë NUK shiten online. Vetëm OTC, kozmetikë, suplemente, pajisje.
Mos shto kategori ose produkte që bien ndesh me këtë.

## Përmbajtja nga CMS-ja nuk e thyen dot site-in

Rregull i shtuar pasi ndodhi e kundërta: klienti la bosh një fushë, CMS-ja
shkroi `oldPrice: null`, skema e refuzoi dhe build-i u ndal. Shtatë commit-e të
tijat mbetën pa dalë online, pa asnjë shenjë te CMS-ja — për të gjithçka dukej
e ruajtur.

Kontrata sot ka dy shtresa:

1. **`src/lib/schema.ts` nuk dështon kurrë.** Çdo fushë ka rrugëdalje: `null`,
   `""`, tekst në vend të numri, datë e pavlefshme — të gjitha korrigjohen.
   Kurrë mos shto `z.number()` ose `z.string()` të zhveshur; përdor
   `cmsOptional` / `cmsDefault`.
2. **`src/lib/catalog.ts` është rojtari.** Vendos çfarë mund të dalë para
   vizitorit: produkt pa çmim nuk shfaqet, foto që s'ekziston zëvendësohet me
   placeholder-in, çmim i vjetër më i vogël se aktuali nuk bëhet "ofertë" e
   rreme, emër që mungon merret nga gjuha tjetër ose nga slug-u. Çdo korrigjim
   shkruhet në terminal me parashtesën `[katalogu]`.

`scripts/test-schema.mjs` nis para çdo build-i dhe i jep skemës pikërisht atë
që shkruan CMS-ja. **Kur shton fushë te `public/admin/config.yml`, shto rast
atje.** Ndryshe kjo klasë gabimi kthehet, dhe kthehet te klienti, jo te ti.

Kufizim me vetëdije: emrat e produkteve priten në dy rreshta te kartat
(`line-clamp-2`). Pa këtë, një emër i gjatë e bënte kartën 527px kundrejt
320px të fqinjës. Emri i plotë del te faqja e produktit.

## Publikimi — Cloudflare, jo Netlify

Site-i hostohet te **Cloudflare Workers** (`wrangler.jsonc` te rrënja), dhe
hyrja e CMS-së kalon nga një portier i veçantë te e njëjta llogari. Netlify nuk
përdoret më për asgjë.

    site-i        rei-pharma.reipharma.workers.dev
    portieri      sveltia-cms-auth.reipharma.workers.dev
    repo i tij    monarkautomations/sveltia-cms-auth

Çdo `git push` në `main` ndërtohet dhe del online brenda ~1 minute.

### Pse u largua nga Netlify — dy pengesa, jo një

**E para: një kontribues për repo private.** Klienti shkruan nga CMS-ja me
llogarinë e vet GitHub, pra ishte kontribuesi i dytë, dhe çdo commit i tij
bllokohej para se build-i të niste (`Build blocked: unrecognized Git
contributor`). Repo-ja u bë publike dhe kjo u zgjidh.

**E dyta: kreditet e ndërtimit.** Pak orë më vonë Netlify i ndaloi publikimet
sepse u shpenzuan kreditet e ciklit — që rinovohej pas 27 ditësh. Site-i mbeti
online, por asgjë e re nuk dilte. Kjo e mbylli çështjen: hostimi kaloi te
Cloudflare, ku plani falas jep 500 ndërtime në muaj.

`public/_redirects` punon njësoj te Cloudflare — i njëjti format.

### Portieri i hyrjes

`api.netlify.com/auth` u shërben vetëm sajteve të hostuara te Netlify. Sapo
site-i kaloi te Cloudflare, hyrja filloi të kthente "Not Found". Zëvendësuesi
është [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth).

Konfigurimi i tij rri te **`wrangler.toml` i atij repo-je, jo te paneli**:
`wrangler deploy` i merr variablat nga file-i, ndaj vlerat e vendosura vetëm te
paneli fshihen te publikimi i ardhshëm — dhe hyrja do të prishej pa asnjë shkak
të dukshëm. `GITHUB_CLIENT_SECRET` bën përjashtim: rri si Secret te paneli, ku
wrangler nuk e prek.

`ALLOWED_DOMAINS` përmban tashmë `reipharma.al` dhe `*.reipharma.al`, ndaj
lidhja e domenit nuk kërkon asnjë ndryshim aty.

### Një diagnozë e gabuar, e mbajtur këtu me qëllim

Kur commit-et e klientit nuk dilnin online, u konkludua se "commit-et që CMS-ja
bën përmes API-t nuk e nisin dot publikimin", dhe u ndërtua një workflow që i
niste ndërtimet me build hook. Ishte gabim: ato e nisnin ndërtimin çdo herë —
Netlify i bllokonte. Dëshmia (shtytja e pronarit punonte, e klientit jo)
përputhej me të dyja shpjegimet, dhe u zgjodh i gabuari. Workflow-i u hoq.

Mësimi: kur dy shpjegime përputhen me të njëjtat fakte, shko te burimi që i
ndan — atëherë faqja "Deploys" — në vend që të ndërtosh mbi hamendje.

### Kur diçka nuk del online

1. **Cloudflare → Workers & Pages → `rei-pharma` → Deployments.** Aty duket çdo
   ndërtim me shkakun e dështimit. Ky është burimi i vërtetë.
2. Site-i online nuk prishet nga një ndërtim i dështuar — mbetet versioni i
   mëparshëm. Rreziku është që puna e klientit të mos dalë, jo që faqja të thyhet.
3. Nëse ndërtimi është i gjelbër por diçka mungon, kërko `[katalogu]` te log-u.

### Skemat rrinë te `.mjs`, jo `.ts` — me qëllim

`src/lib/schema.mjs` e lexon edhe `scripts/test-schema.mjs`, që nis para
`astro build`, pra edhe Node-i i thjeshtë te hosti. Si `.ts`, importi varej
nga leximi vetiu i TypeScript-it — veçori që Node-i e ka vetëm nga 22.18 e
tutje, dhe versionin atje e zgjedh hosti, jo ne. **Mos e kthe në `.ts`.**
Tipat nuk humbasin: Zod-i i nxjerr vetë.

## Gjendja aktuale

Të mbaruara, në të dyja gjuhët: kryefaqja, produktet, kategoritë, faqja e
produktit, blogu, kërkimi, kontakti, rreth nesh, privatësia, kushtet, 404,
shporta me checkout WhatsApp.

**1011 produkte, 17 kategori, 2233 faqe të ndërtuara.** Katalogu u rrit më
7 shtator 2026 me importin nga FarmaCity — shih atë seksion. Prej tij dolën
edhe ndarja në faqe edhe zgjedhësi i kategorive; shih "Listat".

**Publikuar.** Repo publik në GitHub (`monarkautomations/rei-pharma`), lidhur me
Cloudflare — çdo `git push` në `main` del online brenda ~1 minute. Shih
"Publikimi" më lart për arsyet.
Sitemap real gjenerohet në build (`@astrojs/sitemap`, shih `astro.config.mjs`);
`robots.txt` nuk gënjen më dhe bllokon `/admin/`.

**CMS gati dhe në përdorim.** Sveltia CMS te `/admin` (file-t:
`public/admin/index.html` dhe `public/admin/config.yml`). Backend GitHub përmes
portierit tonë te Cloudflare — shih "Portieri i hyrjes" më lart. Klienti hyn me
llogari GitHub; për të shkruar, duhet të jetë bashkëpunëtor (collaborator) i
ftuar te repo-ja. Provuar: klienti punon vetë prej 4 shtatorit.

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
- **Domeni `reipharma.al`** — ende i pablerë. Sot site-i rri te adresa e gjatë
  e Cloudflare-it. Lidhet te Cloudflare → `rei-pharma` → **Domains** →
  *Add Domain*. `astro.config.mjs` dhe `site.ts` e presin tashmë atë domen, dhe
  `ALLOWED_DOMAINS` i portierit e ka brenda — pra nuk duhet asnjë ndryshim kodi.
- **Sajti i vjetër te Netlify** është ende online me përmbajtje të ngrirë të
  4 shtatorit. Duhet fikur që të mos rrinë dy kopje të indeksueshme.
- Disa produkte placeholder (marka shkruan "PLACEHOLDER") që klienti po i
  zëvendëson një nga një. Mos i shpik ti.

## Konfirmuar me klientin

Telefoni, orari dhe emri te `site.ts` janë konfirmuar — mbeten siç janë, edhe
pse ndryshojnë nga Google Business (shih komentet te `site.ts`). Numrat te
kryefaqja gjithashtu janë konfirmuar. Asnjë prej tyre nuk duhet rihapur.

## Stili i punës

Shkruaj në shqip me përdoruesin. Ai është në fillim me terminalin — shpjego
komandat, mos i supozo. Verifiko me `npm run build` para se të thuash që diçka
u mbarua.
