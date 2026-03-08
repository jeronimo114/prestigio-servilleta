'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Props {
  onNext: () => void
  onPrev: () => void
}

export function StepBienvenida({ onNext }: Props) {
  const router = useRouter()

  return (
    <div className="text-center py-8 space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-8xl mb-4"
      >
        🐦
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          PAE × Bancolombia
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Tu Servilleta<br />
          <span className="text-blue-600">Financiera</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          En 10 minutos vamos a construir juntos el diagnóstico financiero de tu empresa, paso a paso.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
      >
        {[
          { emoji: '📊', texto: 'Indicadores automáticos' },
          { emoji: '🤖', texto: 'Asistente con IA' },
          { emoji: '📥', texto: 'Descarga tu Excel' },
        ].map((item) => (
          <div key={item.texto} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl mb-1">{item.emoji}</div>
            <p className="text-xs text-gray-600 font-medium leading-tight">{item.texto}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-sm mx-auto block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-blue-200 transition-all"
      >
        Comenzar →
      </motion.button>

      <p className="text-xs text-gray-400">
        Tus datos están seguros y solo los usamos para generar tu diagnóstico.
      </p>
    </div>
  )
}
