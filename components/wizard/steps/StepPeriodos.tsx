'use client'

import { useWizardStore } from '@/lib/wizard-store'

interface Props {
  onNext: () => void
  onPrev: () => void
}

export function StepPeriodos({ onNext }: Props) {
  const { anioAnterior, anioActual, setAnioAnterior, setAnioActual } = useWizardStore()

  const anioActualReal = new Date().getFullYear()
  const aniosDisponibles = Array.from({ length: 8 }, (_, i) => anioActualReal - i)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">¿Qué años vamos a analizar?</h2>
        <p className="text-gray-500">
          La servilleta compara dos períodos para ver la evolución de tu empresa
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-sm text-blue-700">
          💡 Normalmente se usan los dos últimos años contables. Si tu empresa tiene menos de 2 años,
          puedes usar el mismo año en ambos campos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Año anterior (histórico 1)
          </label>
          <select
            value={anioAnterior}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              setAnioAnterior(val)
              if (anioActual <= val) setAnioActual(val + 1)
            }}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors bg-white"
          >
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Año actual (histórico 2)
          </label>
          <select
            value={anioActual}
            onChange={(e) => setAnioActual(parseInt(e.target.value))}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors bg-white"
          >
            {aniosDisponibles
              .filter((a) => a > anioAnterior)
              .map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="flex gap-3">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Período 1</p>
          <p className="text-2xl font-bold text-gray-700">{anioAnterior}</p>
          <p className="text-xs text-gray-400 mt-1">Año anterior</p>
        </div>
        <div className="flex items-center text-gray-400 text-xl">→</div>
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-500 mb-1">Período 2</p>
          <p className="text-2xl font-bold text-blue-700">{anioActual}</p>
          <p className="text-xs text-blue-400 mt-1">Año actual</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-blue-200"
      >
        Continuar →
      </button>
    </div>
  )
}
