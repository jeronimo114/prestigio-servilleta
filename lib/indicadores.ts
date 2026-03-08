import type { DatosAnio, DatosEmpresa, IndicadoresAnio, IndicadorConSemaforo, SemaforoColor } from '@/types/servilleta'

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

export function calcularIndicadores(
  datos: DatosAnio,
  ingresosAnterior?: number
): IndicadoresAnio {
  const derivados = calcularDerivedosAnio(datos)
  const { utilidadNeta, totalActivos, totalObligacionesFinancieras, totalPasivos } = derivados

  const ing = datos.ingresosOperacionales

  const ktno = datos.carteraNeta + datos.inventarios - datos.proveedores
  const rotacionCarteraDias = ing > 0 ? (datos.carteraNeta * 365) / ing : 0
  const rotacionInventariosDias = ing > 0 ? (datos.inventarios * 365) / ing : 0
  const rotacionProveedoresDias = ing > 0 ? (datos.proveedores * 365) / ing : 0
  const cicloFinancieroDias = rotacionCarteraDias + rotacionInventariosDias - rotacionProveedoresDias

  const ebitdaIntereses = safe(datos.ebitda, datos.intereses)
  const pasivoFinancieroEbitda = safe(totalObligacionesFinancieras, datos.ebitda)

  const crecimientoVentas = ingresosAnterior
    ? safe(ing - ingresosAnterior, ingresosAnterior)
    : 0
  const margenEbitda = safe(datos.ebitda, ing)
  const margenNeto = safe(utilidadNeta, ing)

  const endeudamiento = safe(totalPasivos, totalActivos)
  const endeudamientoFinanciero = safe(totalObligacionesFinancieras, totalActivos)

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
    crecimientoVentas,
    margenEbitda,
    margenNeto,
    endeudamiento,
    endeudamientoFinanciero,
    palancaCrecimiento,
  }
}

// Semáforos según rangos estándar PAE/Bancolombia
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
    default:
      return 'verde'
  }
}

export function indicadoresConSemaforo(ind: IndicadoresAnio): IndicadorConSemaforo[] {
  return [
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
      descripcion: 'Peso de la deuda financiera sobre activos',
      formato: 'porcentaje',
    },
    {
      nombre: 'Palanca de Crecimiento',
      valor: ind.palancaCrecimiento,
      semaforo: semaforo('palancaCrecimiento', ind.palancaCrecimiento),
      descripcion: 'EBITDA/KTNO — >1 significa que generas caja al crecer',
      formato: 'veces',
    },
    {
      nombre: 'EBITDA / Intereses',
      valor: ind.ebitdaIntereses,
      semaforo: semaforo('ebitdaIntereses', ind.ebitdaIntereses),
      descripcion: 'Capacidad de pagar intereses con EBITDA',
      formato: 'veces',
    },
    {
      nombre: 'Ciclo Financiero',
      valor: ind.cicloFinancieroDias,
      semaforo: semaforo('cicloFinancieroDias', ind.cicloFinancieroDias),
      descripcion: 'Días que tardas en convertir inventario en caja',
      formato: 'dias',
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
