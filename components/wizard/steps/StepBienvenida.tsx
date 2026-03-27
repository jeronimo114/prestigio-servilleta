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
        className="mb-4 flex justify-center"
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="#003a4b" strokeWidth="3" />
          <circle cx="40" cy="40" r="28" stroke="#00727e" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="18" stroke="#00a8c4" strokeWidth="2" />
          <circle cx="40" cy="40" r="8" fill="#003a4b" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="inline-block bg-prestigio-50 text-prestigio-900 text-sm font-semibold px-4 py-1.5 rounded-full">
          Prestigio
        </div>
        <h1 className="text-3xl font-bold text-prestigio-900 leading-tight">
          Servilleta<br />
          <span className="text-prestigio-500">Financiera</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          En pocos minutos vamos a construir juntos el diagnostico financiero de tu empresa, paso a paso.
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
          { icon: (
            <svg className="w-7 h-7 text-prestigio-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM9 9h2v12H9zM15 5h2v16h-2zM21 1h2v20h-2z" />
            </svg>
          ), texto: 'Indicadores automaticos' },
          { icon: (
            <svg className="w-7 h-7 text-prestigio-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M5 14.5l-1.43 1.43a2.25 2.25 0 0 0 1.59 3.84h13.68a2.25 2.25 0 0 0 1.59-3.84L19 14.5" />
            </svg>
          ), texto: 'Asistente con IA' },
          { icon: (
            <svg className="w-7 h-7 text-prestigio-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          ), texto: 'Descarga tu Excel' },
        ].map((item) => (
          <div key={item.texto} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="mb-1">{item.icon}</div>
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
        className="w-full max-w-sm mx-auto block bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-prestigio-200 transition-all"
      >
        Comenzar →
      </motion.button>

      <p className="text-xs text-gray-400">
        Tus datos estan seguros y solo los usamos para generar tu diagnostico.
      </p>
    </div>
  )
}
