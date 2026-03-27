// Datos ingresados por el usuario para UN año
export interface DatosAnio {
  // Estado de Resultados
  ingresosOperacionales: number
  utilidadBruta: number
  ebitda: number
  utilidadOperacional: number
  intereses: number
  impuestos: number
  otrosIngresosEgresos: number
  // Calculado: utilidadNeta = utilidadOperacional - intereses - impuestos + otrosIngresosEgresos

  // Balance General
  carteraNeta: number
  inventarios: number
  activosFijosNetos: number
  otrosActivos: number
  // Calculado: totalActivos

  obligacionesFinancierasCP: number
  obligacionesFinancierasLP: number
  // Calculado: totalObligacionesFinancieras

  proveedores: number
  otrosPasivos: number
  // Calculado: totalPasivos

  capitalSuperavit: number
  totalPatrimonio: number
}

export interface DatosEmpresa {
  nombre: string
  cedula: string
  empresa: string
  email: string
  sector: string
  anioAnterior: number  // ej: 2022
  anioActual: number    // ej: 2023
  anioProyectado: number // ej: 2024
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
  rotacionCarteraDias: number          // Cartera × 365 / Ingresos
  rotacionInventariosDias: number      // Inventarios × 365 / Costo (Ing - Ut.Bruta)
  rotacionProveedoresDias: number      // Proveedores × 365 / Costo (Ing - Ut.Bruta)
  cicloFinancieroDias: number          // RotCartera + RotInv - RotProv
  ebitdaIntereses: number              // EBITDA / Intereses
  pasivoFinancieroEbitda: number       // Total Oblig Fcieras / EBITDA (años)

  // Flujo de Caja Libre (requiere datos del año anterior)
  flujoCajaLibre: number               // EBITDA + deltas(Cartera,Inv,AF,Prov) - Impuestos
  servicioDeudaIntereses: number       // Intereses del período
  servicioDeudaAmortizacion: number    // Oblig LP / Años deuda LP
  cambioEnDeuda: number                // Oblig Fcieras actual - anterior
  cajaPeriodo: number                  // FCL - Intereses - Amortización + Cambio deuda
  fclSD: number                        // FCL / (Intereses + Amortización)

  // 2. Rentabilidad
  crecimientoVentas: number            // % vs año anterior
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

// Wizard step IDs
export type WizardStep =
  | 'bienvenida'
  | 'empresa'
  | 'periodos'
  | 'ingresos-anterior'
  | 'costos-anterior'
  | 'gastos-anterior'
  | 'balance-activos-anterior'
  | 'balance-pasivos-anterior'
  | 'ingresos-actual'
  | 'costos-actual'
  | 'gastos-actual'
  | 'balance-activos-actual'
  | 'balance-pasivos-actual'
  | 'confirmacion'
