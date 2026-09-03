# Porosi pune — Rei Pharma

Ky projekt është site e-commerce për një farmaci reale në Tiranë. Klient i
paguar, jo ushtrim. Dosja është ndërtuar tashmë deri diku dhe ti do ta çosh
deri në fund.

**Fillo duke lexuar `CLAUDE.md` në rrënjë.** Aty janë rregullat teknike dhe
gjendja aktuale. Mos i shkel ato rregulla pa më pyetur.

## Si të punosh me mua

Unë jam në fillim me terminalin dhe me kodin. Shpjego komandat para se t'i
japësh, mos supozo se di. Fol shqip. Mos më dërgo blloqe të gjata kodi për t'i
lexuar — bëji ndryshimet vetë dhe më thuaj çfarë bëre me dy fjali.

Puno me faza. Në fund të çdo faze, verifiko me `npm run build` dhe më trego
çfarë të shoh në browser. Mos kalo në fazën tjetër pa më pyetur.

## Hapi 0 — verifiko atë që ekziston

Para se të ndërtosh gjë të re:

1. `npm install` dhe `npm run dev`
2. Hap site-in dhe kaloji të gjitha faqet: `/`, `/produktet`,
   `/kategoria/kujdesi-ndaj-diellit`, `/kontakt`, `/rreth-nesh`, `/kushtet`,
   `/privatesia`, dhe një URL që s'ekziston për 404
3. Testo shportën: shto produkte, ndrysho sasinë, hiq një, rifresko faqen
   (duhet të mbetet), kliko checkout-in e WhatsApp
4. Kontrollo në 375px gjerësi — menuja, hero-ja, grid-i i produkteve
5. `npm run build` duhet të kalojë pa gabime

Ky kod është shkruar pa u ekzekutuar asnjëherë. Ka gjasa reale të ketë gabime.
Gjeji dhe rregulloji përpara se të vazhdosh. Më raporto çfarë gjete.

## Fazat, sipas radhës

### Faza 1 — faqja e produktit

Sot kartat e produkteve nuk klikohen askund. Kjo është mangësia më e madhe.

Ndërto `/produkt/[slug]` me: foto e madhe, emër, çmim, përshkrim i plotë,
gjendje stoku, buton "Shto në shportë", markë, kategori me link kthimi,
produkte të ngjashme nga e njëjta kategori.

Duhet: `Product` JSON-LD i plotë, `BreadcrumbList` JSON-LD, meta description
nga përshkrimi i produktit. Karta te grid-i lidhet me këtë faqe — por butoni
"Shto në shportë" nuk duhet ta hapë faqen kur klikohet.

### Faza 2 — kërkimi

Fushë kërkimi në header. Kërkon në emrin dhe përshkrimin e produkteve.
Ndërtoje me një index statik JSON të gjeneruar në build — jo API, jo server.
Duhet të punojë mirë me tastierë dhe me lexues ekrani.

### Faza 3 — versioni anglisht

Të dhënat te `src/content/products/*.md` dhe te `src/config/site.ts` i kanë
tashmë të dyja gjuhët (`name_sq`/`name_en`, `desc_sq`/`desc_en`).

Ndërto rrugën `/en/` me të njëjtat faqe. Duhet `hreflang` në të dyja
drejtimet, ndërrues gjuhe në header, dhe `og:locale` i saktë. Përkthimet e
ndërfaqes nxirri në një file të vetëm, mos i shpërndaj nëpër komponentë.

Arsyeja e biznesit: pacientët e huaj në Tiranë janë target i qartë për
farmacinë.

### Faza 4 — CMS

Sveltia CMS, git-based, që klienti të shtojë produkte dhe kategori vetë pa
paguar abonim. Konfiguroje te `/admin`.

Skema e produktit duhet të përputhet me `src/content.config.ts`. Fushat duhen
mbajtur minimale — klienti nuk është teknik. Slug-u gjenerohet automatikisht
nga emri, me `ë` dhe `ç` të transliteruara (`kujdesi-ndaj-flokeve`, jo
`flokëve`).

Kategoritë duhen kthyer në koleksion të vetin, që klienti të shtojë kategori
të reja. Sot janë të koduara te `site.ts`. Trajto rastin kur fshihet një
kategori që ka produkte brenda — mos e lër site-in të thyhet.

Shto kompresim automatik të fotove në build, përndryshe repo-ja fryhet me foto
5MB nga telefoni.

### Faza 5 — publikimi

Git repo, pastaj Netlify. Kontrollo që `robots.txt` dhe një sitemap ekzistojnë
dhe janë të saktë. Mësomë si ta bëj vetë deploy-in herën tjetër.

## Përpara se të nisësh fazën 4

Këto duhen konfirmuar me klientin dhe nuk i vendos dot ti:

- Telefoni: `site.ts` ka `+355 69 548 9816`, Google Business ka
  `+355 69 389 4346`
- Orari: `site.ts` ka 08:00–21:00 dhe të dielën 16:00–20:00; Google ka
  08:30–21:30 dhe të dielën 10:00–19:00
- Emri: tabela e dyqanit thotë "REI FARMA" me jeshile e rozë; logoja thotë
  "REI PHARMA" me ar. Nëse klienti nuk po bën rebranding, paleta e site-it
  duhet rimenduar.

Kujtomë t'i pyes kur të vijë radha.

## Çfarë mungon dhe pres nga klienti

- `logo-full.svg` dhe `favicon.svg` te `public/` — header-i del i thyer pa to
- Produktet reale: emër, çmim në lekë, përshkrim, kategori
- Fotot e produkteve

Të shtatë produktet aktuale i ka shpikur një AI. Marka shkruan "PLACEHOLDER"
me qëllim, që të mos harrohen. Mos i publiko kurrë ashtu.

## Rregulli i fundit

Mos më thuaj që diçka u mbarua pa e provuar. Nëse nuk je i sigurt, thuaj që
nuk je i sigurt.
