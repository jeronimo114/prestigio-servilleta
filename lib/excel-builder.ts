import ExcelJS from 'exceljs'
import type { DatosAnio } from '@/types/servilleta'
import { calcularCajaFinal, calcularFCL } from '@/lib/indicadores'

export interface ServilletaExportParams {
  empresa: string
  anioAnterior: number
  anioActual: number
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio
}

function derivar(d: DatosAnio) {
  const utilidadBruta = (d.ingresosOperacionales || 0) - (d.costosTotales || 0)
  const utilidadOperacional = utilidadBruta - (d.gastosTotales || 0)
  const depAmortSep = (d.depreciaciones || 0) + (d.amortizaciones || 0)
  const depAmort = depAmortSep > 0 ? depAmortSep : (d.depreciacionesAmortizaciones || 0)
  const ebitda = utilidadOperacional + depAmort
  return { utilidadBruta, utilidadOperacional, ebitda }
}

// Año-fuente único: las dos celdas de 'Inicio Servilleta' a las que apuntan
// el resto de hojas para que cambiar el año en un solo lugar propague.
const INICIO_YEAR_PREV_CELL = 'C5'
const INICIO_YEAR_CURR_CELL = 'C6'
const INICIO_YEAR_PREV_REF = `'Inicio Servilleta'!$${INICIO_YEAR_PREV_CELL}`
const INICIO_YEAR_CURR_REF = `'Inicio Servilleta'!$${INICIO_YEAR_CURR_CELL}`

