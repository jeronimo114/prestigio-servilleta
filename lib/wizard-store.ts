'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DatosAnio } from '@/types/servilleta'

// Datos pre-llenados realistas: empresa ficticia "Delicias del Valle"
// Cadena de restaurantes mediana en Colombia, sector Gastronomia
const DATOS_ANTERIORES_PREFILL: DatosAnio = {
  // Estado de Resultados 2024 (en millones COP)
  ingresosOperacionales: 4850,
  costosTotales: 2665,             // Ingresos - Utilidad Bruta = 4850 - 2185
  gastosTotales: 1505,             // Utilidad Bruta - Utilidad Op = 2185 - 680
  depreciacionesAmortizaciones: 145, // EBITDA - Utilidad Op = 825 - 680
  utilidadBruta: 2185,             // calculado: 4850 - 2665
  ebitda: 825,                     // calculado: 680 + 145
  utilidadOperacional: 680,        // calculado: 4850 - 2665 - 1505
  intereses: 145,
  impuestos: 178,
  otrosIngresosEgresos: 32,
  // Balance General 2024 - Activos
  carteraNeta: 290,
  inventarios: 385,
  activosFijosNetos: 1620,
  otrosActivos: 510,
  // Balance General 2024 - Pasivos
  obligacionesFinancierasCP: 320,
  obligacionesFinancierasLP: 780,
  proveedores: 415,
  otrosPasivos: 290,
  capitalSuperavit: 650,
  totalPatrimonio: 1000,
  // Servilleta
  servicioDeuda: 535,              // intereses 145 + amortizacion (780/2=390)
  dividendos: 0,
}

const DATOS_ACTUALES_PREFILL: DatosAnio = {
  // Estado de Resultados 2025 (en millones COP)
  ingresosOperacionales: 5620,
  costosTotales: 2980,             // 5620 - 2640
  gastosTotales: 1795,             // 2640 - 845
  depreciacionesAmortizaciones: 170, // 1015 - 845
  utilidadBruta: 2640,             // calculado: 5620 - 2980
  ebitda: 1015,                    // calculado: 845 + 170
  utilidadOperacional: 845,        // calculado: 5620 - 2980 - 1795
  intereses: 132,
  impuestos: 225,
  otrosIngresosEgresos: 18,
  // Balance General 2025 - Activos
  carteraNeta: 340,
  inventarios: 420,
  activosFijosNetos: 1850,
  otrosActivos: 590,
  // Balance General 2025 - Pasivos
  obligacionesFinancierasCP: 280,
  obligacionesFinancierasLP: 710,
  proveedores: 480,
  otrosPasivos: 315,
  capitalSuperavit: 750,
  totalPatrimonio: 1465,
  // Servilleta
  servicioDeuda: 487,              // intereses 132 + amortizacion (710/2=355)
  dividendos: 50,
}

export interface WizardState {
  // Datos basicos
  nombre: string
  cedula: string
  empresa: string
  email: string
  sector: string
  anioAnterior: number
  anioActual: number

  // Datos por ano
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio

  // Control del wizard
  pasoActual: number
  totalPasos: number
  sessionId: string | null

  // Acciones
  setNombre: (v: string) => void
  setCedula: (v: string) => void
  setEmpresa: (v: string) => void
  setEmail: (v: string) => void
  setSector: (v: string) => void
  setAnioAnterior: (v: number) => void
  setAnioActual: (v: number) => void
  updateDatosAnterior: (campo: keyof DatosAnio, valor: number) => void
  updateDatosActual: (campo: keyof DatosAnio, valor: number) => void
  setPasoActual: (paso: number) => void
  setSessionId: (id: string) => void
  reset: () => void
}

// Recalcula los campos derivados del P&G a partir de los inputs
function recalcularDerivados(datos: DatosAnio): DatosAnio {
  const utilidadBruta = datos.ingresosOperacionales - datos.costosTotales
  const utilidadOperacional = utilidadBruta - datos.gastosTotales
  const ebitda = utilidadOperacional + datos.depreciacionesAmortizaciones
  return { ...datos, utilidadBruta, utilidadOperacional, ebitda }
}

const ESTADO_INICIAL = {
  nombre: 'Carolina Mejia Restrepo',
  cedula: '1017234567',
  empresa: 'Delicias del Valle S.A.S.',
  email: 'carolina.mejia@deliciasdelvalle.co',
  sector: 'Gastronomia',
  anioAnterior: 2024,
  anioActual: 2025,
  datosAnioAnterior: { ...DATOS_ANTERIORES_PREFILL },
  datosAnioActual: { ...DATOS_ACTUALES_PREFILL },
  pasoActual: 0,
  totalPasos: 4,
  sessionId: null,
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...ESTADO_INICIAL,

      setNombre: (v) => set({ nombre: v }),
      setCedula: (v) => set({ cedula: v }),
      setEmpresa: (v) => set({ empresa: v }),
      setEmail: (v) => set({ email: v }),
      setSector: (v) => set({ sector: v }),
      setAnioAnterior: (v) => set({ anioAnterior: v }),
      setAnioActual: (v) => set({ anioActual: v }),

      updateDatosAnterior: (campo, valor) =>
        set((state) => ({
          datosAnioAnterior: recalcularDerivados({ ...state.datosAnioAnterior, [campo]: valor }),
        })),

      updateDatosActual: (campo, valor) =>
        set((state) => ({
          datosAnioActual: recalcularDerivados({ ...state.datosAnioActual, [campo]: valor }),
        })),

      setPasoActual: (paso) => set({ pasoActual: paso }),
      setSessionId: (id) => set({ sessionId: id }),

      reset: () => set({
        ...ESTADO_INICIAL,
        datosAnioAnterior: { ...DATOS_ANTERIORES_PREFILL },
        datosAnioActual: { ...DATOS_ACTUALES_PREFILL },
      }),
    }),
    {
      name: 'servilleta-wizard',
    }
  )
)
