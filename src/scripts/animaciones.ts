// Movimiento con propósito (DESIGN.md §7). Todo se desactiva con prefers-reduced-motion.
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const punteroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;

// 1. Revelado escalonado al entrar en pantalla (el retraso viene de --i en cada elemento).
const revelables = document.querySelectorAll<HTMLElement>('.revelar');
if (quieto || !('IntersectionObserver' in window)) {
  revelables.forEach((el) => el.classList.add('visible'));
} else {
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  revelables.forEach((el) => io.observe(el));
}

// 2. Conteo de precios en aro: de 0 al valor real, una vez, al aparecer.
function contar(aro: HTMLElement) {
  const entero = aro.querySelector<HTMLElement>('[data-entero]');
  if (!entero) return;
  const final = Number(entero.textContent);
  const inicio = performance.now();
  const paso = (t: number) => {
    const p = Math.min(1, (t - inicio) / 900);
    entero.textContent = String(Math.round(final * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
if (!quieto && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting && (e.target as HTMLElement).offsetParent) { contar(e.target as HTMLElement); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  document.querySelectorAll<HTMLElement>('[data-contar]').forEach((el) => io.observe(el));
}

// 3. Inclinación 3D en tarjetas (solo ratón o trackpad).
if (!quieto && punteroFino) {
  for (const card of document.querySelectorAll<HTMLElement>('.inclinable')) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
  }
}

// 4. Parallax suave del póster del hero.
const parallax = document.querySelector<HTMLElement>('[data-parallax]');
if (!quieto && parallax) {
  let pendiente = false;
  addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, innerHeight);
      parallax.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
      pendiente = false;
    });
  }, { passive: true });
}

// 5. Las chispas se pausan cuando su sección no está en pantalla.
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) e.target.classList.toggle('pausado', !e.isIntersecting);
  });
  document.querySelectorAll('.chispa').forEach((c) => {
    const seccion = c.closest('section');
    if (seccion && !seccion.dataset.observada) { seccion.dataset.observada = ''; io.observe(seccion); }
  });
}
