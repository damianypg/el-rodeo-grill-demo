# El Rodeo Grill · Sistema de diseño v2

Versión 2.1 · 19 oct 2026 · Fuentes: `MEJORAR-LANDING.md` (v2 y ronda 3), `assets/flyers/`, `referencias/flyer-*.jpg`, `BRIEF-landing.md`.
**v2.1:** los afiches oficiales completos son la imagen de cada producto (hero, cortes, menú, promo de fin de semana). Sin recortes con `cover` y sin aros de precio duplicados sobre afiches.
Sustituye a la v1 (Young Serif + crema + croquis en el hero), que se descartó por plana y por no representar la marca.
`src/styles/global.css` implementa este documento: se cambian juntos.

---

## 1. La marca en una frase
Asadero de Riobamba con espíritu de rodeo: **madera oscura, brasas al fondo y el corte en la tabla negra**. "El mismo sabor de siempre", ahora en casa nueva.

### Lo que copiamos de los flyers oficiales
| Flyer | Traducción a la web |
|---|---|
| Tablones de madera oscura y carbón | Fondo de todas las secciones: madera en CSS (tablones + grano SVG), nunca un color plano |
| Línea de fuego en el horizonte de cada foto | Banda de brasas (gradientes) en el hero y entre secciones, con partículas de brasa que suben |
| Nombre del corte en sans condensada blanca y pesada | Anton en mayúsculas para títulos y nombres de corte |
| Adjetivo en script dorado ("El corte favorito", "Corte fino") | Yellowtail en oro sobre el título, inclinada y montada sobre él |
| Precio dentro de un aro blanco, con centavos en superíndice (`$12⁰⁰`) | Componente `Precio` en aro, en todas las tarjetas |
| 2x1 gigante sobre madera roja (miércoles) | Sección "Promo de hoy" sobre madera roja con numerales 2x1 enormes |
| Sello marrón "Restaurante & Asadero" | Logo dentro de un sello circular con ribete; sellos tipo rancho para avisos |

### Voz
Cercana, de parrilla, frases cortas. Se reutilizan textos reales de los flyers ("El corte favorito", "Sabor especial", "Corte fino", "El mejor", "Jugosidad y sabor", "Exquisito"). Tuteo y español de Ecuador. Nunca inventamos precios, horarios ni reseñas: lo que falta va como `[por confirmar]`.

---

## 2. Color

### Primitivos
| Token | Hex | Uso |
|---|---|---|
| `carbon-950` | `#0e0907` | Sombras profundas, viñeta, fondo del lightbox |
| `madera-900` | `#1b0e09` | Base de madera (tablón oscuro) |
| `madera-800` | `#24130c` | Tablón claro y superficies de tarjeta |
| `madera-700` | `#33190f` | Juntas de tablón y bordes sutiles |
| `rojo-900` | `#5c120b` | Madera roja de la sección 2x1 |
| `rojo-800` | `#7a1a10` | Tablón claro de la madera roja |
| `rojo-500` | `#d63a1f` | Rojo del aro del logo: llamas, cintas y sellos. **No se usa como texto pequeño** |
| `brasa-500` | `#f08a24` | CTA principal, brasas y acentos |
| `brasa-300` | `#ffb15c` | Hover del CTA y núcleo de la brasa |
| `oro-300` | `#f2c86b` | Script dorado y detalles finos |
| `oro-500` | `#d4a24c` | Ribetes de sellos y líneas doradas |
| `hueso-50` | `#f7f1e8` | Texto de párrafo sobre madera |
| `blanco` | `#ffffff` | Títulos Anton, precios y aros |
| `humo-300` | `#c9b8a6` | Texto secundario |
| `cafe-600` | `#8a6650` | Borde de controles (≥3:1 sobre madera) |
| `wa-500` | `#25d366` | Barra y botón fijo de WhatsApp |

### Contraste verificado (WCAG 2.2)
| Texto / fondo | Ratio | Uso permitido |
|---|---|---|
| blanco / madera-900 | 18,86 | Todo |
| hueso / madera-800 | 15,94 | Párrafos |
| humo / madera-800 | 9,28 | Texto secundario |
| oro-300 / madera-900 | 11,90 | Script y etiquetas |
| oro-300 / rojo-900 | 8,57 | Script sobre madera roja |
| blanco / rojo-900 | 13,58 | Títulos y precios en 2x1 |
| brasa / madera-800 | 7,13 | Enlaces y acentos |
| brasa / rojo-900 | 5,41 | Acentos sobre madera roja |
| carbon / brasa-500 | 7,89 | Texto del botón principal |
| carbon / wa-500 | 9,98 | Barra de WhatsApp |
| cafe-600 / madera-900 | 3,68 | Bordes de controles |
| rojo-500 / madera | 4,03 | **Solo decoración** |

