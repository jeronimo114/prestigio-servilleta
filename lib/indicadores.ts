import type { DatosAnio, IndicadoresAnio, IndicadorConSemaforo, SemaforoColor } from '@/types/servilleta'

function safe(numerador: number, denominador: number, fallback = 0): number {
  if (!denominador || isNaN(denominador)) return fallback
  return numerador / denominador
}

// Devuelve depreciaciones + amortizaciones, prefiriendo los campos separados.
function depAmortTotal(d: DatosAnio): number {
  const sep = (d.depreciaciones || 0) + (d.amortizaciones || 0)
  return sep > 0 ? sep : (d.depreciacionesAmortizaciones || 0)
}

export function calcularDerivedosAnio(datos: DatosAnio): {
  utilidadNeta: number
  totalActivos: number
  totalObligacionesFinancieras: number
  totalPasivos: number
} {
  const utilidadOperacional = (datos.ingresosOperacionales || 0) - (datos.costosTotales || 0) - (datos.gastosTotales || 0)
  const intereses = datos.intereses || 0
  const utilidadNeta = utilidadOperacional - intereses - (datos.impuestos || 0) + (datos.otrosIngresosEgresos || 0)

  const totalActivos =
    (datos.carteraNeta || 0) + (datos.inventarios || 0) + (datos.activosFijosNetos || 0) + (datos.otrosActivos || 0)
  const totalObligacionesFinancieras =
    (datos.obligacionesFinancierasCP || 0) + (datos.obligacionesFinancierasLP || 0)
  const totalPasivos =
    totalObligacionesFinancieras + (datos.proveedores || 0) + (datos.otrosPasivos || 0)

  return { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos }
}

// Flujo de Caja Libre — única fuente de verdad usada por UI e indicadores.
export function calcularFCL(datos: DatosAnio, datosAnterior?: DatosAnio): number {
  const ing = datos.ingresosOperacionales || 0
  const utilidadOperacional = ing - (datos.costosTotales || 0) - (datos.gastosTotales || 0)
  const ebitda = utilidadOperacional + depAmortTotal(datos)

  if (!datosAnterior) return 0

  const deltaCartera = (datosAnterior.carteraNeta || 0) - (datos.carteraNeta || 0)
  const deltaInventarios = (datosAnterior.inventarios || 0) - (datos.inventarios || 0)
  const deltaProveedores = (datos.proveedores || 0) - (datosAnterior.proveedores || 0)
  const deltaAF = (datosAnterior.activosFijosNetos || 0) - (datos.activosFijosNetos || 0)

  return ebitda + deltaCartera + deltaInventarios + deltaProveedores + deltaAF - (datos.impuestos || 0)
}

// Caja Final — fórmula unificada. UI e indicadores deben llamar esta misma función.
//   Caja Final = FCL - Intereses - Amortización Capital - Dividendos + Capitalización
export function calcularCajaFinal(datos: DatosAnio, datosAnterior?: DatosAnio): number {
  const fcl = calcularFCL(datos, datosAnterior)
  const intereses = datos.intereses || 0
  const amortizacion = datos.amortizacionDeuda || 0
  const dividendos = datos.dividendos || 0
  const capitalizacion = datos.capitalizacion || 0
  return fcl - intereses - amortizacion - dividendos + capitalizacion
}

