# El Rodeo Grill: landing (demo)

Landing de El Rodeo Grill, restaurante y asadero en Riobamba. Astro 7 + Tailwind 4, sitio estático.

**Demo para el cliente:** https://damianypg.github.io/el-rodeo-grill-demo/

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera `dist/` |
| `npm run preview` | Sirve `dist/` en local (bajo `/el-rodeo-grill-demo/`) |
| `npm test` | Pruebas Playwright a 375, 768 y 1440 px (requiere `npm run build` antes) |
| `npm run check` | Verificación de tipos con `astro check` |

Datos del negocio en `src/data/*.json`. Sistema de diseño en `DESIGN.md`.

## Despliegue

Cada push a `main` publica `dist/` en GitHub Pages mediante `.github/workflows/deploy.yml` (`withastro/action` + `actions/deploy-pages`, Node 22).

## Al lanzar con el dominio definitivo (pendiente)

1. **Quitar** `<meta name="robots" content="noindex, nofollow">` de `src/layouts/Base.astro`: solo existe para que Google no indexe la demo.
2. En `astro.config.mjs`, poner el dominio en `site` (o en la variable `SITE_URL`) y cambiar `base` a `'/'`.
3. En `playwright.config.ts`, cambiar `base` a `'/'`.
4. En el hosting definitivo, configurar las cabeceras CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` y `frame-ancestors`, que GitHub Pages no permite.
5. Confirmar con el negocio los precios, el horario del local nuevo y las promos vigentes.
