/**
 * Përkthimet e ndërfaqes dhe adresat, të gjitha në një vend.
 *
 * Mos shkruaj tekst ndërfaqeje drejt e në komponentë. Nëse një fjalë duhet në
 * dy gjuhë, vendi i saj është këtu. Përmbajtja (produkte, kategori, shkrime)
 * vjen nga koleksionet, jo nga ky file.
 */

export type Lang = 'sq' | 'en';

export const LANGS: Lang[] = ['sq', 'en'];
export const DEFAULT_LANG: Lang = 'sq';

/** Kodi për `lang=` dhe `og:locale`. */
export const htmlLang: Record<Lang, string> = { sq: 'sq', en: 'en' };
export const ogLocale: Record<Lang, string> = { sq: 'sq_AL', en: 'en_GB' };

/** Emri i gjuhës në gjuhën e vet — kështu e shkruajnë ndërruesit e mirë. */
export const langName: Record<Lang, string> = { sq: 'Shqip', en: 'English' };

// ---------------------------------------------------------------------------
// Adresat
// ---------------------------------------------------------------------------

type RouteKey =
  | 'home'
  | 'products'
  | 'category'
  | 'product'
  | 'blog'
  | 'post'
  | 'search'
  | 'contact'
  | 'about'
  | 'terms'
  | 'privacy';

const routes: Record<Lang, Record<RouteKey, string>> = {
  sq: {
    home: '/',
    products: '/produktet',
    category: '/kategoria/:slug',
    product: '/produkt/:slug',
    blog: '/blog',
    post: '/blog/:slug',
    search: '/kerko',
    contact: '/kontakt',
    about: '/rreth-nesh',
    terms: '/kushtet',
    privacy: '/privatesia',
  },
  en: {
    home: '/en/',
    products: '/en/products',
    category: '/en/category/:slug',
    product: '/en/product/:slug',
    blog: '/en/blog',
    post: '/en/blog/:slug',
    search: '/en/search',
    contact: '/en/contact',
    about: '/en/about',
    terms: '/en/terms',
    privacy: '/en/privacy',
  },
};

/**
 * `path('en', 'product', 'omega-3')` → `/en/product/omega-3`
 * `path('en', 'product', '')`        → `/en/product/`  (bazë për skriptet)
 *
 * Kujdes: kontrolli është `slug !== undefined`, jo `slug`. Me një kontroll
 * të thjeshtë, slug-u bosh binte te dega tjetër dhe `:slug` mbetej në adresë.
 */
export function path(lang: Lang, key: RouteKey, slug?: string): string {
  const template = routes[lang][key];
  return slug === undefined ? template : template.replace(':slug', slug);
}

/** Indeksi i kërkimit është një për gjuhë. */
export function searchIndexUrl(lang: Lang): string {
  return lang === 'en' ? '/en/search.json' : '/kerko.json';
}

// ---------------------------------------------------------------------------
// Fjalët
// ---------------------------------------------------------------------------

