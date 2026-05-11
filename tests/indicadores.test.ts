import { describe, it, expect } from 'vitest'
import { calcularIndicadores, indicadoresConSemaforo, calcularCajaFinal } from '@/lib/indicadores'
import type { DatosAnio } from '@/types/servilleta'

function baseDatos(overrides: Partial<DatosAnio> = {}): DatosAnio {
  return {
    ingresosOperacionales: 5620,
    costosTotales: 2980,
    gastosTotales: 1795,
    depreciaciones: 100,
    amortizaciones: 70,
    depreciacionesAmortizaciones: 170,
    utilidadBruta: 0,
    ebitda: 0,
    utilidadOperacional: 0,
    intereses: 132,
    amortizacionDeuda: 355,
    impuestos: 225,
    otrosIngresosEgresos: 0,
    carteraNeta: 340,
    inventarios: 420,
    activosFijosNetos: 1850,
    otrosActivos: 0,
    obligacionesFinancierasCP: 280,
    obligacionesFinancierasLP: 710,
    proveedores: 480,
    otrosPasivos: 0,
    capitalSuperavit: 0,
    totalPatrimonio: 0,
    dividendos: 50,
    capitalizacion: 0,
    ...overrides,
  }
}

describe('Caja Final — incluye capitalización', () => {
  it('caja final usa la fórmula: FCL - intereses - amortización - dividendos + capitalización', () => {
    const ant = baseDatos({
      ingresosOperacionales: 4850,
      costosTotales: 2665,
      gastosTotales: 1505,
      depreciaciones: 80,
      amortizaciones: 65,
      depreciacionesAmortizaciones: 145,
      carteraNeta: 290,
      inventarios: 385,
      activosFijosNetos: 1620,
      proveedores: 415,
      intereses: 145,
      amortizacionDeuda: 390,
      impuestos: 178,
      dividendos: 0,
      capitalizacion: 0,
    })
    const act = baseDatos({ capitalizacion: 100 })

    const cajaConCap = calcularCajaFinal(act, ant)
    const cajaSinCap = calcularCajaFinal({ ...act, capitalizacion: 0 }, ant)

    expect(cajaConCap - cajaSinCap).toBe(100)
  })

  it('UI y indicadores producen el mismo cajaFinal', () => {
    const ant = baseDatos({ capitalizacion: 0 })
    const act = baseDatos({ capitalizacion: 200 })
    const ind = calcularIndicadores(act, ant)
    const cajaUnificada = calcularCajaFinal(act, ant)
    expect(ind.cajaPeriodo).toBeCloseTo(cajaUnificada, 5)
  })
})

describe('Indicadores filtrados — sólo los derivables de mini servilleta', () => {
  const ant = baseDatos({
    ingresosOperacionales: 4850,
    costosTotales: 2665,
    gastosTotales: 1505,
    depreciaciones: 80,
    amortizaciones: 65,
    depreciacionesAmortizaciones: 145,
    carteraNeta: 290,
    inventarios: 385,
    activosFijosNetos: 1620,
    proveedores: 415,
  })
  const act = baseDatos()
  const ind = calcularIndicadores(act, ant)
  const lista = indicadoresConSemaforo(ind)
  const nombres = lista.map(i => i.nombre)

  it('NO incluye Margen Neto (no recolectamos otros ingresos/egresos completos)', () => {
    expect(nombres).not.toContain('Margen Neto')
  })

  it('NO incluye Endeudamiento (no recolectamos obligaciones financieras separadas)', () => {
    expect(nombres).not.toContain('Endeudamiento')
  })

  it('NO incluye Endeudamiento Financiero', () => {
    expect(nombres).not.toContain('Endeudamiento Financiero')
  })

  it('NO incluye Pasivo Financiero / EBITDA', () => {
    expect(nombres).not.toContain('Pasivo Financiero / EBITDA')
  })

  it('SÍ incluye Margen EBITDA', () => {
    expect(nombres).toContain('Margen EBITDA')
  })

  it('SÍ incluye Crecimiento en Ventas', () => {
    expect(nombres).toContain('Crecimiento en Ventas')
  })

  it('SÍ incluye las 3 rotaciones individuales y ciclo financiero', () => {
    expect(nombres).toContain('Rotación de Cartera')
    expect(nombres).toContain('Rotación de Inventarios')
    expect(nombres).toContain('Rotación de Proveedores')
    expect(nombres).toContain('Ciclo Financiero')
  })

  it('SÍ incluye Palanca de Crecimiento', () => {
    expect(nombres).toContain('Palanca de Crecimiento')
  })

  it('SÍ incluye EBITDA / Intereses y FCL / Servicio Deuda', () => {
    expect(nombres).toContain('EBITDA / Intereses')
    expect(nombres).toContain('FCL / Servicio Deuda')
  })
})

describe('Crecimiento en Ventas requiere ambos años', () => {
  it('con ambos años, el crecimiento se calcula correctamente', () => {
    const ant = baseDatos({ ingresosOperacionales: 1000 })
    const act = baseDatos({ ingresosOperacionales: 1200 })
    const ind = calcularIndicadores(act, ant)
    expect(ind.crecimientoVentas).toBeCloseTo(0.2, 5) // 20%
  })

  it('con año anterior en cero o sin datos, retorna 0 en lugar de NaN/Infinity', () => {
    const ant = baseDatos({ ingresosOperacionales: 0 })
    const act = baseDatos({ ingresosOperacionales: 1200 })
    const ind = calcularIndicadores(act, ant)
    expect(Number.isFinite(ind.crecimientoVentas)).toBe(true)
  })
})

describe('Depreciaciones y amortizaciones separadas', () => {
  it('EBITDA suma depreciaciones + amortizaciones por separado', () => {
    const datos = baseDatos({
      ingresosOperacionales: 1000,
      costosTotales: 400,
      gastosTotales: 200,
      depreciaciones: 50,
      amortizaciones: 30,
      depreciacionesAmortizaciones: 80,
    })
    const ind = calcularIndicadores(datos)
    // Util operacional = 1000 - 400 - 200 = 400
    // EBITDA = util operacional + dep + amort = 400 + 50 + 30 = 480
    const margenEsperado = 480 / 1000
    expect(ind.margenEbitda).toBeCloseTo(margenEsperado, 5)
  })
})
