import { describe, it, expect, beforeAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'
import { buildServilletaWorkbook } from '@/lib/excel-builder'
import { calcularCajaFinal } from '@/lib/indicadores'
import type { DatosAnio } from '@/types/servilleta'

function baseDatos(overrides: Partial<DatosAnio> = {}): DatosAnio {
  return {
    ingresosOperacionales: 5620,
    costosTotales: 2980,
    gastosTotales: 1795,
    depreciaciones: 110,
    amortizaciones: 60,
    depreciacionesAmortizaciones: 170,
    utilidadBruta: 2640,
    ebitda: 1015,
    utilidadOperacional: 845,
    intereses: 132,
    amortizacionDeuda: 355,
    impuestos: 225,
    otrosIngresosEgresos: 18,
    carteraNeta: 340,
    inventarios: 420,
    activosFijosNetos: 1850,
    otrosActivos: 590,
    obligacionesFinancierasCP: 280,
    obligacionesFinancierasLP: 710,
    proveedores: 480,
    otrosPasivos: 315,
    capitalSuperavit: 750,
    totalPatrimonio: 1465,
    dividendos: 50,
    capitalizacion: 100,
    ...overrides,
  }
}

const ant: DatosAnio = baseDatos({
  ingresosOperacionales: 4850,
  costosTotales: 2665,
  gastosTotales: 1505,
  depreciaciones: 95,
  amortizaciones: 50,
  depreciacionesAmortizaciones: 145,
  utilidadBruta: 2185,
  ebitda: 825,
  utilidadOperacional: 680,
  intereses: 145,
  amortizacionDeuda: 390,
  impuestos: 178,
  carteraNeta: 290,
  inventarios: 385,
  activosFijosNetos: 1620,
  proveedores: 415,
  dividendos: 0,
  capitalizacion: 0,
})

const act: DatosAnio = baseDatos()

let wb: ExcelJS.Workbook

beforeAll(async () => {
  const templatePath = path.join(process.cwd(), 'lib', 'templates', 'servilleta.xlsm')
  const buffer = fs.readFileSync(templatePath)
  wb = await buildServilletaWorkbook(
    {
      empresa: 'Delicias del Valle',
      anioAnterior: 2024,
      anioActual: 2025,
      datosAnioAnterior: ant,
      datosAnioActual: act,
    },
    buffer
  )
})

describe('Excel export — Caja Final (audio Diana 2026-05-11 17:29)', () => {
  it('Mini servilleta D17 (caja final año actual) usa una FÓRMULA que incluye dividendos y capitalización', () => {
    const mini = wb.getWorksheet('Mini servilleta')!
    const cell = mini.getCell('D17')
    const v = cell.value as { formula?: string; result?: number } | number | null

    // La celda debe ser una FÓRMULA, no un valor literal — Diana revisa la
    // fórmula en Excel y necesita ver las celdas referenciadas.
    expect(typeof v).toBe('object')
    const formula = (v as { formula?: string }).formula
    expect(formula, 'D17 debe tener fórmula').toBeTruthy()

    // La fórmula debe referenciar D18 (dividendos) y D19 (capitalización)
    expect(formula).toContain('D18')
    expect(formula).toContain('D19')

    // Resultado calculado debe igualar calcularCajaFinal
    const esperado = calcularCajaFinal(act, ant)
    const resultadoEnExcel = (v as { result?: number }).result
    expect(resultadoEnExcel).toBeCloseTo(esperado, 5)
  })

  it('Mini servilleta tiene Dividendos en fila 18 y Capitalización en fila 19', () => {
    const mini = wb.getWorksheet('Mini servilleta')!
    expect(String(mini.getCell('B18').value)).toMatch(/Dividendos/i)
    expect(String(mini.getCell('B19').value)).toMatch(/Capitalizaci/i)
    expect(mini.getCell('D18').value).toBe(act.dividendos)
    expect(mini.getCell('D19').value).toBe(act.capitalizacion)
  })
})

describe('Excel export — Servilleta Su empresa vacía (audio Diana 2026-05-11 17:21)', () => {
  it('las celdas de entrada (D, F, H columnas 7-19) en Servilleta Su empresa están vacías', () => {
    const su = wb.getWorksheet('Servilleta Su empresa')!
    // Muestreo de filas críticas que el template prellenaba con 100 / 0
    const muestras = ['D7', 'D8', 'D16', 'F7', 'F8', 'F16', 'H7', 'H8', 'H16']
    for (const addr of muestras) {
      const cell = su.getCell(addr)
      if (cell.formula) continue // fórmulas se preservan
      const v = cell.value
      expect(v == null || v === '', `${addr} debería estar vacía pero contiene ${JSON.stringify(v)}`).toBe(true)
    }
  })

  it('el nombre de la empresa sí se conserva en el header C3', () => {
    const su = wb.getWorksheet('Servilleta Su empresa')!
    const v = String(su.getCell('C3').value ?? '')
    expect(v).toContain('Delicias del Valle')
  })
})

describe('Excel export — Años dinámicos (audio Diana 2026-05-11 17:12)', () => {
  it('Inicio Servilleta contiene los años en celdas referenciables', () => {
    const inicio = wb.getWorksheet('Inicio Servilleta')!
    expect(inicio.getCell('C5').value).toBe(2024)
    expect(inicio.getCell('C6').value).toBe(2025)
  })

  it('Mini servilleta C2/D2 son fórmulas que apuntan a Inicio Servilleta', () => {
    const mini = wb.getWorksheet('Mini servilleta')!
    const c2 = mini.getCell('C2').value as { formula?: string } | unknown
    const d2 = mini.getCell('D2').value as { formula?: string } | unknown
    expect((c2 as { formula?: string }).formula).toMatch(/Inicio Servilleta/i)
    expect((d2 as { formula?: string }).formula).toMatch(/Inicio Servilleta/i)
  })

  it('Servilleta Su empresa F4/H4 son fórmulas que apuntan a Inicio Servilleta', () => {
    const su = wb.getWorksheet('Servilleta Su empresa')!
    const f4 = su.getCell('F4').value as { formula?: string }
    const h4 = su.getCell('H4').value as { formula?: string }
    expect(f4.formula).toMatch(/Inicio Servilleta/i)
    expect(h4.formula).toMatch(/Inicio Servilleta/i)
  })
})