**Texto sobre foto:** siempre con capa de carbón (degradado de 0,55 a 0,9 de opacidad) bajo el texto. Nunca texto directo sobre fuego.

---

## 3. Tipografía
| Rol | Familia | Detalle |
|---|---|---|
| Display | **Anton** 400 (ya es pesada) | MAYÚSCULAS, `letter-spacing .01em`, interlineado 0.92–1. Títulos, nombres de corte, precios, 2x1 |
| Script | **Yellowtail** 400 | En `oro-300`, rotada −4°, montada sobre el título (margen inferior negativo). Máximo 4 palabras y nunca en párrafos |
| Texto | **Figtree** variable 400–700 | Párrafos, botones y formularios |

Las tres son auto-hospedadas: los archivos `woff2` (subconjunto latin) vienen de `@fontsource` y se declaran con la API `fonts` de Astro (`astro.config.mjs`). Astro precarga las tres, usa `font-display: swap` y genera respaldos con métricas ajustadas, sin salto de layout (CLS 0). Respaldos: Anton → Impact y sans-serif; Yellowtail → cursive; Figtree → system-ui y sans-serif.

### Escala
| Token | Valor | Uso |
|---|---|---|
| `mega` | `clamp(5.5rem, 3rem + 12vw, 12rem)` | El "2x1" de la promo de hoy |
| `display` | `clamp(3rem, 1.6rem + 6vw, 6.5rem)` | H1 del hero |
| `h2` | `clamp(2.5rem, 1.6rem + 3.4vw, 4.25rem)` | Títulos de sección |
| `h3` | `clamp(1.75rem, 1.4rem + 1.2vw, 2.375rem)` | Nombre de corte |
| `script-xl` | `clamp(2.25rem, 1.6rem + 2.4vw, 3.75rem)` | Script sobre el H1 y los H2 |
| `script` | `clamp(1.625rem, 1.3rem + 1vw, 2.25rem)` | Script sobre el nombre del corte |
| `lead` | `clamp(1.0625rem, 1rem + .35vw, 1.25rem)` / 1.55 | Bajadas |
| `body` | 16 px (17 desde 768 px) / 1.6 | Párrafos |
| `small` | 14 px | Notas (nunca menos) |

### Precio en aro (firma de la marca)
- Aro blanco de 3 px (2 px en la variante pequeña), círculo perfecto, sin relleno o con relleno `carbon/60` sobre foto.
- `$` pequeño arriba a la izquierda, entero en Anton grande y centavos en superíndice subrayados, como en el flyer (`$12⁰⁰`).
- Texto alternativo para lectores de pantalla con el precio completo ("12 dólares").
- Tamaños: `lg` 132 px, `md` 96 px y `sm` 72 px.

---

## 4. Materiales y texturas (todo en CSS/SVG, sin imágenes de fondo pesadas)
| Material | Receta |
|---|---|
| **Madera** | `repeating-linear-gradient(180deg, …)` con tablones de 64–96 px y juntas de 2 px en `madera-700`. Encima, grano SVG `feTurbulence` (`baseFrequency .9 .04`, opacidad .18) y viñeta radial de carbón |
| **Madera roja** | La misma receta con `rojo-900`/`rojo-800` y viñeta más fuerte |
| **Brasas** | Banda horizontal de 120–220 px con degradados `rojo-500 → brasa-500 → transparente` y `filter: blur`. Marca el horizonte como en los flyers |
| **Partículas** | 14 a 18 puntos `brasa-300` que suben con `transform`/`opacity` (8–14 s, desfasadas). Solo en el hero y en la promo de hoy. Desactivadas con `prefers-reduced-motion` |
| **Afiches y fotos** | Componente `Foto`: contenedor con la proporción exacta del archivo (`aspect-ratio`), `max-width` = ancho natural, nunca `object-fit: cover` ni máscaras sobre el producto. Variantes 400/560/natural en WebP calidad 72. En desarrollo avisa en consola si se escala de más |
| **Producto sin afiche** | Tarjeta tipográfica con la estética del flyer: madera, banda de brasas, nombre en Anton gigante y precio en aro (caso T-Bone). Nunca un hueco gris ni "Foto en camino" |

---

