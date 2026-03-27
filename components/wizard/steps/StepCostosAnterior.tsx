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
        <div className="inline-block bg-oliva-100 text-oliva-600 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">EBITDA y Utilidad Operacional</h2>
        <p className="text-gray-500 text-sm">¿Cuánto genera tu negocio antes de intereses e impuestos?</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="EBITDA"
          ayuda="EBITDA: ganancias antes de intereses, impuestos y depreciaciones — es la caja operativa pura de tu negocio. Se calcula así: Utilidad Bruta - Gastos de administración - Gastos de ventas"
          valor={d.ebitda}
          onChange={(v) => updateDatosAnterior('ebitda', v)}
          autoFocus
        />

        <CampoMoneda
          label="Utilidad Operacional"
          ayuda="Utilidad Operacional: EBITDA menos depreciaciones y amortizaciones. Si no tienes activos fijos importantes, puede ser igual al EBITDA"
          valor={d.utilidadOperacional}
          onChange={(v) => updateDatosAnterior('utilidadOperacional', v)}
        />
      </div>

      {d.ebitda > 0 && d.ingresosOperacionales > 0 && (
        <div className="bg-prestigio-50 border border-prestigio-200 rounded-xl p-4">
          <p className="text-sm text-prestigio-700 font-medium">
            Margen EBITDA de tu empresa: {((d.ebitda / d.ingresosOperacionales) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-prestigio-700 mt-1">
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
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200"
      >
        Continuar →
      </button>
    </div>
  )
}
