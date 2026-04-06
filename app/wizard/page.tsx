'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useWizardStore } from '@/lib/wizard-store'
import { ProgressBar } from '@/components/wizard/ProgressBar'
import { MascotaAI } from '@/components/asistente/MascotaAI'
import { StepBienvenida } from '@/components/wizard/steps/StepBienvenida'
import { StepEmpresa } from '@/components/wizard/steps/StepEmpresa'
import { ServilletaView } from '@/components/servilleta/ServilletaView'
import { StepConfirmacion } from '@/components/wizard/steps/StepConfirmacion'

const PASOS_INFO = [
  { titulo: 'Bienvenida', paso: 'Bienvenida', campo: 'inicio' },
  { titulo: 'Tu empresa', paso: 'Datos basicos', campo: 'nombre y empresa' },
  { titulo: 'Servilleta', paso: 'Servilleta', campo: 'datos financieros' },
  { titulo: 'Resumen', paso: 'Confirmacion', campo: 'revisar datos' },
]

const STEPS = [
  StepBienvenida,
  StepEmpresa,
  ServilletaView,
  StepConfirmacion,
]

export default function WizardPage() {
  const { pasoActual, setPasoActual } = useWizardStore()
  const totalPasos = STEPS.length
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

  const totalPasosVisibles = STEPS.length - 1 // no contar bienvenida
  const tituloPaso = infoActual.titulo

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
      <main className={`max-w-2xl mx-auto px-4 py-8 ${pasoActual === 2 ? 'pb-8' : 'pb-32'}`}>
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

      {/* Bottom nav - only for steps 1 (empresa), not for servilleta (has own buttons) */}
      {pasoActual === 1 && (
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
              className="flex-[2] bg-prestigio-900 hover:bg-prestigio-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-prestigio-200 flex items-center justify-center gap-2"
            >
              Continuar
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
