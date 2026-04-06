import type { DatosAnio, IndicadoresAnio, IndicadorConSemaforo, SemaforoColor } from '@/types/servilleta'

function safe(numerador: number, denominador: number, fallback = 0): number {
  if (!denominador || isNaN(denominador)) return fallback
  return numerador / denominador
}

export function calcularDerivedosAnio(datos: DatosAnio): {
  utilidadNeta: number
  totalActivos: number
  totalObligacionesFinancieras: number
  totalPasivos: number
} {
  // Derivados del P&G usando nuevos campos
  const utilidadOperacional = datos.ingresosOperacionales - datos.costosTotales - datos.gastosTotales
  const ebitda = utilidadOperacional + datos.depreciacionesAmortizaciones
  const intereses = datos.intereses || (datos.servicioDeuda > 0 ? datos.servicioDeuda * 0.3 : 0)
  const utilidadNeta = utilidadOperacional - intereses - datos.impuestos + datos.otrosIngresosEgresos

  const totalActivos =
    datos.carteraNeta + datos.inventarios + datos.activosFijosNetos + datos.otrosActivos
  const totalObligacionesFinancieras =
    datos.obligacionesFinancierasCP + datos.obligacionesFinancierasLP
  const totalPasivos =
    totalObligacionesFinancieras + datos.proveedores + datos.otrosPasivos

  return { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos }
}

// Anos de deuda LP (mismo default que el Excel, celda H54)
const ANIOS_DEUDA_LP = 2

