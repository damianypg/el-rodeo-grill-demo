// Constructor de pedido por WhatsApp: estado en memoria (y en sessionStorage como comodidad), sin backend.
import { waLink, waMensajes, saludo } from '../lib/wa';
import { formatoPrecio } from '../lib/precio';

type Catalogo = Record<string, { nombre: string; precio: number }>;
const CLAVE = 'rodeo-pedido';

export function iniciarPedido() {
  const catalogo: Catalogo = JSON.parse(document.getElementById('catalogo')!.textContent!);
  const raiz = document.querySelector<HTMLElement>('[data-pedido]')!;
  const lista = raiz.querySelector<HTMLUListElement>('[data-pedido-lista]')!;
  const vacio = raiz.querySelector<HTMLElement>('[data-pedido-vacio]')!;
  const form = raiz.querySelector<HTMLElement>('[data-pedido-form]')!;
  const total = raiz.querySelector<HTMLElement>('[data-pedido-total]')!;
  const cuenta = raiz.querySelector<HTMLElement>('[data-pedido-cuenta]')!;
  const enviar = raiz.querySelector<HTMLAnchorElement>('[data-pedido-enviar]')!;
  const nota = raiz.querySelector<HTMLTextAreaElement>('[data-pedido-nota]')!;
  const aviso = raiz.querySelector<HTMLElement>('[data-pedido-aviso]')!;

  let items: Record<string, number> = {};
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? '{}');
    for (const [id, n] of Object.entries(guardado)) if (catalogo[id] && Number.isInteger(n) && (n as number) > 0) items[id] = Math.min(n as number, 20);
  } catch { /* sin almacenamiento: el pedido vive solo en memoria */ }

  const cantidad = () => Object.values(items).reduce((a, b) => a + b, 0);

  function mensaje(): string {
    const modalidad = raiz.querySelector<HTMLInputElement>('input[name="modalidad"]:checked')?.dataset.modalidad ?? '';
    const lineas = Object.entries(items).map(([id, n]) => `- ${n} x ${catalogo[id].nombre}`);
    const suma = Object.entries(items).reduce((a, [id, n]) => a + catalogo[id].precio * n, 0);
    const texto = [`${saludo} Quiero hacer este pedido:`, ...lineas, `Total referencial: ${formatoPrecio(suma)}`, `Para: ${modalidad.toLowerCase()}`];
    const n = nota.value.trim();
    if (n) texto.push(`Nota: ${n}`);
    return texto.join('\n');
  }

  function pintar() {
    const n = cantidad();
    const hay = n > 0;
    vacio.hidden = hay;
    lista.hidden = !hay;
    form.hidden = !hay;
    cuenta.textContent = n === 1 ? '1 producto' : `${n} productos`;
    lista.replaceChildren(
      ...Object.entries(items).map(([id, q]) => {
        const { nombre, precio } = catalogo[id];
        const li = document.createElement('li');
        li.className = 'flex items-center gap-3 rounded-xl bg-madera-800 p-3';
        li.innerHTML = `
          <span class="flex-1"><span class="block font-semibold text-white"></span><span class="block text-[0.875rem] text-humo-300"></span></span>
          <span class="flex items-center gap-1">
            <button type="button" class="grid size-11 place-items-center rounded-full border-2 border-cafe-600 text-xl font-bold text-white hover:border-oro-300" data-menos>−</button>
            <span class="w-7 text-center font-display text-xl text-white" data-cantidad></span>
            <button type="button" class="grid size-11 place-items-center rounded-full border-2 border-cafe-600 text-xl font-bold text-white hover:border-oro-300" data-mas>+</button>
          </span>`;
        // Texto vía textContent: nunca se interpola en HTML.
        const [t1, t2] = li.querySelectorAll<HTMLElement>('span > span');
        t1.textContent = nombre;
        t2.textContent = `${formatoPrecio(precio)} c/u`;
        li.querySelector('[data-cantidad]')!.textContent = String(q);
        const menos = li.querySelector<HTMLButtonElement>('[data-menos]')!;
        const mas = li.querySelector<HTMLButtonElement>('[data-mas]')!;
        menos.setAttribute('aria-label', `Quitar uno: ${nombre}`);
        mas.setAttribute('aria-label', `Agregar uno: ${nombre}`);
        menos.addEventListener('click', () => cambiar(id, -1, menos));
        mas.addEventListener('click', () => cambiar(id, 1, mas));
        return li;
      }),
    );
    const suma = Object.entries(items).reduce((a, [id, q]) => a + catalogo[id].precio * q, 0);
    total.textContent = formatoPrecio(suma);
    enviar.href = waLink(hay ? mensaje() : waMensajes.pedido);

    // Contadores y barras de WhatsApp fuera del panel.
    for (const c of document.querySelectorAll<HTMLElement>('[data-contador]')) {
      c.textContent = String(n);
      c.classList.toggle('hidden', !hay);
    }
    for (const b of document.querySelectorAll<HTMLAnchorElement>('[data-barra-wa]')) {
      b.href = hay ? '#pedido' : waLink(waMensajes.pedido);
      // Con pedido, la barra lleva al panel en la misma página; sin pedido, abre WhatsApp en otra pestaña.
      if (hay) b.removeAttribute('target');
      else b.setAttribute('target', '_blank');
      b.querySelector('[data-barra-texto]')!.textContent = hay ? `Ver mi pedido (${n})` : 'Pedir por WhatsApp';
    }
    try { sessionStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento */ }
  }

  function cambiar(id: string, delta: number, origen?: HTMLElement) {
    const antes = items[id] ?? 0;
    const despues = Math.max(0, Math.min(20, antes + delta));
    if (despues === 0) delete items[id];
    else items[id] = despues;
    pintar();
    const n = cantidad();
    aviso.textContent = `${delta > 0 ? 'Agregaste' : 'Quitaste'} ${catalogo[id].nombre}. Tu pedido tiene ${n} ${n === 1 ? 'producto' : 'productos'}.`;
    // La lista se repinta: el foco vuelve al mismo botón o, si el producto salió, al título del panel.
    if (origen) {
      const etiqueta = origen.getAttribute('aria-label') ?? '';
      const mismo = Array.from(lista.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === etiqueta);
      (mismo ?? raiz.querySelector<HTMLElement>('h3'))?.focus();
    }
  }

  // Botones "Agregar" fijos (menú, promos) y de cortes (leen el tamaño elegido).
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-agregar], [data-agregar-corte]');
    if (!btn) return;
    let id = btn.dataset.agregar;
    if (btn.hasAttribute('data-agregar-corte')) {
      const card = btn.closest<HTMLElement>('[data-corte]')!;
      const tam = card.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value ?? 'unico';
      id = `${card.dataset.corte}:${tam}`;
      // Destello de fuego en el borde de la tarjeta al agregar.
      card.classList.remove('destello');
      void card.offsetWidth;
      card.classList.add('destello');
    }
    if (id && catalogo[id]) {
      cambiar(id, 1);
      // La etiqueta original se guarda una sola vez: un doble toque no la pisa con "Agregado ✓".
      btn.dataset.etiqueta ??= btn.textContent ?? '';
      // Ancho fijo mientras dice "Agregado ✓": si el botón se encoge, la fila se reacomoda y el siguiente toque cae fuera.
      btn.style.minWidth = `${btn.offsetWidth}px`;
      btn.textContent = 'Agregado ✓';
      clearTimeout(Number(btn.dataset.timer));
      btn.dataset.timer = String(setTimeout(() => { btn.textContent = btn.dataset.etiqueta!; btn.style.minWidth = ''; }, 1400));
    }
  });

  raiz.addEventListener('change', pintar);
  nota.addEventListener('input', () => { enviar.href = waLink(mensaje()); });
  raiz.querySelector('h3')!.tabIndex = -1;
  pintar();
}