## 5. Espaciado, rejilla y forma
- Base de 4 px. Contenedor de 1240 px, con margen lateral de 16 px en móvil y 24 px desde 768 px.
- Sección: `padding-block: clamp(64px, 4rem + 4vw, 120px)`.
- Puntos de corte: `md 768`, `lg 1024` y `xl 1280`. Las pruebas se hacen en 375, 768 y 1440 px.
- Radios:
  - Tarjetas de corte: 20 px (la tabla negra del flyer tiene esquinas suaves).
  - Botones: 999 px.
  - Aro y sellos: 50 %.
  - Lightbox: 0 en móvil y 16 px desde 768 px.
- Sombras: solo para despegar del fondo de madera. `--shadow-tabla: 0 18px 40px -12px rgb(0 0 0 / .7)` en tarjetas y `--shadow-float` en la barra de WhatsApp.

---

## 6. Componentes

Todo control interactivo mide al menos **44×44 px** y tiene foco visible: `outline 3px` en `oro-300` con 3 px de separación (pasa 3:1 sobre madera, sobre rojo y sobre foto con capa).

| Componente | Especificación |
|---|---|
| **Botón primario** | Fondo `brasa-500`, texto `carbon` en Figtree 800, alto mínimo de 52 px y radio pill. Hover: `brasa-300` y −1 px. Presionado: `brasa-600` |
| **Botón secundario** | Borde de 2 px en `hueso` al 70 %, texto blanco. Hover: borde `oro-300` |
| **Aviso de mudanza** | Cinta `rojo-900` con ribete `oro-500`: "Nos cambiamos de casa: calle Pichincha, entre Guayaquil y 10 de Agosto" y el enlace "Ver cómo llegar" |
| **Barra superior** | Fija, carbón al 85 % con desenfoque. Logo en sello de 48 px, navegación desde 1024 px y botón "Pedir". Su contador muestra cuántos productos lleva el pedido |
| **Hero** | 92vh en escritorio. Madera, brasas y chispas. **Afiche del Rib Eye como póster** de 540 px como máximo, inclinado −3,5°, con ribete blanco, sombra y resplandor naranja; aterriza, flota y tiene parallax. En móvil va primero, sobre el titular. Script "El mismo sabor de siempre" y H1 "Carnes a la brasa en Riobamba". CTA "Pedir por WhatsApp" y "Ver los cortes". Tres pruebas: 4,8 en Google con 1084 reseñas, nuevo local en la calle Pichincha y cortes desde $12. **Nada de cajas ni texto encima del póster** |
| **Promo de hoy** | Madera roja. De lunes a jueves, **sello 2x1 sólido**: disco rojo con ribete dorado, numerales blancos con relieve, etiqueta "HOY" y un giro lento. Al lado, el plato, el precio en aro con conteo y los CTA. De viernes a domingo, en lugar del sello va el **afiche** del menú (vie–sáb) o del yahuarlocro (dom), sin aro de precio porque el afiche ya lo muestra. Debajo, la fila semanal con el día marcado |
| **Tarjeta de corte** | Tabla negra con radio 20 y sombra-tabla. **Afiche completo arriba**, ya con nombre, adjetivo y precios, así que no se repiten encima ni con aro. Debajo: nombre en Anton (H3), selector de tamaño (píldoras de radio) o precio único, y botones "Pedir este" y "Agregar al pedido". En móvil es un carrusel horizontal con `scroll-snap` y la siguiente tarjeta asomando (84 %); desde 768 px es una rejilla |
| **Constructor de pedido** | Lista con cantidades (−/+), total referencial, modalidad (comer en el local o retirar) y nota opcional con `label`. Botón "Enviar pedido por WhatsApp". Estado vacío con una invitación a elegir cortes. Sin backend y sin guardar datos personales |
| **Menú del día** | Dos tarjetas con su **afiche completo** (menú del día y yahuarlocro) y, debajo, cada opción con su precio en texto y su botón "Agregar" |
| **Galería y lightbox** | Masonry (`columns`) donde cada foto conserva su proporción y no supera su ancho natural. Botones con `aria-label` que abren un `<dialog>` modal con flechas, Esc y navegación con teclado. Al cerrar, el foco vuelve a la miniatura. Solo archivos locales |
| **Reseñas** | 4,8 enorme en Anton, estrellas en `brasa` y "1084 reseñas en Google". Solo se publican citas aprobadas por el dueño (`src/data/resenas.json`); si no hay, se enlaza a Google |
| **Visítanos** | Dirección, horario (marcado como "por confirmar en el local nuevo"), mapa con carga diferida y el croquis de la esquina como detalle pequeño junto a la dirección |
| **Barra de WhatsApp en móvil** | Fija abajo y de ancho completo, verde. Sin pedido dice "Pedir por WhatsApp" y abre WhatsApp en otra pestaña; con pedido dice "Ver mi pedido (n)" y lleva al panel `#pedido` para revisarlo antes de enviar. Desde 1024 px se convierte en un botón flotante |

