import { site } from '../config/site';
import type { Lang } from './i18n';

/**
 * Tekstet e kushteve dhe të privatësisë, në të dyja gjuhët.
 *
 * Rrinë këtu e jo brenda faqeve, që versioni shqip dhe ai anglisht të mos
 * largohen njëri nga tjetri me kalimin e kohës — kur ndryshon njëri seksion,
 * i dyti është pikërisht poshtë tij.
 */

export type LegalSection = { heading: string; body: string };

export type LegalPage = {
  title: string;
  description: string;
  sections: LegalSection[];
};

const contact = `${site.legalName}, ${site.address.street}, ${site.address.city}. ${site.phone}.`;

export const terms: Record<Lang, LegalPage> = {
  sq: {
    title: 'Kushtet e shitjes — Rei Pharma',
    description: 'Si funksionon porosia, dorëzimi dhe pagesa te Farmaci Rei.',
    sections: [
      {
        heading: 'Çfarë shitet këtu',
        body: 'Në këtë site shiten vetëm produkte pa recetë: kujdes ndaj diellit, vitamina dhe suplemente, kujdes për flokët, kozmetikë dhe pajisje. Barnat me recetë nuk shiten online. Për ato, paraqitu në farmaci me recetën e mjekut.',
      },
      {
        heading: 'Si bëhet porosia',
        body: 'Zgjedh produktet, hap shportën dhe dërgon porosinë me WhatsApp. Porosia konsiderohet e pranuar vetëm pasi ta konfirmojmë me përgjigje. Konfirmojmë disponueshmërinë dhe çmimin përfundimtar para se ta përgatisim.',
      },
      {
        heading: 'Çmimet',
        body: "Çmimet janë në lekë dhe përfshijnë TVSH. Bëjmë çmos t'i mbajmë të përditësuara, por nëse një çmim është i gabuar, të njoftojmë para se ta përgatisim porosinë dhe ti vendos nëse vazhdon.",
      },
      {
        heading: 'Pagesa dhe dorëzimi',
        body: 'Pagesa bëhet cash në momentin e dorëzimit. Dorëzojmë brenda Tiranës. Nëse preferon, mund ta marrësh porosinë vetë në farmaci — na e thuaj në mesazh.',
      },
      {
        heading: 'Anulimi dhe kthimi',
        body: 'Mund ta anulosh porosinë pa asnjë kosto derisa të nisemi për dorëzim. Produktet mund të kthehen brenda 14 ditësh nëse janë të paçelura dhe në gjendjen origjinale. Për arsye higjiene dhe sigurie, produktet e çelura nuk kthehen. Nëse merr një produkt të dëmtuar ose të gabuar, na njofto menjëherë dhe e zëvendësojmë.',
      },
      {
        heading: 'Këshilla shëndetësore',
        body: 'Përshkrimet e produkteve nuk zëvendësojnë këshillën e mjekut ose të farmacistit. Nëse merr barna të tjera, je shtatzënë, ose ke ndonjë gjendje shëndetësore, pyet farmacistin para se ta përdorësh.',
      },
      { heading: 'Kontakt', body: contact },
    ],
  },
  en: {
    title: 'Terms of sale — Rei Pharma',
    description: 'How ordering, delivery and payment work at Farmaci Rei.',
    sections: [
      {
        heading: 'What is sold here',
        body: 'This site sells non-prescription products only: sun care, vitamins and supplements, hair care, cosmetics and devices. Prescription medicines are not sold online. For those, come to the pharmacy with your doctor’s prescription.',
      },
      {
        heading: 'How to order',
        body: 'Pick your products, open the cart and send the order over WhatsApp. An order is accepted only once we confirm it with a reply. We confirm availability and the final price before preparing it.',
      },
      {
        heading: 'Prices',
        body: 'Prices are in Albanian lek and include VAT. We do our best to keep them current, but if a price is wrong we tell you before preparing the order and you decide whether to continue.',
      },
      {
        heading: 'Payment and delivery',
        body: 'You pay cash on delivery. We deliver within Tirana. If you prefer, you can collect the order at the pharmacy yourself — just say so in your message.',
      },
      {
        heading: 'Cancellation and returns',
        body: 'You may cancel free of charge until we set out for delivery. Products can be returned within 14 days if unopened and in original condition. For hygiene and safety reasons, opened products cannot be returned. If you receive a damaged or wrong product, tell us immediately and we will replace it.',
      },
      {
        heading: 'Health advice',
        body: 'Product descriptions do not replace advice from a doctor or pharmacist. If you take other medicines, are pregnant, or have a health condition, ask the pharmacist before using a product.',
      },
      { heading: 'Contact', body: contact },
    ],
  },
};

export const privacy: Record<Lang, LegalPage> = {
  sq: {
    title: 'Politika e privatësisë — Rei Pharma',
    description: 'Si i trajtojmë të dhënat e klientëve tanë.',
    sections: [
      {
        heading: 'Çfarë mbledhim',
        body: 'Ky site nuk kërkon regjistrim dhe nuk mbledh të dhëna personale automatikisht. Produktet që shton në shportë ruhen vetëm në pajisjen tënde dhe nuk na dërgohen neve.',
      },
      {
        heading: 'Kur dërgon një porosi',
        body: 'Kur klikon "Dërgo porosinë me WhatsApp", hapet aplikacioni WhatsApp me një mesazh të shkruar gati. Mesazhi dërgohet vetëm nëse e dërgon ti. Emri, adresa dhe numri që shkruan në atë mesazh na vijnë përmes WhatsApp dhe përdoren vetëm për të përgatitur dhe dorëzuar porosinë.',
      },
      {
        heading: 'Sa i mbajmë',
        body: 'Të dhënat e porosisë i mbajmë vetëm aq sa duhet për ta përfunduar porosinë dhe për detyrimet ligjore. Nuk i shesim dhe nuk i ndajmë me palë të treta për qëllime marketingu.',
      },
      {
        heading: 'Hartat',
        body: 'Faqja e kontaktit ngarkon një hartë nga Google. Kur e sheh atë faqe, Google mund të mbledhë të dhëna sipas politikave të veta.',
      },
      {
        heading: 'Të drejtat e tua',
        body: `Mund të kërkosh të dish çfarë të dhënash mbajmë për ty, t'i korrigjosh ose t'i fshish. Shkruaj ose telefono në ${site.phone}.`,
      },
    ],
  },
  en: {
    title: 'Privacy policy — Rei Pharma',
    description: 'How we handle our customers’ data.',
    sections: [
      {
        heading: 'What we collect',
        body: 'This site requires no sign-up and collects no personal data automatically. The products you add to the cart are stored only on your own device and are never sent to us.',
      },
      {
        heading: 'When you send an order',
        body: 'When you tap "Send the order on WhatsApp", WhatsApp opens with a message already written. It is sent only if you send it. The name, address and phone number you write in that message reach us through WhatsApp and are used only to prepare and deliver the order.',
      },
      {
        heading: 'How long we keep it',
        body: 'We keep order data only as long as needed to complete the order and to meet legal obligations. We do not sell it and do not share it with third parties for marketing.',
      },
      {
        heading: 'Maps',
        body: 'The contact page loads a map from Google. When you view that page, Google may collect data according to its own policies.',
      },
      {
        heading: 'Your rights',
        body: `You can ask what data we hold about you, correct it, or have it deleted. Write or call ${site.phone}.`,
      },
    ],
  },
};
