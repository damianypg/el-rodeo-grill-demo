import site from '../data/site.json';

export const saludo = 'Hola, El Rodeo Grill.';

export const waMensajes = {
  pedido: `${saludo} Quiero hacer un pedido.`,
  reserva: `${saludo} Quiero reservar una mesa para ___ personas el día ___.`,
  ubicacion: `${saludo} ¿Me ayudan con la ubicación del local nuevo?`,
  corte: (corte: string, tamano?: string) => `${saludo} Quiero un ${corte}${tamano ? ` ${tamano.toLowerCase()}` : ''}.`,
  plato: (plato: string) => `${saludo} Quiero pedir: ${plato}.`,
  promo: (dia: string, plato: string) => `${saludo} Quiero la promo 2x1 del ${dia.toLowerCase()}: ${plato.toLowerCase()}.`,
};

export function waLink(texto: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&output=embed`;
export const googleReviewsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('El Rodeo Grill Riobamba')}`;
