'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DatosAnio } from '@/types/servilleta'

// Datos pre-llenados realistas: empresa ficticia "Delicias del Valle"
// Cadena de restaurantes mediana en Colombia, sector Gastronomía
const DATOS_ANTERIORES_PREFILL: DatosAnio = {
  // Estado de Resultados 2024 (en millones COP)
  ingresosOperacionales: 4850,
  utilidadBruta: 2185,
  ebitda: 825,
  utilidadOperacional: 680,
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
}

const DATOS_ACTUALES_PREFILL: DatosAnio = {
  // Estado de Resultados 2025 (en millones COP)
  ingresosOperacionales: 5620,
  utilidadBruta: 2640,
  ebitda: 1015,
  utilidadOperacional: 845,
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
}

export interface WizardState {
  // Datos básicos
  nombre: string
  empresa: string
  email: string
  sector: string
  anioAnterior: number
  anioActual: number

  // Datos por año
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio

  // Control del wizard
  pasoActual: number
  totalPasos: number
  sessionId: string | null

  // Acciones
  setNombre: (v: string) => void
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

const ESTADO_INICIAL = {
  nombre: 'Carolina Mejía Restrepo',
  empresa: 'Delicias del Valle S.A.S.',
  email: 'carolina.mejia@deliciasdelvalle.co',
  sector: 'Gastronomía',
  anioAnterior: 2024,
  anioActual: 2025,
  datosAnioAnterior: { ...DATOS_ANTERIORES_PREFILL },
  datosAnioActual: { ...DATOS_ACTUALES_PREFILL },
  pasoActual: 0,
  totalPasos: 14,
  sessionId: null,
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...ESTADO_INICIAL,

      setNombre: (v) => set({ nombre: v }),
      setEmpresa: (v) => set({ empresa: v }),
      setEmail: (v) => set({ email: v }),
      setSector: (v) => set({ sector: v }),
      setAnioAnterior: (v) => set({ anioAnterior: v }),
      setAnioActual: (v) => set({ anioActual: v }),

      updateDatosAnterior: (campo, valor) =>
        set((state) => ({
          datosAnioAnterior: { ...state.datosAnioAnterior, [campo]: valor },
        })),

      updateDatosActual: (campo, valor) =>
        set((state) => ({
          datosAnioActual: { ...state.datosAnioActual, [campo]: valor },
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
