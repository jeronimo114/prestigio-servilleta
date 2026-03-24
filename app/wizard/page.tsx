'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWizardStore } from '@/lib/wizard-store'
import { ProgressBar } from '@/components/wizard/ProgressBar'
import { MascotaAI } from '@/components/asistente/MascotaAI'
import { StepBienvenida } from '@/components/wizard/steps/StepBienvenida'
import { StepEmpresa } from '@/components/wizard/steps/StepEmpresa'
import { StepPeriodos } from '@/components/wizard/steps/StepPeriodos'
import { StepIngresosAnterior } from '@/components/wizard/steps/StepIngresosAnterior'
import { StepCostosAnterior } from '@/components/wizard/steps/StepCostosAnterior'
import { StepGastosAnterior } from '@/components/wizard/steps/StepGastosAnterior'
import { StepBalanceActivosAnterior } from '@/components/wizard/steps/StepBalanceActivosAnterior'
import { StepBalancePasivosAnterior } from '@/components/wizard/steps/StepBalancePasivosAnterior'
import { StepIngresosActual } from '@/components/wizard/steps/StepIngresosActual'
import { StepCostosActual } from '@/components/wizard/steps/StepCostosActual'
import { StepGastosActual } from '@/components/wizard/steps/StepGastosActual'
import { StepBalanceActivosActual } from '@/components/wizard/steps/StepBalanceActivosActual'
import { StepBalancePasivosActual } from '@/components/wizard/steps/StepBalancePasivosActual'
import { StepConfirmacion } from '@/components/wizard/steps/StepConfirmacion'

const PASOS_INFO = [
  { titulo: 'Bienvenida', paso: 'Bienvenida', campo: 'inicio' },
  { titulo: 'Tu empresa', paso: 'Datos básicos', campo: 'nombre y empresa' },
  { titulo: 'Períodos', paso: 'Períodos', campo: 'años a analizar' },
  { titulo: `Ingresos año anterior`, paso: 'Estado de resultados', campo: 'Ingresos Operacionales' },
  { titulo: `Costos año anterior`, paso: 'Estado de resultados', campo: 'Utilidad Bruta' },
  { titulo: `Gastos año anterior`, paso: 'Estado de resultados', campo: 'EBITDA y gastos financieros' },
  { titulo: `Activos año anterior`, paso: 'Balance General', campo: 'Activos' },
  { titulo: `Pasivos año anterior`, paso: 'Balance General', campo: 'Pasivos y Patrimonio' },
  { titulo: `Ingresos año actual`, paso: 'Estado de resultados', campo: 'Ingresos Operacionales' },
  { titulo: `Costos año actual`, paso: 'Estado de resultados', campo: 'Utilidad Bruta' },
  { titulo: `Gastos año actual`, paso: 'Estado de resultados', campo: 'EBITDA y gastos financieros' },
  { titulo: `Activos año actual`, paso: 'Balance General', campo: 'Activos' },
  { titulo: `Pasivos año actual`, paso: 'Balance General', campo: 'Pasivos y Patrimonio' },
  { titulo: 'Resumen', paso: 'Confirmación', campo: 'revisar datos' },
]

const STEPS = [
  StepBienvenida,
  StepEmpresa,
  StepPeriodos,
  StepIngresosAnterior,
  StepCostosAnterior,
  StepGastosAnterior,
  StepBalanceActivosAnterior,
  StepBalancePasivosAnterior,
  StepIngresosActual,
  StepCostosActual,
  StepGastosActual,
  StepBalanceActivosActual,
  StepBalancePasivosActual,
  StepConfirmacion,
]

export default function WizardPage() {
  const { pasoActual, totalPasos, setPasoActual } = useWizardStore()
  const router = useRouter()

  const StepComponent = STEPS[pasoActual]
  const infoActual = PASOS_INFO[pasoActual]

  function anterior() {
    if (pasoActual > 0) setPasoActual(pasoActual - 1)
    else router.push('/')
  }

  function siguiente() {
    if (pasoActual < totalPasos - 1) setPasoActual(pasoActual + 1)
  }

  // Reemplaza el nombre del año en títulos de pasos
  const { anioAnterior, anioActual } = useWizardStore()

  const tituloPaso = infoActual.titulo
    .replace('año anterior', String(anioAnterior))
    .replace('año actual', String(anioActual))

  const totalPasosVisibles = STEPS.length - 1 // no contar bienvenida en el progreso
  const pasoVisible = pasoActual

  return (
    <div className="min-h-screen bg-gris-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gris-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={anterior}
              className="flex items-center gap-1 text-gris-600 hover:text-prestigio-900 text-sm transition-colors"
            >
              <ChevronLeft size={16} />
              {pasoActual === 0 ? 'Inicio' : 'Anterior'}
            </button>
            <div className="flex-1" />
            <span className="text-xs text-gris-600 tracking-wide font-medium">Prestigio</span>
          </div>
          {pasoActual > 0 && (
            <ProgressBar paso={pasoActual} total={totalPasosVisibles} titulo={tituloPaso} />
          )}
        </div>
      </header>

      {/* Step content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={pasoActual}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <StepComponent onNext={siguiente} onPrev={anterior} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      {pasoActual > 0 && pasoActual < STEPS.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gris-200 px-4 py-4 z-30">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={anterior}
              className="flex-1 border-2 border-gris-300 text-gris-600 font-semibold py-3 rounded-xl hover:border-gris-400 hover:bg-gris-50 transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={siguiente}
              className="flex-2 flex-[2] bg-prestigio-900 hover:bg-prestigio-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-prestigio-200 flex items-center justify-center gap-2"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Mascota */}
      {pasoActual > 0 && (
        <MascotaAI paso={infoActual.paso} campo={infoActual.campo} />
      )}
    </div>
  )
}