export function calcularIndicadores(
  datos: DatosAnio,
  datosAnterior?: DatosAnio
): IndicadoresAnio {
  const derivados = calcularDerivedosAnio(datos)
  const { totalObligacionesFinancieras, totalActivos, totalPasivos } = derivados

  const ing = datos.ingresosOperacionales || 0
  const costo = datos.costosTotales || 0
  const utilidadOperacional = ing - costo - (datos.gastosTotales || 0)
  const ebitda = utilidadOperacional + depAmortTotal(datos)

  // 1. Liquidez
  const ktno = (datos.carteraNeta || 0) + (datos.inventarios || 0) - (datos.proveedores || 0)
  const rotacionCarteraDias = ing > 0 ? ((datos.carteraNeta || 0) * 365) / ing : 0
  const rotacionInventariosDias = costo > 0 ? ((datos.inventarios || 0) * 365) / costo : 0
  const rotacionProveedoresDias = costo > 0 ? ((datos.proveedores || 0) * 365) / costo : 0
  const cicloFinancieroDias = rotacionCarteraDias + rotacionInventariosDias - rotacionProveedoresDias

  const intereses = datos.intereses || 0
  const amortizacionDeuda = datos.amortizacionDeuda || 0
  const ebitdaIntereses = safe(ebitda, intereses)
  const pasivoFinancieroEbitda = safe(totalObligacionesFinancieras, ebitda)

  // Flujo de Caja Libre + Caja Final (fórmulas unificadas)
  const flujoCajaLibre = calcularFCL(datos, datosAnterior)
  const cajaPeriodo = datosAnterior ? calcularCajaFinal(datos, datosAnterior) : 0
  const totalServicioDeuda = intereses + amortizacionDeuda
  const fclSD = totalServicioDeuda > 0 ? flujoCajaLibre / totalServicioDeuda : 0

  let cambioEnDeuda = 0
  if (datosAnterior) {
    const obligActual = (datos.obligacionesFinancierasCP || 0) + (datos.obligacionesFinancierasLP || 0)
    const obligAnterior = (datosAnterior.obligacionesFinancierasCP || 0) + (datosAnterior.obligacionesFinancierasLP || 0)
    cambioEnDeuda = obligActual - obligAnterior
  }

  // 2. Rentabilidad
  const crecimientoVentas = datosAnterior
    ? safe(ing - (datosAnterior.ingresosOperacionales || 0), datosAnterior.ingresosOperacionales || 0)
    : 0
  const margenEbitda = safe(ebitda, ing)
  const margenNeto = safe(derivados.utilidadNeta, ing)

  // 3. Endeudamiento (calculados pero no se muestran como cards)
  const endeudamiento = safe(totalPasivos, totalActivos)
  const endeudamientoFinanciero = safe(totalObligacionesFinancieras, ing)

  // 4. Palanca de Crecimiento
  const palancaCrecimiento = ktno !== 0 ? safe(ebitda, ktno) : 0

  return {
    ...derivados,
    ktno,
    rotacionCarteraDias,
    rotacionInventariosDias,
    rotacionProveedoresDias,
    cicloFinancieroDias,
    ebitdaIntereses,
    pasivoFinancieroEbitda,
    flujoCajaLibre,
    servicioDeudaIntereses: intereses,
    servicioDeudaAmortizacion: amortizacionDeuda,
    cambioEnDeuda,
    cajaPeriodo,
    fclSD,
    crecimientoVentas,
    margenEbitda,
    margenNeto,
    endeudamiento,
    endeudamientoFinanciero,
    palancaCrecimiento,
  }
}

// Semáforos según rangos estándar Prestigio (pendientes de validación con Bancolombia)
export function semaforo(indicador: string, valor: number): SemaforoColor {
  switch (indicador) {
    case 'margenEbitda':
      if (valor >= 0.15) return 'verde'
      if (valor >= 0.05) return 'amarillo'
      return 'rojo'
    case 'crecimientoVentas':
      if (valor >= 0.1) return 'verde'
      if (valor >= 0) return 'amarillo'
      return 'rojo'
    case 'palancaCrecimiento':
      if (valor > 1) return 'verde'
      if (valor > 0.5) return 'amarillo'
      return 'rojo'
    case 'ebitdaIntereses':
      if (valor >= 3) return 'verde'
      if (valor >= 1.5) return 'amarillo'
      return 'rojo'
    case 'rotacionCarteraDias':
      if (valor <= 30) return 'verde'
      if (valor <= 60) return 'amarillo'
      return 'rojo'
    case 'rotacionInventariosDias':
      if (valor <= 45) return 'verde'
      if (valor <= 90) return 'amarillo'
      return 'rojo'
    case 'rotacionProveedoresDias':
      // Más días = mejor (más plazo para pagar)
      if (valor >= 30) return 'verde'
      if (valor >= 15) return 'amarillo'
      return 'rojo'
    case 'cicloFinancieroDias':
      // Negativo o bajo = excelente (proveedores financian la operación)
      if (valor <= 60) return 'verde'
      if (valor <= 120) return 'amarillo'
      return 'rojo'
    case 'fclSD':
      if (valor >= 1.5) return 'verde'
      if (valor >= 1) return 'amarillo'
      return 'rojo'
    default:
      return 'verde'
  }
}

