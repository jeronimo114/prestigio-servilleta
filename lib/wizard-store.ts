'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DatosAnio } from '@/types/servilleta'

const ANIO_VACIO: DatosAnio = {
  ingresosOperacionales: 0,
  utilidadBruta: 0,
  ebitda: 0,
  utilidadOperacional: 0,
  intereses: 0,
  impuestos: 0,
  otrosIngresosEgresos: 0,
  carteraNeta: 0,
  inventarios: 0,
  activosFijosNetos: 0,
  otrosActivos: 0,
  obligacionesFinancierasCP: 0,
  obligacionesFinancierasLP: 0,
  proveedores: 0,
  otrosPasivos: 0,
  capitalSuperavit: 0,
  totalPatrimonio: 0,
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
  nombre: '',
  empresa: '',
  email: '',
  sector: '',
  anioAnterior: new Date().getFullYear() - 2,
  anioActual: new Date().getFullYear() - 1,
  datosAnioAnterior: { ...ANIO_VACIO },
  datosAnioActual: { ...ANIO_VACIO },
  pasoActual: 0,
  totalPasos: 13,
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

      reset: () => set({ ...ESTADO_INICIAL, datosAnioAnterior: { ...ANIO_VACIO }, datosAnioActual: { ...ANIO_VACIO } }),
    }),
    {
      name: 'servilleta-wizard',
    }
  )
)