export function calcularIndicadores(
  datos: DatosAnio,
  datosAnterior?: DatosAnio
): IndicadoresAnio {
  const derivados = calcularDerivedosAnio(datos)
  const { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos } = derivados

  const ing = datos.ingresosOperacionales
  // Costo de ventas = costosTotales (nuevo campo directo)
  const costo = datos.costosTotales
  // EBITDA calculado desde inputs
  const utilidadOperacional = ing - datos.costosTotales - datos.gastosTotales
  const ebitda = utilidadOperacional + datos.depreciacionesAmortizaciones

  // 1. Liquidez
  const ktno = datos.carteraNeta + datos.inventarios - datos.proveedores
  const rotacionCarteraDias = ing > 0 ? (datos.carteraNeta * 365) / ing : 0
  const rotacionInventariosDias = costo > 0 ? (datos.inventarios * 365) / costo : 0
  const rotacionProveedoresDias = costo > 0 ? (datos.proveedores * 365) / costo : 0
  const cicloFinancieroDias = rotacionCarteraDias + rotacionInventariosDias - rotacionProveedoresDias

  const intereses = datos.intereses || 0
  const ebitdaIntereses = safe(ebitda, intereses)
  const pasivoFinancieroEbitda = safe(totalObligacionesFinancieras, ebitda)

  // Flujo de Caja Libre (requiere datos del ano anterior)
  let flujoCajaLibre = 0
  let servicioDeudaIntereses = intereses
  let servicioDeudaAmortizacion = safe(datos.obligacionesFinancierasLP, ANIOS_DEUDA_LP)
  let cambioEnDeuda = 0
  let cajaPeriodo = 0
  let fclSD = 0

  if (datosAnterior) {
    // Deltas del balance (ano anterior - ano actual)
    const deltaCartera = datosAnterior.carteraNeta - datos.carteraNeta
    const deltaInventarios = datosAnterior.inventarios - datos.inventarios
    const deltaAF = datosAnterior.activosFijosNetos - datos.activosFijosNetos
    const deltaProveedores = datos.proveedores - datosAnterior.proveedores
    flujoCajaLibre = ebitda + deltaCartera + deltaInventarios + deltaAF + deltaProveedores - datos.impuestos

    servicioDeudaIntereses = intereses
    servicioDeudaAmortizacion = safe(datos.obligacionesFinancierasLP, ANIOS_DEUDA_LP)
    const obligActual = datos.obligacionesFinancierasCP + datos.obligacionesFinancierasLP
    const obligAnterior = datosAnterior.obligacionesFinancierasCP + datosAnterior.obligacionesFinancierasLP
    cambioEnDeuda = obligActual - obligAnterior

    cajaPeriodo = flujoCajaLibre - servicioDeudaIntereses - servicioDeudaAmortizacion + cambioEnDeuda
    const totalServicioDeuda = servicioDeudaIntereses + servicioDeudaAmortizacion
    fclSD = totalServicioDeuda > 0 ? flujoCajaLibre / totalServicioDeuda : 0
  }

  // 2. Rentabilidad
  const crecimientoVentas = datosAnterior
    ? safe(ing - datosAnterior.ingresosOperacionales, datosAnterior.ingresosOperacionales)
    : 0
  const margenEbitda = safe(ebitda, ing)
  const margenNeto = safe(utilidadNeta, ing)

  // 3. Endeudamiento
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
    servicioDeudaIntereses,
    servicioDeudaAmortizacion,
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

// Semaforos segun rangos estandar Prestigio
export function semaforo(indicador: string, valor: number): SemaforoColor {
  switch (indicador) {
    case 'margenEbitda':
      if (valor >= 0.15) return 'verde'
      if (valor >= 0.05) return 'amarillo'
      return 'rojo'
    case 'margenNeto':
      if (valor >= 0.1) return 'verde'
      if (valor >= 0.02) return 'amarillo'
      return 'rojo'
    case 'crecimientoVentas':
      if (valor >= 0.1) return 'verde'
      if (valor >= 0) return 'amarillo'
      return 'rojo'
    case 'endeudamiento':
      if (valor <= 0.5) return 'verde'
      if (valor <= 0.7) return 'amarillo'
      return 'rojo'
    case 'endeudamientoFinanciero':
      if (valor <= 0.3) return 'verde'
      if (valor <= 0.5) return 'amarillo'
      return 'rojo'
    case 'palancaCrecimiento':
      if (valor > 1) return 'verde'
      if (valor > 0.5) return 'amarillo'
      return 'rojo'
    case 'ebitdaIntereses':
      if (valor >= 3) return 'verde'
      if (valor >= 1.5) return 'amarillo'
      return 'rojo'
    case 'cicloFinancieroDias':
      if (valor <= 60) return 'verde'
      if (valor <= 120) return 'amarillo'
      return 'rojo'
    case 'pasivoFinancieroEbitda':
      if (valor <= 2) return 'verde'
      if (valor <= 3.5) return 'amarillo'
      return 'rojo'
    case 'fclSD':
      if (valor >= 1.5) return 'verde'
      if (valor >= 1) return 'amarillo'
      return 'rojo'
    default:
      return 'verde'
  }
}

export function indicadoresConSemaforo(ind: IndicadoresAnio): IndicadorConSemaforo[] {
  return [
    // Rentabilidad
    {
      nombre: 'Margen EBITDA',
      valor: ind.margenEbitda,
      semaforo: semaforo('margenEbitda', ind.margenEbitda),
      descripcion: 'Que porcentaje de tus ventas se convierte en EBITDA',
      formato: 'porcentaje',
    },
    {
      nombre: 'Margen Neto',
      valor: ind.margenNeto,
      semaforo: semaforo('margenNeto', ind.margenNeto),
      descripcion: 'Utilidad neta por cada peso vendido',
      formato: 'porcentaje',
    },
    {
      nombre: 'Crecimiento en Ventas',
      valor: ind.crecimientoVentas,
      semaforo: semaforo('crecimientoVentas', ind.crecimientoVentas),
      descripcion: 'Crecimiento de ingresos vs ano anterior',
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
      nombre: 'Pasivo Financiero / EBITDA',
      valor: ind.pasivoFinancieroEbitda,
      semaforo: semaforo('pasivoFinancieroEbitda', ind.pasivoFinancieroEbitda),
      descripcion: 'Anos necesarios para pagar deuda financiera con EBITDA',
      formato: 'veces',
    },
    {
      nombre: 'Ciclo Financiero',
      valor: ind.cicloFinancieroDias,
      semaforo: semaforo('cicloFinancieroDias', ind.cicloFinancieroDias),
      descripcion: 'Dias que tardas en convertir inventario en caja',
      formato: 'dias',
    },
    // Endeudamiento
    {
      nombre: 'Endeudamiento',
      valor: ind.endeudamiento,
      semaforo: semaforo('endeudamiento', ind.endeudamiento),
      descripcion: '% de los activos financiados con deuda',
      formato: 'porcentaje',
    },
    {
      nombre: 'Endeudamiento Financiero',
      valor: ind.endeudamientoFinanciero,
      semaforo: semaforo('endeudamientoFinanciero', ind.endeudamientoFinanciero),
      descripcion: 'Peso de la deuda financiera sobre ingresos',
      formato: 'porcentaje',
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
      return `${Math.round(valor)} dias`
    case 'numero':
      return valor.toLocaleString('es-CO')
  }
}
