// Precios en centavos para evitar errores de coma flotante.
export function partesPrecio(centavos: number) {
  return { entero: String(Math.floor(centavos / 100)), cent: String(centavos % 100).padStart(2, '0') };
}

export function formatoPrecio(centavos: number): string {
  const { entero, cent } = partesPrecio(centavos);
  return `$${entero},${cent}`;
}
