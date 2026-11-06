// Generador de CSV — puro: sin db, sin reloj, sin I/O.
// Formato: UTF-8 con BOM, coma, CRLF (RFC 4180).

const BOM = '\uFEFF'
const CRLF = '\r\n'
const ENCABEZADO = ['fecha', 'tipo', 'monto', 'categoria', 'descripcion']

// Celdas que empiezan con estos caracteres podrían ejecutarse como fórmulas
// en Excel (formula injection): se prefijan con un apostrofe.
const PREFIJO_FORMULA = /^[=+\-@]/

function entrecomillar(valor) {
  let texto = String(valor)
  if (PREFIJO_FORMULA.test(texto)) {
    texto = `'${texto}`
  }
  if (/[",\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

/**
 * Convierte movimientos en texto CSV (BOM + encabezado + una línea CRLF por
 * movimiento). Misma entrada → misma salida.
 *
 * @param {Array<{fecha: string, tipo: string, monto: number, categoria: string, descripcion: string|null}>} movimientos
 * @returns {string}
 */
export function generarCsv(movimientos) {
  const lineas = [ENCABEZADO.map(entrecomillar).join(',')]
  for (const m of movimientos) {
    lineas.push(
      [m.fecha, m.tipo, m.monto, m.categoria, m.descripcion ?? ''].map(entrecomillar).join(',')
    )
  }
  return BOM + lineas.join(CRLF) + CRLF
}