export async function buildServilletaWorkbook(
  params: ServilletaExportParams,
  templateBuffer: Buffer | ArrayBuffer
): Promise<ExcelJS.Workbook> {
  const { empresa, anioAnterior, anioActual, datosAnioAnterior, datosAnioActual } = params

  const derivAnt = derivar(datosAnioAnterior)
  const derivAct = derivar(datosAnioActual)

  const wb = new ExcelJS.Workbook()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(templateBuffer as any)

  // ─── Inicio Servilleta: fuente única de los años ──────────────────
  const inicio = wb.getWorksheet('Inicio Servilleta')
  if (inicio) {
    inicio.getCell('B5').value = 'Año anterior'
    inicio.getCell(INICIO_YEAR_PREV_CELL).value = anioAnterior
    inicio.getCell('B6').value = 'Año actual'
    inicio.getCell(INICIO_YEAR_CURR_CELL).value = anioActual
  }

  // ─── Servilleta Su empresa: vacía (per Diana 2026-05-11) ──────────
  // El usuario llena la mini servilleta; esta hoja queda en blanco
  // para que la pueda completar manualmente si quiere.
  const ws = wb.getWorksheet('Servilleta Su empresa')
  if (ws) {
    // Nombre de empresa sigue marcado en el header (C3 es merged C3:C5)
    ws.getCell('C3').value = `${empresa}\n`

    // Años en cabecera apuntan a Inicio Servilleta
    ws.getCell('F4').value = { formula: INICIO_YEAR_PREV_REF, result: anioAnterior } as ExcelJS.CellValue
    ws.getCell('H4').value = { formula: INICIO_YEAR_CURR_REF, result: anioActual } as ExcelJS.CellValue

    // Limpiar todas las columnas de entrada (D, E, F, G, H, I) — el usuario
    // las llenará manualmente si lo desea. Las fórmulas en J/K/L se preservan.
    const inputCols = ['D', 'E', 'F', 'G', 'H', 'I']
    const inputRowStart = 7
    const inputRowEnd = 33
    for (let row = inputRowStart; row <= inputRowEnd; row++) {
      for (const col of inputCols) {
        const cell = ws.getCell(`${col}${row}`)
        // No tocar celdas con fórmula — sólo limpiar valores literales (los
        // ejemplos hardcodeados del template).
        if (cell.formula) continue
        cell.value = null
      }
    }

    // Limpiar también los indicadores del caso ejemplo (filas 37-59 col D)
    const indicatorRows = [37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 50, 51, 53, 54, 55, 56, 57, 58, 59]
    for (const row of indicatorRows) {
      const cell = ws.getCell(`D${row}`)
      if (!cell.formula) cell.value = null
    }
  }

  // ─── Mini servilleta: la única hoja con datos del usuario ─────────
  const mini = wb.getWorksheet('Mini servilleta')
  if (mini) {
    // Años apuntan a Inicio Servilleta para que un cambio se propague
    mini.getCell('C2').value = { formula: INICIO_YEAR_PREV_REF, result: anioAnterior } as ExcelJS.CellValue
    mini.getCell('D2').value = { formula: INICIO_YEAR_CURR_REF, result: anioActual } as ExcelJS.CellValue

    // Estado de Resultados
    mini.getCell('C5').value = datosAnioAnterior.ingresosOperacionales
    mini.getCell('D5').value = datosAnioActual.ingresosOperacionales

    mini.getCell('C6').value = (datosAnioAnterior.costosTotales || 0) + (datosAnioAnterior.gastosTotales || 0)
    mini.getCell('D6').value = (datosAnioActual.costosTotales || 0) + (datosAnioActual.gastosTotales || 0)

    mini.getCell('C7').value = derivAnt.ebitda
    mini.getCell('D7').value = derivAct.ebitda

    mini.getCell('C8').value = datosAnioAnterior.intereses || 0
    mini.getCell('D8').value = datosAnioActual.intereses || 0

    mini.getCell('C9').value = datosAnioAnterior.impuestos
    mini.getCell('D9').value = datosAnioActual.impuestos

    // Balance General
    mini.getCell('C11').value = datosAnioAnterior.carteraNeta
    mini.getCell('D11').value = datosAnioActual.carteraNeta

    mini.getCell('C12').value = datosAnioAnterior.inventarios
    mini.getCell('D12').value = datosAnioActual.inventarios

    mini.getCell('C13').value = datosAnioAnterior.activosFijosNetos
    mini.getCell('D13').value = datosAnioActual.activosFijosNetos

    mini.getCell('C14').value = datosAnioAnterior.proveedores
    mini.getCell('D14').value = datosAnioActual.proveedores

    // FCL — solo se calcula con dos años; la columna del año anterior queda en 0.
    const fclAct = calcularFCL(datosAnioActual, datosAnioAnterior)
    mini.getCell('C15').value = 0
    mini.getCell('D15').value = fclAct

    // Servicio deuda total = intereses + amortización a capital
    mini.getCell('C16').value = (datosAnioAnterior.intereses || 0) + (datosAnioAnterior.amortizacionDeuda || 0)
    mini.getCell('D16').value = (datosAnioActual.intereses || 0) + (datosAnioActual.amortizacionDeuda || 0)

    // Dividendos y Capitalización ANTES de fijar caja final para que la fórmula
    // pueda referenciarlos.
    mini.getCell('B18').value = 'Dividendos'
    mini.getCell('C18').value = datosAnioAnterior.dividendos || 0
    mini.getCell('D18').value = datosAnioActual.dividendos || 0

    mini.getCell('B19').value = 'Capitalización'
    mini.getCell('C19').value = datosAnioAnterior.capitalizacion || 0
    mini.getCell('D19').value = datosAnioActual.capitalizacion || 0

    // Caja final — FÓRMULA CORREGIDA per Diana 2026-05-11.
    //   Caja Final = FCL - Servicio Deuda + Capitalización - Dividendos
    // La fórmula previa (=D15-D16) ignoraba dividendos y capitalización.
    const cajaFinalAnt = 0
    const cajaFinalAct = calcularCajaFinal(datosAnioActual, datosAnioAnterior)
    mini.getCell('C17').value = {
      formula: 'C15-C16+C19-C18',
      result: cajaFinalAnt,
    } as ExcelJS.CellValue
    mini.getCell('D17').value = {
      formula: 'D15-D16+D19-D18',
      result: cajaFinalAct,
    } as ExcelJS.CellValue
  }

  // ─── Gestión y Acciones Su empresa: vacía (per Diana) ─────────────
  const gestion = wb.getWorksheet('Gestión y Acciones Su empresa')
  if (gestion) {
    // Limpiar cualquier valor de ejemplo prellenado, preservando fórmulas.
    gestion.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (cell.formula) return
        // Conservar encabezados (texto puro como "Gestión", "Acción", etc.)
        if (typeof cell.value === 'string') return
        cell.value = null
      })
    })
  }

  return wb
}