// Sólo indicadores derivables de los datos que pedimos (mini servilleta).
// Removidos: Margen Neto, Endeudamiento, Endeudamiento Financiero, Pasivo Financiero/EBITDA
// (requieren obligaciones financieras separadas u otros ingresos/egresos que no recolectamos).
export function indicadoresConSemaforo(ind: IndicadoresAnio): IndicadorConSemaforo[] {
  return [
    // Rentabilidad
    {
      nombre: 'Margen EBITDA',
      valor: ind.margenEbitda,
      semaforo: semaforo('margenEbitda', ind.margenEbitda),
      descripcion: 'Qué porcentaje de tus ventas se convierte en EBITDA',
      formato: 'porcentaje',
    },
    {
      nombre: 'Crecimiento en Ventas',
      valor: ind.crecimientoVentas,
      semaforo: semaforo('crecimientoVentas', ind.crecimientoVentas),
      descripcion: 'Crecimiento de ingresos vs año anterior',
      formato: 'porcentaje',
    },
    // Liquidez
    {
      nombre: 'EBITDA / Intereses',
      valor: ind.ebitdaIntereses,
      semaforo: semaforo('ebitdaIntereses', ind.ebitdaIntereses),
      descripcion: 'Capacidad de pagar intereses con EBITDA',
      formato: 'veces',
    },
    {
      nombre: 'Rotación de Cartera',
      valor: ind.rotacionCarteraDias,
      semaforo: semaforo('rotacionCarteraDias', ind.rotacionCarteraDias),
      descripcion: 'Días promedio que tardas en cobrar a tus clientes',
      formato: 'dias',
    },
    {
      nombre: 'Rotación de Inventarios',
      valor: ind.rotacionInventariosDias,
      semaforo: semaforo('rotacionInventariosDias', ind.rotacionInventariosDias),
      descripcion: 'Días promedio que tu inventario permanece almacenado',
      formato: 'dias',
    },
    {
      nombre: 'Rotación de Proveedores',
      valor: ind.rotacionProveedoresDias,
      semaforo: semaforo('rotacionProveedoresDias', ind.rotacionProveedoresDias),
      descripcion: 'Días promedio que tardas en pagar a proveedores',
      formato: 'dias',
    },
    {
      nombre: 'Ciclo Financiero',
      valor: ind.cicloFinancieroDias,
      semaforo: semaforo('cicloFinancieroDias', ind.cicloFinancieroDias),
      descripcion: 'Días que tardas en convertir inventario en caja. Negativo significa que tus proveedores financian la operación (positivo para el negocio).',
      formato: 'dias',
    },
    // Palanca de Crecimiento
    {
      nombre: 'Palanca de Crecimiento',
      valor: ind.palancaCrecimiento,
      semaforo: semaforo('palancaCrecimiento', ind.palancaCrecimiento),
      descripcion: 'EBITDA/KTNO — >1 significa que generas caja al crecer',
      formato: 'veces',
    },
    // Flujo de Caja Libre
    {
      nombre: 'FCL / Servicio Deuda',
      valor: ind.fclSD,
      semaforo: semaforo('fclSD', ind.fclSD),
      descripcion: 'Capacidad del flujo de caja libre para cubrir el servicio de deuda',
      formato: 'veces',
    },
  ]
}

export function formatearValor(valor: number, formato: IndicadorConSemaforo['formato']): string {
  if (!isFinite(valor) || isNaN(valor)) return 'N/A'
  switch (formato) {
    case 'porcentaje':
      return `${(valor * 100).toFixed(1)}%`
    case 'veces':
      return `${valor.toFixed(2)}x`
    case 'dias':
      return `${Math.round(valor)} días`
    case 'numero':
      return valor.toLocaleString('es-CO')
  }
}
