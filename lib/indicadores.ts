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
  const utilidadNeta =
    datos.utilidadOperacional - datos.intereses - datos.impuestos + datos.otrosIngresosEgresos
  const totalActivos =
    datos.carteraNeta + datos.inventarios + datos.activosFijosNetos + datos.otrosActivos
  const totalObligacionesFinancieras =
    datos.obligacionesFinancierasCP + datos.obligacionesFinancierasLP
  const totalPasivos =
    totalObligacionesFinancieras + datos.proveedores + datos.otrosPasivos

  return { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos }
}

// Años de deuda LP (mismo default que el Excel, celda H54)
const ANIOS_DEUDA_LP = 2

export function calcularIndicadores(
  datos: DatosAnio,
  datosAnterior?: DatosAnio
): IndicadoresAnio {
  const derivados = calcularDerivedosAnio(datos)
  const { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos } = derivados

  const ing = datos.ingresosOperacionales
  // Costo de ventas = Ingresos - Utilidad Bruta (usado en rotaciones, igual que el Excel)
  const costo = ing - datos.utilidadBruta

  // 1. Liquidez
  const ktno = datos.carteraNeta + datos.inventarios - datos.proveedores
  // Excel: +(H16/((H7/H58)*12))*365 = cartera * 365 / ingresos
  const rotacionCarteraDias = ing > 0 ? (datos.carteraNeta * 365) / ing : 0
  // Excel: +(H17/(((H7-H8)/H58)*12))*365 = inventarios * 365 / costo
  const rotacionInventariosDias = costo > 0 ? (datos.inventarios * 365) / costo : 0
  // Excel: +(H24/(((H7-H8)/H58)*12))*365 = proveedores * 365 / costo
  const rotacionProveedoresDias = costo > 0 ? (datos.proveedores * 365) / costo : 0
  const cicloFinancieroDias = rotacionCarteraDias + rotacionInventariosDias - rotacionProveedoresDias

  // Excel: H9/H11 = EBITDA / Intereses
  const ebitdaIntereses = safe(datos.ebitda, datos.intereses)
  // Excel: H23/H9 = Total Oblig Fcieras / EBITDA (años para pagar deuda)
  const pasivoFinancieroEbitda = safe(totalObligacionesFinancieras, datos.ebitda)

  // Flujo de Caja Libre (requiere datos del año anterior)
  let flujoCajaLibre = 0
  let servicioDeudaIntereses = datos.intereses
  let servicioDeudaAmortizacion = safe(datos.obligacionesFinancierasLP, ANIOS_DEUDA_LP)
  let cambioEnDeuda = 0
  let cajaPeriodo = 0
  let fclSD = 0

  if (datosAnterior) {
    // Excel K29: =K9+K16+K17+K18+K24-K12
    // K9=EBITDA, K16=delta cartera (ant-act), K17=delta inv (ant-act),
    // K18=delta AF (ant-act), K24=delta prov (act-ant), K12=impuestos
    const deltaCartera = datosAnterior.carteraNeta - datos.carteraNeta
    const deltaInventarios = datosAnterior.inventarios - datos.inventarios
    const deltaAF = datosAnterior.activosFijosNetos - datos.activosFijosNetos
    const deltaProveedores = datos.proveedores - datosAnterior.proveedores
    flujoCajaLibre = datos.ebitda + deltaCartera + deltaInventarios + deltaAF + deltaProveedores - datos.impuestos

    // Excel K30: intereses del período
    servicioDeudaIntereses = datos.intereses
    // Excel K31: H22/H54 = ObligLP / AñosDeudaLP
    servicioDeudaAmortizacion = safe(datos.obligacionesFinancierasLP, ANIOS_DEUDA_LP)
    // Excel K32: H23-F23 = Oblig Fcieras actual - anterior
    const obligActual = datos.obligacionesFinancierasCP + datos.obligacionesFinancierasLP
    const obligAnterior = datosAnterior.obligacionesFinancierasCP + datosAnterior.obligacionesFinancierasLP
    cambioEnDeuda = obligActual - obligAnterior

    // Excel K33: =K29-K30-K31+K32
    cajaPeriodo = flujoCajaLibre - servicioDeudaIntereses - servicioDeudaAmortizacion + cambioEnDeuda
    // Excel K34: =K29/(K30+K31)
    const totalServicioDeuda = servicioDeudaIntereses + servicioDeudaAmortizacion
    fclSD = totalServicioDeuda > 0 ? flujoCajaLibre / totalServicioDeuda : 0
  }

  // 2. Rentabilidad
  // Excel: (H7-F7)/F7 = (ingActual - ingAnterior) / ingAnterior
  const crecimientoVentas = datosAnterior
    ? safe(ing - datosAnterior.ingresosOperacionales, datosAnterior.ingresosOperacionales)
    : 0
  // Excel: H9/H7
  const margenEbitda = safe(datos.ebitda, ing)
  // Excel: H14/H7
  const margenNeto = safe(utilidadNeta, ing)

  // 3. Endeudamiento
  // Excel: H26/H20 = Total Pasivos / Total Activos
  const endeudamiento = safe(totalPasivos, totalActivos)
  // Excel: H23/H7 = Total Oblig Fcieras / Ingresos
  const endeudamientoFinanciero = safe(totalObligacionesFinancieras, ing)

  // 4. Palanca de Crecimiento
  // Excel: H9/K40 where K40=KTNO = EBITDA / KTNO
  const palancaCrecimiento = ktno !== 0 ? safe(datos.ebitda, ktno) : 0

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

// Semáforos según rangos estándar Prestigio
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
      descripcion: 'Qué porcentaje de tus ventas se convierte en EBITDA',
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
      nombre: 'Pasivo Financiero / EBITDA',
      valor: ind.pasivoFinancieroEbitda,
      semaforo: semaforo('pasivoFinancieroEbitda', ind.pasivoFinancieroEbitda),
      descripcion: 'Años necesarios para pagar deuda financiera con EBITDA',
      formato: 'veces',
    },
    {
      nombre: 'Ciclo Financiero',
      valor: ind.cicloFinancieroDias,
      semaforo: semaforo('cicloFinancieroDias', ind.cicloFinancieroDias),
      descripcion: 'Días que tardas en convertir inventario en caja',
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
      return `${Math.round(valor)} días`
    case 'numero':
      return valor.toLocaleString('es-CO')
  }
}
