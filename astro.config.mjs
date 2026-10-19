// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Demo en GitHub Pages (https://damianypg.github.io/el-rodeo-grill-demo/).
// PENDIENTE al lanzar: dominio definitivo en `site` y `base: '/'`. Se usan para canonical, Open Graph y JSON-LD.
const site = process.env.SITE_URL ?? 'https://damianypg.github.io';

export default defineConfig({
  site,
  base: '/el-rodeo-grill-demo/',
  build: { inlineStylesheets: 'always' },
  // Fuentes auto-hospedadas (archivos de @fontsource, subconjunto latin: incluye tildes, ñ, ¿ y ¡).
  // Astro genera @font-face, precarga y respaldos con métricas ajustadas para evitar saltos de layout.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Anton',
      cssVariable: '--font-anton',
      fallbacks: ['Impact', 'sans-serif'],
      options: { variants: [{ src: ['@fontsource/anton/files/anton-latin-400-normal.woff2'], weight: 400, style: 'normal' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Yellowtail',
      cssVariable: '--font-yellowtail',
      fallbacks: ['cursive'],
      options: { variants: [{ src: ['@fontsource/yellowtail/files/yellowtail-latin-400-normal.woff2'], weight: 400, style: 'normal' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Figtree',
      cssVariable: '--font-figtree',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { variants: [{ src: ['@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'], weight: '300 900', style: 'normal' }] },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