---

## 7. Movimiento
Todo vive en `src/scripts/animaciones.ts` y en CSS. Solo se anima `transform` y `opacity`.
- **Hero:** el texto entra escalonado por líneas, solo con `transform` para no retrasar el LCP. El póster aterriza, flota (6 s) y su resplandor late; tiene parallax suave al hacer scroll.
- **Scroll:** revelado escalonado (`--i` × 110 ms) de títulos y tarjetas, una sola vez.
- **Precios en aro:** conteo de 0 al valor real al aparecer. El texto para lectores de pantalla queda fijo.
- **Tarjetas:** inclinación 3D según el puntero (solo con ratón), elevación y destello de fuego en el borde al pasar el puntero; destello al agregar al pedido.
- **Sello 2x1:** giro y pulso lentos.
- **Marquee** de cortes entre secciones (decorativo, `aria-hidden`), que se pausa al pasar el puntero.
- **Barra de WhatsApp:** pulso discreto cada 3,5 s.
- **Chispas:** se pausan cuando su sección no está en pantalla.
- Con `prefers-reduced-motion` no hay revelados, conteo, inclinación, parallax, marquee, chispas ni pulsos: el contenido aparece directamente.

---

## 8. Ritmo de secciones
| # | Sección | Material |
|---|---|---|
| 0 | Aviso de mudanza | Cinta roja |
| 1 | Barra superior | Carbón con desenfoque |
| 2 | Hero | Madera, brasas y póster |
| 2b | Marquee de cortes | Carbón con ribete dorado |
| 3 | Promo de hoy | Madera roja y 2x1 |
| 4 | Cortes estrella | Madera |
| 4b | Marquee de cortes | Carbón con ribete dorado |
| 5 | Menú del día y Yahuarlocro | Madera clara con banda de brasas arriba |
| 6 | Tu pedido (constructor) | Madera |
| 7 | Galería | Carbón |
| 8 | Reseñas | Madera roja suave |
| 9 | Visítanos | Madera |
| 10 | Pie | Carbón |

---

## 9. Implementación
- `src/styles/global.css`: tokens (`@theme`), materiales (`.madera`, `.madera-roja`, `.carbon`, `.brasas`, `.chispa`) y componentes base (`.btn`, `.script`, `.aro`, `.relieve`, `.revelar`).
- Datos en `src/data/`:
  - `site.json` (negocio, horario y priceRange).
  - `cortes.json`, `promos.json`, `menu.json`.
  - La galería se arma en `Galeria.astro` con imágenes locales.
  - `resenas.json`.
- Enlaces de WhatsApp en `src/lib/wa.ts`, y precios (en centavos) en `src/lib/precio.ts`.
- Constructor de pedido en `src/scripts/pedido.ts`. Guarda solo cantidades en `sessionStorage`, con un máximo de 20 por producto.

## 10. Decisiones
| Decisión | Tipo | Motivo |
|---|---|---|
| Anton + Yellowtail + Figtree | Elección | Anton reproduce la sans pesada de los flyers; Yellowtail, el script dorado; Figtree mantiene los párrafos legibles |
| Afiches completos en lugar de recortes de plato | Decisión del cliente (ronda 4) | Los recortes con `cover` cortaban y pixelaban los platos. El afiche es el material oficial y ya trae nombre y precios |
| Nunca por encima del ancho natural (547–685 px) | Restricción | Son exportaciones de Instagram |
| Foco no tapado: `scroll-padding-bottom` de 76 px en móvil y contorno en el contenedor del mapa | Accesibilidad (WCAG 2.4.11 y 2.4.7) | La barra fija tapaba el foco, y el iframe no recibe `:focus` en el documento padre |
| Reservas por el WhatsApp principal (0988552968) | Supuesto | El 0979211114 está sin confirmar |
| Horario publicado con aviso "por confirmar en el local nuevo" | Supuesto | Viene de una publicación anterior a la mudanza |
| Precios marcados como referenciales en el constructor | Precaución | Vienen de flyers de abril y mayo; se confirman por WhatsApp |
| Sin citas de reseñas | Regla | Solo se publican citas aprobadas por el dueño |
