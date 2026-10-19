import { defineConfig, devices } from '@playwright/test';

const port = 4322;
// Mismo base que astro.config.mjs: el build se sirve bajo esa ruta, como en GitHub Pages.
const base = '/el-rodeo-grill-demo/';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}${base}`,
    trace: 'on-first-retry',
    locale: 'es-EC',
    timezoneId: 'America/Guayaquil',
  },
  projects: [
    { name: 'movil-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'escritorio-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  // Sirve el build estático en .pages/<base> (enlace a dist); ejecutar `npm run build` antes.
  webServer: {
    command: `mkdir -p .pages && ln -sfn ../dist .pages${base.replace(/\/$/, '')} && python3 -m http.server ${port} --bind 127.0.0.1 --directory .pages`,
    url: `http://127.0.0.1:${port}${base}`,
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',
  },
});
