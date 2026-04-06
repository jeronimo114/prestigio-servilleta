'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useWizardStore } from '@/lib/wizard-store'
import { ProgressBar } from '@/components/wizard/ProgressBar'
import { MascotaAI } from '@/components/asistente/MascotaAI'
import { StepEmpresa } from '@/components/wizard/steps/StepEmpresa'
import { ServilletaView } from '@/components/servilleta/ServilletaView'
import { StepConfirmacion } from '@/components/wizard/steps/StepConfirmacion'

const PASOS_INFO = [
  { titulo: 'Tu empresa', paso: 'Datos básicos', campo: 'nombre y empresa' },
  { titulo: 'Servilleta', paso: 'Servilleta', campo: 'datos financieros' },
  { titulo: 'Resumen', paso: 'Confirmación', campo: 'revisar datos' },
]

const STEPS = [
  StepEmpresa,
  ServilletaView,
  StepConfirmacion,
]

export default function WizardPage() {
  const { pasoActual, setPasoActual } = useWizardStore()
  const totalPasos = STEPS.length
  const router = useRouter()

  // Guard: si el pasoActual quedó fuera de rango (localStorage viejo), resetear
  const pasoSeguro = pasoActual >= totalPasos ? 0 : pasoActual
  if (pasoSeguro !== pasoActual) setPasoActual(pasoSeguro)

  const StepComponent = STEPS[pasoSeguro]
  const infoActual = PASOS_INFO[pasoSeguro]

  function anterior() {
    if (pasoSeguro > 0) setPasoActual(pasoSeguro - 1)
    else router.push('/')
  }

  function siguiente() {
    if (pasoSeguro < totalPasos - 1) setPasoActual(pasoSeguro + 1)
  }

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
              {pasoSeguro === 0 ? 'Inicio' : 'Anterior'}
            </button>
            <div className="flex-1" />
            <span className="text-xs text-gris-600 tracking-wide font-medium">Prestigio</span>
          </div>
          <ProgressBar paso={pasoSeguro + 1} total={totalPasos} titulo={infoActual.titulo} />
        </div>
      </header>

      {/* Step content */}
      <main className={`max-w-2xl mx-auto px-4 py-8 ${pasoSeguro === 1 ? 'pb-8' : 'pb-32'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pasoSeguro}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <StepComponent onNext={siguiente} onPrev={anterior} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mascota IA */}
      <MascotaAI paso={infoActual.paso} campo={infoActual.campo} />
    </div>
  )
}