const dictionary = {
  // Navigimi dhe header-i
  navHome: { sq: 'Kryefaqja', en: 'Home' },
  navProducts: { sq: 'Produktet', en: 'Products' },
  navBlog: { sq: 'Këshilla', en: 'Advice' },
  navAbout: { sq: 'Rreth nesh', en: 'About us' },
  navContact: { sq: 'Kontakt', en: 'Contact' },
  navMain: { sq: 'Kryesor', en: 'Main' },
  menu: { sq: 'Menuja', en: 'Menu' },
  openMenu: { sq: 'Hap menunë', en: 'Open menu' },
  closeMenu: { sq: 'Mbyll menunë', en: 'Close menu' },
  contactUs: { sq: 'Na kontakto', en: 'Contact us' },
  skipToContent: { sq: 'Kalo te përmbajtja', en: 'Skip to content' },
  homeLink: { sq: 'kryefaqja', en: 'home' },
  changeLanguage: { sq: 'Ndrysho gjuhën', en: 'Change language' },

  // Kërkimi
  searchLabel: { sq: 'Kërko produkte', en: 'Search products' },
  searchPlaceholder: { sq: 'Kërko produkt…', en: 'Search for a product…' },
  searchClear: { sq: 'Pastro kërkimin', en: 'Clear search' },
  searchResults: { sq: 'Rezultatet e kërkimit', en: 'Search results' },
  searchTitle: { sq: 'Kërko', en: 'Search' },
  searchTypeHere: {
    sq: 'Shkruaj çfarë kërkon në fushën lart.',
    en: 'Type what you are looking for in the field above.',
  },
  searchNoneFor: { sq: 'Asnjë produkt për', en: 'No products for' },
  searchTryShorter: {
    sq: 'Provo një fjalë më të shkurtër, ose',
    en: 'Try a shorter word, or',
  },
  searchSeeAll: { sq: 'shiko të gjitha produktet', en: 'see all products' },
  searchFailed: {
    sq: 'Kërkimi nuk u ngarkua. Rifresko faqen.',
    en: 'Search failed to load. Refresh the page.',
  },
  searchNeedsJs: {
    sq: 'Kërkimi ka nevojë për JavaScript. Shiko',
    en: 'Search needs JavaScript. See',
  },
  searchBrowseCategory: {
    sq: 'Shfleto sipas kategorisë',
    en: 'Browse by category',
  },
  resultCountOne: { sq: 'produkt për', en: 'product for' },
  resultCountMany: { sq: 'produkte për', en: 'products for' },

  // Shporta
  cart: { sq: 'Shporta', en: 'Cart' },
  cartEmpty: { sq: 'Shporta është bosh.', en: 'Your cart is empty.' },
  cartEmptyLabel: { sq: 'Shporta, bosh', en: 'Cart, empty' },
  cartClose: { sq: 'Mbyll shportën', en: 'Close cart' },
  cartDescription: {
    sq: 'Produktet që ke zgjedhur. Porosia dërgohet me WhatsApp.',
    en: 'The products you picked. The order is sent over WhatsApp.',
  },
  cartTotal: { sq: 'Totali', en: 'Total' },
  cartPayNote: {
    sq: 'Pagesa bëhet cash kur ta marrësh porosinë.',
    en: 'You pay cash when the order reaches you.',
  },
  cartCheckout: {
    sq: 'Dërgo porosinë me WhatsApp',
    en: 'Send the order on WhatsApp',
  },
  cartCheckoutNote: {
    sq: 'Hapet WhatsApp me porosinë e shkruar. E dërgon ti.',
    en: 'WhatsApp opens with the message ready. You send it.',
  },
  each: { sq: '/ copë', en: '/ each' },
  remove: { sq: 'Hiq', en: 'Remove' },
  removeOne: { sq: 'Hiq një', en: 'Remove one' },
  addOne: { sq: 'Shto një', en: 'Add one' },
  seeProducts: { sq: 'Shiko produktet', en: 'See products' },

  // Produktet
  addToCart: { sq: 'Shto në shportë', en: 'Add to cart' },
  added: { sq: 'Shtuar në shportë', en: 'Added to cart' },
  view: { sq: 'Shiko', en: 'View' },
  outOfStock: { sq: 'Jashtë stoku', en: 'Out of stock' },
  inStock: { sq: 'Në gjendje', en: 'In stock' },
  onSale: { sq: 'Ofertë', en: 'Sale' },
  allProducts: { sq: 'Të gjitha', en: 'All' },
  productsTitle: { sq: 'Produktet', en: 'Products' },
  productsAvailable: {
    sq: 'produkte të disponueshme',
    en: 'products available',
  },
  filterByCategory: {
    sq: 'Filtro sipas kategorisë',
    en: 'Filter by category',
  },
  brand: { sq: 'Marka', en: 'Brand' },
  category: { sq: 'Kategoria', en: 'Category' },
  payment: { sq: 'Pagesa', en: 'Payment' },
  cashOnDelivery: { sq: 'Cash në dorëzim', en: 'Cash on delivery' },
  delivery: { sq: 'Dorëzimi', en: 'Delivery' },
  deliveryNote: {
    sq: 'Brenda ditës në Tiranë, ose merre në farmaci',
    en: 'Same day in Tirana, or pick it up at the pharmacy',
  },
  askAboutProduct: {
    sq: 'Pyet farmacistin për këtë produkt',
    en: 'Ask the pharmacist about this product',
  },
  productDisclaimer: {
    sq: 'Ky produkt shitet pa recetë. Nëse merr barna të tjera ose je shtatzënë, pyet farmacistin para se ta përdorësh.',
    en: 'This product is sold without prescription. If you take other medicines or are pregnant, ask the pharmacist before using it.',
  },
  related: { sq: 'Të ngjashme', en: 'You may also like' },
  emptyCategory: {
    sq: 'Kjo kategori ende nuk ka produkte.',
    en: 'This category has no products yet.',
  },
  seeAllProducts: {
    sq: 'Shiko të gjitha produktet',
    en: 'See all products',
  },
  photoSoon: { sq: 'Foto së shpejti', en: 'Photo coming soon' },

  // Shtegu
  breadcrumb: { sq: 'Shtegu', en: 'Breadcrumb' },
  home: { sq: 'Kryefaqja', en: 'Home' },

  // Kryefaqja
  heroEyebrow: {
    sq: 'Farmaci në Rrugën Albanopoli',
    en: 'Pharmacy on Rruga Albanopoli',
  },
  heroTitleA: { sq: 'Shëndeti juaj,', en: 'Your health,' },
  heroTitleB: { sq: 'kujdesi ynë', en: 'our care' },
  heroText: {
    sq: 'Zgjidh produktet që të duhen, dërgo porosinë me një prekje, dhe paguaj kur ta marrësh në dorë.',
    en: 'Pick what you need, send the order with one tap, and pay when it reaches your hands.',
  },
  askPharmacist: { sq: 'Pyet farmacistin', en: 'Ask the pharmacist' },
  pickedByPharmacists: {
    sq: 'Zgjedhur nga farmacistët',
    en: 'Picked by our pharmacists',
  },
  featured: { sq: 'Të zgjedhura', en: 'Featured' },
  seeAll: { sq: 'Të gjitha', en: 'See all' },
  whatWeStock: { sq: 'Çfarë gjen te ne', en: 'What we stock' },
  shopByCategory: { sq: 'Bli sipas kategorisë', en: 'Shop by category' },
  categoryIntro: {
    sq: 'Vetëm produkte pa recetë — kozmetikë, suplemente dhe kujdes i përditshëm. Për barnat me recetë, të presim në farmaci.',
    en: 'Only non-prescription products — cosmetics, supplements and everyday care. For prescription medicines, we see you at the pharmacy.',
  },
  productsCount: { sq: 'produkte', en: 'products' },
  findUsHere: { sq: 'Na gjen këtu', en: 'Find us here' },
  orVisit: {
    sq: 'Ose thjesht kalo nga farmacia',
    en: 'Or simply drop by the pharmacy',
  },
  orVisitText: {
    sq: 'Nëse je afër, porosia të pret gati te banaku — nuk ke pse të presësh dorëzimin.',
    en: 'If you are nearby, your order waits ready at the counter — no need to wait for delivery.',
  },
  openInMaps: { sq: 'Hape në hartë', en: 'Open in maps' },

  // Shiriti i besimit
  trustOrderTitle: { sq: 'Porosit me WhatsApp', en: 'Order on WhatsApp' },
  trustOrderNote: {
    sq: 'Pa regjistrim, pa formularë',
    en: 'No sign-up, no forms',
  },
  trustPayTitle: { sq: 'Paguaj në dorëzim', en: 'Pay on delivery' },
  trustPayNote: {
    sq: 'Cash kur ta marrësh në dorë',
    en: 'Cash when it reaches your hands',
  },
  trustDeliveryTitle: { sq: 'Dorëzim në Tiranë', en: 'Delivery in Tirana' },
  trustDeliveryNote: {
    sq: 'Brenda ditës për porositë e mëngjesit',
    en: 'Same day for morning orders',
  },
  trustAdviceTitle: { sq: 'Këshillë farmacisti', en: 'Pharmacist advice' },
  trustAdviceNote: {
    sq: 'Përgjigjet një njeri, jo një robot',
    en: 'A person answers, not a robot',
  },

  // Blogu
  blogEyebrow: { sq: 'Nga banaku ynë', en: 'From our counter' },
  blogTitle: { sq: 'Këshilla', en: 'Advice' },
  blogIntro: {
    sq: 'Pyetjet që na bëjnë më shpesh, të shpjeguara qetësisht. Pa premtime dhe pa fjalë të mëdha — vetëm çfarë do të të thoshim po të vije te dera.',
    en: 'The questions we are asked most, explained calmly. No promises and no big words — just what we would tell you at the door.',
  },
  blogEmpty: {
    sq: 'Së shpejti do të shtojmë shkrime këtu.',
    en: 'We will add articles here soon.',
  },
  readMore: { sq: 'Lexo më shumë', en: 'Read more' },
  readArticle: { sq: 'Lexo shkrimin', en: 'Read the article' },
  readNext: { sq: 'Lexo edhe', en: 'Read next' },
  haveAQuestion: {
    sq: 'Ke një pyetje konkrete?',
    en: 'Got a specific question?',
  },
  haveAQuestionText: {
    sq: 'Shkruaji farmacistit tonë. Përgjigjemi brenda orarit të punës, dhe nuk të shesim asgjë që nuk të duhet.',
    en: 'Write to our pharmacist. We reply during opening hours, and we will not sell you anything you do not need.',
  },
  writeOnWhatsApp: { sq: 'Shkruaj në WhatsApp', en: 'Message on WhatsApp' },

  // Kontakti
  weAreHere: { sq: 'Jemi këtu', en: 'We are here' },
  contactTitle: { sq: 'Kontakt', en: 'Contact' },
  contactIntro: {
    sq: 'Na shkruaj për një produkt, telefono për një këshillë, ose kalo nga farmacia. Të përgjigjet një farmacist, jo një robot.',
    en: 'Write to us about a product, call for advice, or drop by the pharmacy. A pharmacist answers, not a robot.',
  },
  whatsappNote: {
    sq: 'Për porosi dhe pyetje për produkte. Përgjigjemi brenda orarit.',
    en: 'For orders and product questions. We reply during opening hours.',
  },
  phone: { sq: 'Telefon', en: 'Phone' },
  phoneNote: {
    sq: 'Nëse do të flasësh drejtpërdrejt me farmacistin.',
    en: 'If you would rather speak to the pharmacist directly.',
  },
  atThePharmacy: { sq: 'Në farmaci', en: 'At the pharmacy' },
  atThePharmacyNote: {
    sq: 'Merre porosinë vetë te banaku.',
    en: 'Collect your order at the counter yourself.',
  },
  hours: { sq: 'Orari', en: 'Opening hours' },
  prescriptionTitle: { sq: 'Barnat me recetë', en: 'Prescription medicines' },
  prescriptionText: {
    sq: 'Nuk shiten online. Paraqitu në farmaci me recetën e mjekut dhe të shërbejmë aty për aty.',
    en: 'Not sold online. Come to the pharmacy with your prescription and we will serve you on the spot.',
  },
  mapTitle: {
    sq: 'Vendndodhja e Farmaci Rei në hartë',
    en: 'Farmaci Rei location on the map',
  },
  address: { sq: 'Adresa', en: 'Address' },

  // Rreth nesh
  whoWeAre: { sq: 'Kush jemi', en: 'Who we are' },
  aboutTitle: { sq: 'Rreth nesh', en: 'About us' },
  aboutLead: {
    sq: "Farmaci Rei ndodhet në Rrugën Albanopoli në Tiranë. Produkte për kujdesin e përditshëm, të zgjedhura me kujdes dhe të shpjeguara nga dikush që di t'i shpjegojë.",
    en: 'Farmaci Rei sits on Rruga Albanopoli in Tirana. Everyday care products, chosen carefully and explained by someone who knows how to explain them.',
  },
  aboutP1: {
    sq: "Këtu gjen mbrojtje nga dielli, vitamina dhe suplemente, dhe kujdes për flokët. Jo çdo markë që ekziston — vetëm ato që i njohim dhe do t'i përdornim vetë.",
    en: 'Here you will find sun protection, vitamins and supplements, and hair care. Not every brand that exists — only the ones we know and would use ourselves.',
  },
  aboutP2: {
    sq: "Tani mund t'i porositësh edhe online. Zgjidh çfarë të duhet, dërgo porosinë me WhatsApp, dhe paguaj kur ta marrësh. Nëse je afër, mund ta marrësh vetë në farmaci brenda ditës.",
    en: 'You can now order them online too. Pick what you need, send the order on WhatsApp, and pay when it arrives. If you are nearby, you can collect it at the pharmacy the same day.',
  },
  aboutP3: {
    sq: 'Nuk je i sigurt cili produkt të përshtatet? Shkruaj ose telefono. Do të përgjigjet një farmacist, jo një robot.',
    en: 'Not sure which product suits you? Write or call. A pharmacist will answer, not a robot.',
  },
  howWeWork: { sq: 'Si punojmë', en: 'How we work' },
  valueAdviceTitle: { sq: 'Këshillë, jo shitje', en: 'Advice, not a sale' },
  valueAdviceText: {
    sq: 'Nëse një produkt nuk të duhet, ta themi. Preferojmë të kthehesh sesa të shesim një herë.',
    en: 'If a product is not right for you, we will say so. We would rather you came back than sold you something once.',
  },
  valueOtcTitle: {
    sq: 'Vetëm pa recetë online',
    en: 'Non-prescription only online',
  },
  valueOtcText: {
    sq: 'Kozmetikë, suplemente dhe kujdes i përditshëm. Barnat me recetë kërkojnë farmacistin dhe recetën në dorë.',
    en: 'Cosmetics, supplements and everyday care. Prescription medicines need the pharmacist and the prescription in hand.',
  },
  valuePayTitle: {
    sq: 'Pagesa kur ta marrësh',
    en: 'Pay when it arrives',
  },
  valuePayText: {
    sq: 'Pa kartë, pa regjistrim, pa të dhëna bankare. Paguan cash kur produkti është përpara teje.',
    en: 'No card, no sign-up, no bank details. You pay cash when the product is in front of you.',
  },
  findUsAt: {
    sq: 'Na gjen te Rruga Albanopoli',
    en: 'Find us on Rruga Albanopoli',
  },

  // Footer-i
  footerTagline: {
    sq: 'Farmaci në Rrugën Albanopoli, Tiranë — produkte pa recetë, këshillë farmacisti, pagesë në dorëzim.',
    en: 'Pharmacy on Rruga Albanopoli, Tirana — non-prescription products, pharmacist advice, cash on delivery.',
  },
  categories: { sq: 'Kategoritë', en: 'Categories' },
  pages: { sq: 'Faqet', en: 'Pages' },
  allProductsLink: { sq: 'Të gjitha produktet', en: 'All products' },
  legalNotice: {
    sq: 'Në këtë site shiten vetëm produkte pa recetë. Barnat me recetë nuk shiten online — për to, paraqitu në farmaci me recetën e mjekut. Informacioni këtu nuk zëvendëson këshillën mjekësore.',
    en: 'Only non-prescription products are sold on this site. Prescription medicines are not sold online — for those, come to the pharmacy with your doctor’s prescription. The information here does not replace medical advice.',
  },
  privacy: { sq: 'Privatësia', en: 'Privacy' },
  terms: { sq: 'Kushtet e shitjes', en: 'Terms of sale' },

  // 404
  notFoundTitle: {
    sq: 'Kjo faqe nuk ekziston',
    en: 'This page does not exist',
  },
  notFoundText: {
    sq: 'Ndoshta linku është i vjetër, ose produkti nuk shitet më.',
    en: 'The link may be old, or the product is no longer sold.',
  },
} as const;

export type StringKey = keyof typeof dictionary;

/** `t('sq', 'addToCart')` → `Shto në shportë` */
export function t(lang: Lang, key: StringKey): string {
  return dictionary[key][lang];
}
