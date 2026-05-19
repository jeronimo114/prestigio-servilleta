'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DatosAnio } from '@/types/servilleta'

// Datos vacíos — el usuario rellena su propia información
const DATOS_VACIOS: DatosAnio = {
  ingresosOperacionales: 0,
  costosTotales: 0,
  gastosTotales: 0,
  depreciaciones: 0,
  amortizaciones: 0,
  depreciacionesAmortizaciones: 0,
  utilidadBruta: 0,
  ebitda: 0,
  utilidadOperacional: 0,
  intereses: 0,
  amortizacionDeuda: 0,
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
  dividendos: 0,
  capitalizacion: 0,
}

export interface WizardState {
  nombre: string
  cedula: string
  empresa: string
  email: string
  sector: string
  anioAnterior: number
  anioActual: number
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio
  pasoActual: number
  totalPasos: number
  sessionId: string | null

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
  const utilidadBruta = (datos.ingresosOperacionales || 0) - (datos.costosTotales || 0)
  const utilidadOperacional = utilidadBruta - (datos.gastosTotales || 0)
  const depAmort = (datos.depreciaciones || 0) + (datos.amortizaciones || 0)
  const ebitda = utilidadOperacional + depAmort
  return { ...datos, utilidadBruta, utilidadOperacional, ebitda, depreciacionesAmortizaciones: depAmort }
}

const anioActualReal = new Date().getFullYear()

const ESTADO_INICIAL = {
  nombre: '',
  cedula: '',
  empresa: '',
  email: '',
  sector: '',
  anioAnterior: anioActualReal - 1,
  anioActual: anioActualReal,
  datosAnioAnterior: { ...DATOS_VACIOS },
  datosAnioActual: { ...DATOS_VACIOS },
  pasoActual: 0,
  totalPasos: 3,
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
        datosAnioAnterior: { ...DATOS_VACIOS },
        datosAnioActual: { ...DATOS_VACIOS },
      }),
    }),
    {
      name: 'servilleta-wizard',
      version: 5,
      migrate: () => {
        // v5: estado inicial vacío — el usuario rellena su propia info
        return {
          ...ESTADO_INICIAL,
          datosAnioAnterior: { ...DATOS_VACIOS },
          datosAnioActual: { ...DATOS_VACIOS },
        }
      },
    }
  )
)
