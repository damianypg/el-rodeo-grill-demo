import { test, expect, type Page } from '@playwright/test';

const WA = 'https://wa.me/593988552968';

// Sin red externa: wa.me y Google Maps responden con páginas mínimas.
async function aislarRed(page: Page) {
  await page.context().route('https://wa.me/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }),
  );
  await page.context().route('https://www.google.com/maps**', (route) => route.fulfill({ status: 200, body: '' }));
}

function textoWa(href: string) {
  return new URL(href).searchParams.get('text') ?? '';
}

test.beforeEach(async ({ page }) => {
  await aislarRed(page);
  await page.goto('./');
});

test.describe('WhatsApp', () => {
  test('todos los enlaces wa.me apuntan al número y llevan texto prellenado', async ({ page }) => {
    const enlaces = page.locator('a[href^="https://wa.me/"]');
    const total = await enlaces.count();
    expect(total).toBeGreaterThanOrEqual(12);
    for (let i = 0; i < total; i++) {
      const href = (await enlaces.nth(i).getAttribute('href'))!;
      const url = new URL(href);
      expect(`${url.origin}${url.pathname}`).toBe(WA);
      expect(textoWa(href), href).toMatch(/^Hola, El Rodeo Grill\. .{10,}/);
      expect(textoWa(href)).not.toMatch(/undefined|null|NaN/);
      await expect(enlaces.nth(i)).toHaveAttribute('target', '_blank');
      await expect(enlaces.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });

  test('cada enlace visible abre wa.me con su texto prellenado', async ({ page }) => {
    const visibles = page.locator('a[href^="https://wa.me/"]:visible');
    const hrefs = new Set<string>();
    for (let i = 0; i < (await visibles.count()); i++) {
      const enlace = visibles.nth(i);
      const href = (await enlace.getAttribute('href'))!;
      if (hrefs.has(href)) continue;
      hrefs.add(href);
      await enlace.scrollIntoViewIfNeeded();
      const [popup] = await Promise.all([page.waitForEvent('popup'), enlace.click()]);
      await popup.waitForLoadState();
      expect(textoWa(popup.url())).toBe(textoWa(href));
      await popup.close();
    }
    expect(hrefs.size).toBeGreaterThanOrEqual(8);
  });

  test('la barra de WhatsApp está visible arriba, en medio y al final', async ({ page }) => {
    const barra = page.locator('[data-barra-wa]');
    for (const destino of ['#inicio', '#cortes', '#pedido', '#galeria', '#visitanos']) {
      await page.locator(destino).scrollIntoViewIfNeeded();
      await expect(barra).toBeInViewport();
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(barra).toBeInViewport();
    await expect(barra).toHaveAccessibleName('Pedir por WhatsApp');
  });
});

test.describe('cortes estrella', () => {
  test('cambiar el tamaño actualiza el texto de "Pedir este"', async ({ page }) => {
    const card = page.locator('[data-corte="rib-eye"]');
    await card.scrollIntoViewIfNeeded();
    await card.getByText('Mediano', { exact: false }).click();
    await expect(card.getByRole('radio', { name: /Mediano/ })).toBeChecked();
    const pedir = card.getByRole('link', { name: 'Pedir este' });
    await expect.poll(async () => textoWa((await pedir.getAttribute('href'))!)).toBe('Hola, El Rodeo Grill. Quiero un Rib Eye mediano.');
  });

  test('cada corte con afiche lo muestra completo; el T-Bone usa tarjeta tipográfica', async ({ page }) => {
    for (const id of ['rib-eye', 'tomahawk', 'picana', 'porterhouse', 'cowboy-steak']) {
      await expect(page.locator(`[data-corte="${id}"] img`)).toHaveAttribute('alt', /^Afiche de/);
    }
    const tbone = page.locator('[data-corte="t-bone"]');
    await expect(tbone.locator('img')).toHaveCount(0);
    await expect(tbone).toContainText('$12,00');
    await expect(tbone).not.toContainText('Foto en camino');
  });

  test('ninguna foto supera su ancho natural ni se recorta con cover', async ({ page }) => {
    const fotos = page.locator('img.foto');
    expect(await fotos.count()).toBeGreaterThanOrEqual(8);
    for (let i = 0; i < (await fotos.count()); i++) {
      const foto = fotos.nth(i);
      if (!(await foto.isVisible())) continue;
      const { ancho, natural, ajuste } = await foto.evaluate((img: HTMLImageElement) => ({
        ancho: img.getBoundingClientRect().width,
        natural: Number(img.dataset.anchoNatural),
        ajuste: getComputedStyle(img).objectFit,
      }));
      expect(ancho, await foto.getAttribute('alt') ?? '').toBeLessThanOrEqual(natural + 1);
      expect(ajuste).not.toBe('cover');
    }
  });
});

test.describe('constructor de pedido', () => {
  test('arma el mensaje con cantidades, total, modalidad y nota', async ({ page }) => {
    const panel = page.locator('[data-pedido]');
    await expect(panel.getByText('Todavía no agregas nada.')).toBeVisible();

    const ribeye = page.locator('[data-corte="rib-eye"]');
    await ribeye.getByText('Mediano', { exact: false }).click();
    await ribeye.getByRole('button', { name: 'Agregar al pedido' }).click();
    await ribeye.getByRole('button', { name: /Agregar al pedido|Agregado/ }).click();
    await page.getByRole('button', { name: 'Agregar yahuarlocro con almuerzo al pedido' }).click();

    await expect(panel.locator('[data-pedido-cuenta]')).toHaveText('3 productos');
    await expect(panel.locator('[data-pedido-total]')).toHaveText('$36,00');
    await expect(page.locator('[data-contador]').first()).toHaveText('3');
    await expect(page.locator('[data-barra-wa]')).toHaveText(/Ver mi pedido \(3\)/);

    await panel.getByText('Retirar en el local').click();
    await panel.getByLabel(/Nota para la cocina/).fill('Término medio');

    const enviar = panel.getByRole('link', { name: 'Enviar pedido por WhatsApp' });
    await expect.poll(async () => textoWa((await enviar.getAttribute('href'))!)).toBe(
      [
        'Hola, El Rodeo Grill. Quiero hacer este pedido:',
        '- 2 x Rib Eye mediano',
        '- 1 x Yahuarlocro con almuerzo',
        'Total referencial: $36,00',
        'Para: retirar en el local',
        'Nota: Término medio',
      ].join('\n'),
    );
  });

  test('los botones − y + cambian cantidades y al vaciar vuelve el estado vacío', async ({ page }) => {
    const panel = page.locator('[data-pedido]');
    await page.getByRole('button', { name: 'Agregar menú del día al pedido' }).click();
    await panel.getByRole('button', { name: 'Agregar uno: Menú del día' }).click();
    await expect(panel.locator('[data-pedido-total]')).toHaveText('$7,50');
    await expect(panel.getByRole('button', { name: 'Agregar uno: Menú del día' })).toBeFocused();
    await panel.getByRole('button', { name: 'Quitar uno: Menú del día' }).click();
    await panel.getByRole('button', { name: 'Quitar uno: Menú del día' }).click();
    await expect(panel.getByText('Todavía no agregas nada.')).toBeVisible();
    await expect(page.locator('[data-barra-wa]')).toHaveText(/Pedir por WhatsApp/);
  });

  test('al vaciar el pedido, la barra vuelve a abrir WhatsApp en otra pestaña', async ({ page }) => {
    const barra = page.locator('[data-barra-wa]');
    await page.getByRole('button', { name: 'Agregar yahuarlocro al pedido' }).click();
    await expect(barra).toHaveAttribute('href', '#pedido');
    await expect(barra).not.toHaveAttribute('target', /.*/);
    await page.locator('[data-pedido]').getByRole('button', { name: 'Quitar uno: Yahuarlocro' }).click();
    await expect(barra).toHaveAttribute('target', '_blank');
    await expect(barra).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  });

  test('un doble toque en "Agregar" no deja la etiqueta pegada en "Agregado"', async ({ page }) => {
    await page.clock.install();
    await page.reload();
    const boton = page.locator('[data-corte="porterhouse"]').getByRole('button', { name: /Agregar al pedido|Agregado/ });
    await boton.scrollIntoViewIfNeeded();
    await expect(page.locator('li:has(> [data-corte="porterhouse"])')).toHaveCSS('transform', 'none');
    const antes = await boton.boundingBox();
    await boton.dblclick();
    // El botón no se mueve al cambiar de etiqueta (antes se reacomodaba y el segundo toque caía fuera).
    expect(await boton.boundingBox()).toEqual(antes);
    await expect(boton).toHaveText('Agregado ✓');
    await page.clock.runFor(2000);
    await expect(boton).toHaveText('Agregar al pedido');
    await expect(page.locator('[data-pedido-cuenta]')).toHaveText('2 productos');
  });

  test('el pedido se conserva al recargar la página', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar yahuarlocro al pedido' }).click();
    await expect(page.locator('[data-pedido-cuenta]')).toHaveText('1 producto');
    await page.reload();
    await expect(page.locator('[data-pedido-cuenta]')).toHaveText('1 producto');
    await expect(page.locator('[data-pedido]').getByText('Yahuarlocro', { exact: true })).toBeVisible();
  });

  test('cada producto tiene un tope de 20 unidades', async ({ page }) => {
    const panel = page.locator('[data-pedido]');
    await page.getByRole('button', { name: 'Agregar yahuarlocro al pedido' }).click();
    const mas = panel.getByRole('button', { name: 'Agregar uno: Yahuarlocro' });
    for (let i = 0; i < 25; i++) await mas.click();
    await expect(panel.locator('[data-cantidad]')).toHaveText('20');
  });
});

test.describe('promo del día', () => {
  // Fechas en hora de Ecuador: 19 oct 2026 es lunes.
  const dias = [
    { fecha: '2026-10-25', dia: 0, texto: 'Yahuarlocro de domingo' },
    { fecha: '2026-10-19', dia: 1, texto: 'Asado de lomo 2x1' },
    { fecha: '2026-10-20', dia: 2, texto: 'Asado de pollo 2x1' },
    { fecha: '2026-10-21', dia: 3, texto: 'Asado de chuleta 2x1' },
    { fecha: '2026-10-22', dia: 4, texto: 'Rib eye 2x1' },
    { fecha: '2026-10-23', dia: 5, texto: 'Hoy no hay 2x1' },
    { fecha: '2026-10-24', dia: 6, texto: 'Menú especial de sábado' },
  ];
  for (const d of dias) {
    test(`día ${d.dia} (${d.fecha}) destaca lo que corresponde`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${d.fecha}T12:00:00-05:00`));
      await page.reload();
      const seccion = page.locator('#promo-hoy');
      const destacada = seccion.locator(`.promo-destacada[data-hoy-dia="${d.dia}"]`);
      await expect(destacada).toBeVisible();
      await expect(destacada).toContainText(d.texto, { ignoreCase: true });
      await expect(seccion.locator('.promo-destacada:visible')).toHaveCount(1);
      const marcados = seccion.locator('.semana-dia[data-hoy]');
      const esPromo = d.dia >= 1 && d.dia <= 4;
      await expect(marcados).toHaveCount(esPromo ? 1 : 0);
      // Con 2x1: sello visible con "Hoy". Sin 2x1: afiche del menú o del yahuarlocro en su lugar.
      await expect(seccion.locator('[data-sello]')).toBeVisible({ visible: esPromo });
      if (!esPromo) await expect(seccion.locator('.poster-dia:visible img')).toHaveAttribute('alt', d.dia === 0 ? /yahuarlocro/ : /menú del día/);
    });
  }

  test('a las 23:30 de Ecuador sigue siendo el mismo día aunque en UTC ya sea mañana', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-20T23:30:00-05:00')); // martes en Ecuador, miércoles en UTC
    await page.reload();
    await expect(page.locator('#promo-hoy .promo-destacada[data-hoy-dia="2"]')).toBeVisible();
  });
});

test.describe('movimiento', () => {
  test('el precio en aro termina el conteo en el valor real', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-20T12:00:00-05:00'));
    await page.reload();
    const aro = page.locator('#promo-hoy .promo-destacada[data-hoy-dia="2"] [data-contar]');
    await aro.scrollIntoViewIfNeeded();
    await expect(aro.locator('[data-entero]')).toHaveText('9');
    await expect(aro.locator('[data-texto]')).toHaveText('$9,99');
  });

  test('con movimiento reducido todo el contenido queda visible y quieto', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    const revelar = page.locator('.revelar').first();
    await revelar.scrollIntoViewIfNeeded();
    await expect(revelar).toHaveCSS('opacity', '1');
    await expect(page.locator('.marquee-pista').first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.chispa').first()).toBeHidden();
  });
});

test.describe('foco', () => {
  test('la barra fija de WhatsApp no tapa el elemento con foco en móvil', async ({ page }, info) => {
    test.skip(info.project.name !== 'movil-375', 'La barra de ancho completo solo existe en móvil');
    const destino = page.locator('#inicio').getByRole('link', { name: 'Pedir por WhatsApp' });
    for (let i = 0; i < 40 && !(await destino.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(destino).toBeFocused();
    await expect.poll(async () => {
      const caja = (await destino.boundingBox())!;
      const barra = (await page.locator('[data-barra-wa]').boundingBox())!;
      return caja.y + caja.height <= barra.y;
    }).toBe(true);
  });

  test('el mapa marca su contenedor cuando recibe el foco', async ({ page }) => {
    await page.locator('#visitanos iframe').focus();
    await expect(page.locator('.mapa')).toHaveCSS('outline-style', 'solid');
  });
});

test.describe('galería', () => {
  test('el lightbox abre, navega con flechas, cierra con Esc y devuelve el foco', async ({ page }) => {
    const miniatura = page.getByRole('button', { name: /^Ver foto ampliada: Rib eye/ });
    await miniatura.scrollIntoViewIfNeeded();
    await miniatura.click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await expect(dialogo.locator('[data-lightbox-cuenta]')).toHaveText('Foto 1 de 10');
    const img = dialogo.locator('[data-lightbox-img]');
    await expect(img).toHaveAttribute('alt', /Rib eye/);
    await page.keyboard.press('ArrowRight');
    await expect(dialogo.locator('[data-lightbox-cuenta]')).toHaveText('Foto 2 de 10');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(dialogo.locator('[data-lightbox-cuenta]')).toHaveText('Foto 10 de 10');
    await expect(img).toHaveJSProperty('complete', true);
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    await expect(miniatura).toBeFocused();
  });
});

test.describe('datos y calidad', () => {
  test('la página carga sin errores de consola', async ({ page }) => {
    const errores: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    page.on('pageerror', (e) => errores.push(e.message));
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    expect(errores).toEqual([]);
  });

  test('usa la dirección nueva y nunca la anterior', async ({ page }) => {
    await expect(page.locator('#visitanos')).toContainText('Calle Pichincha, entre Guayaquil y 10 de Agosto');
    expect(await page.content()).not.toMatch(/Le[oó]n Borja|Duchicela|Autachi/i);
  });

  test('no hay scroll horizontal', async ({ page }) => {
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('SEO: meta, Open Graph y JSON-LD Restaurant con horario y priceRange', async ({ page }) => {
    await expect(page).toHaveTitle(/El Rodeo Grill/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Pichincha/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\/.+\/og\.jpg$/);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld['@type']).toBe('Restaurant');
    expect(ld.telephone).toBe('+593988552968');
    expect(ld.priceRange).toBe('$10-15');
    expect(ld.openingHoursSpecification).toHaveLength(2);
    expect(ld.address.streetAddress).toBe('Calle Pichincha, entre Guayaquil y 10 de Agosto');
    expect(ld.aggregateRating).toMatchObject({ ratingValue: '4.8', reviewCount: '1084' });
    expect(ld.hasMenu.hasMenuSection[0].hasMenuItem.length).toBeGreaterThanOrEqual(10);
  });

  test('las imágenes tienen alt y dimensiones; solo el hero carga de inmediato', async ({ page }) => {
    const imgs = page.locator('img:not([data-lightbox-img])');
    for (let i = 0; i < (await imgs.count()); i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute('alt');
      await expect(img).toHaveAttribute('width', /\d+/);
      await expect(img).toHaveAttribute('height', /\d+/);
    }
    await expect(page.locator('#inicio img')).toHaveAttribute('fetchpriority', 'high');
    await expect(page.locator('#cortes img').first()).toHaveAttribute('loading', 'lazy');
  });
});
