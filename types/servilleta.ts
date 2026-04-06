// Datos ingresados por el usuario para UN año
export interface DatosAnio {
  // Estado de Resultados — inputs del usuario
  ingresosOperacionales: number
  costosTotales: number              // Costos de ventas / producción
  gastosTotales: number              // Gastos operacionales (admin + ventas)
  depreciacionesAmortizaciones: number // Si no tiene, pone 0

  // Calculados del P&G (no los llena el usuario)
  utilidadBruta: number              // = ingresos - costos
  ebitda: number                     // = utilidadOperacional + dep&amort
  utilidadOperacional: number        // = ingresos - costos - gastos
  intereses: number                  // Parte del servicio de la deuda
  impuestos: number
  otrosIngresosEgresos: number

  // Balance General — solo cartera, inventarios, activos fijos, proveedores
  carteraNeta: number
  inventarios: number
  activosFijosNetos: number
  otrosActivos: number

  obligacionesFinancierasCP: number
  obligacionesFinancierasLP: number

  proveedores: number
  otrosPasivos: number

  capitalSuperavit: number
  totalPatrimonio: number

  // Servilleta: campos adicionales para flujo de caja
  servicioDeuda: number              // Intereses + abono a capital
  dividendos: number                 // Dividendos / capitalización
}

export interface DatosEmpresa {
  nombre: string
  cedula: string
  empresa: string
  email: string
  sector: string
  anioAnterior: number  // ej: 2024
  anioActual: number    // ej: 2025
  anioProyectado: number // ej: 2026
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio
}

export interface IndicadoresAnio {
  // Calculados
  utilidadNeta: number
  totalActivos: number
  totalObligacionesFinancieras: number
  totalPasivos: number

  // 1. Liquidez
  ktno: number                         // Cartera + Inventarios - Proveedores
  rotacionCarteraDias: number          // Cartera x 365 / Ingresos
  rotacionInventariosDias: number      // Inventarios x 365 / Costo
  rotacionProveedoresDias: number      // Proveedores x 365 / Costo
  cicloFinancieroDias: number          // RotCartera + RotInv - RotProv
  ebitdaIntereses: number              // EBITDA / Intereses
  pasivoFinancieroEbitda: number       // Total Oblig Fcieras / EBITDA (anos)

  // Flujo de Caja Libre (requiere datos del ano anterior)
  flujoCajaLibre: number               // EBITDA + deltas(Cartera,Inv,AF,Prov) - Impuestos
  servicioDeudaIntereses: number       // Intereses del periodo
  servicioDeudaAmortizacion: number    // Oblig LP / Anos deuda LP
  cambioEnDeuda: number                // Oblig Fcieras actual - anterior
  cajaPeriodo: number                  // FCL - Intereses - Amortizacion + Cambio deuda
  fclSD: number                        // FCL / (Intereses + Amortizacion)

  // 2. Rentabilidad
  crecimientoVentas: number            // % vs ano anterior
  margenEbitda: number                 // EBITDA / Ingresos
  margenNeto: number                   // Utilidad Neta / Ingresos

  // 3. Endeudamiento
  endeudamiento: number                // Total Pasivos / Total Activos
  endeudamientoFinanciero: number      // Total Oblig Fcieras / Ingresos

  // 4. Palanca de Crecimiento
  palancaCrecimiento: number           // EBITDA / KTNO
}

export interface ResultadosServilleta {
  empresa: DatosEmpresa
  indicadoresAnterior: IndicadoresAnio
  indicadoresActual: IndicadoresAnio
  variacionHorizontal: Partial<Record<keyof DatosAnio, number>>
}

export type SemaforoColor = 'verde' | 'amarillo' | 'rojo'

export interface IndicadorConSemaforo {
  nombre: string
  valor: number
  semaforo: SemaforoColor
  descripcion: string
  formato: 'porcentaje' | 'numero' | 'dias' | 'veces'
}

// Wizard step IDs (simplificado: bienvenida → empresa → servilleta → confirmacion)
export type WizardStep =
  | 'bienvenida'
  | 'empresa'
  | 'servilleta'
  | 'confirmacion'
