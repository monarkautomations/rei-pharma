import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://reipharma.al',
  integrations: [
    react(),
    sitemap({
      // PROVUAR: veçoria `i18n` e @astrojs/sitemap çiftëzon sq/en vetëm kur
      // rruga ka fjalë të njëjtë në të dyja gjuhët (p.sh. /blog). Për ne
      // dështon në heshtje kudo tjetër — /produktet vs /products, dhe sidomos
      // shkrimet e blogut me slug krejt të ndryshëm mes gjuhëve. E hoqëm me
      // qëllim: çdo faqe ka tashmë <link rel="alternate" hreflang> të saktë
      // në <head> (shih Base.astro) — ai është sinjali që lexon Google,
      // sitemap-i këtu vetëm liston adresat.
      //
      // /admin është paneli i CMS-së, /kerko.json dhe /en/search.json janë
      // të dhëna për kërkimin — asnjëra s'është faqe përmbajtjeje për Google.
      filter: (page) => !page.includes('/admin') && !page.endsWith('.json'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
