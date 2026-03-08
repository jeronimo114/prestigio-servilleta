'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepCostosAnterior({ onNext }: Props) {
  const { anioAnterior, datosAnioAnterior, updateDatosAnterior } = useWizardStore()
  const d = datosAnioAnterior

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">EBITDA y Utilidad Operacional</h2>
        <p className="text-gray-500 text-sm">¿Cuánto genera tu negocio antes de intereses e impuestos?</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="EBITDA"
          ayuda="Ganancias antes de intereses, impuestos, depreciaciones. Es la 'caja bruta' que genera la operación. Muchas veces puedes calcularlo así: Utilidad Bruta - Gastos de administración - Gastos de ventas"
          valor={d.ebitda}
          onChange={(v) => updateDatosAnterior('ebitda', v)}
          autoFocus
        />

        <CampoMoneda
          label="Utilidad Operacional"
          ayuda="EBITDA menos depreciaciones y amortizaciones. Si no tienes activos fijos importantes, puede ser igual al EBITDA"
          valor={d.utilidadOperacional}
          onChange={(v) => updateDatosAnterior('utilidadOperacional', v)}
        />
      </div>

      {d.ebitda > 0 && d.ingresosOperacionales > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">
            📊 Margen EBITDA: {((d.ebitda / d.ingresosOperacionales) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {d.ebitda / d.ingresosOperacionales >= 0.15
              ? '✅ Muy saludable (más del 15%)'
              : d.ebitda / d.ingresosOperacionales >= 0.05
              ? '⚠️ Aceptable, hay oportunidad de mejora'
              : '🔴 Bajo — analicemos los gastos juntos'}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-200"
      >
        Continuar →
      </button>
    </div>
  )
}
