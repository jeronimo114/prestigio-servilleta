'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepCostosActual({ onNext }: Props) {
  const { anioActual, datosAnioActual, updateDatosActual } = useWizardStore()
  const d = datosAnioActual

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-prestigio-100 text-prestigio-700 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioActual}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">EBITDA y Utilidad Operacional</h2>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="EBITDA"
          valor={d.ebitda}
          onChange={(v) => updateDatosActual('ebitda', v)}
          ayuda="Utilidad Bruta menos gastos administrativos y de ventas"
          autoFocus
        />

        <CampoMoneda
          label="Utilidad Operacional"
          valor={d.utilidadOperacional}
          onChange={(v) => updateDatosActual('utilidadOperacional', v)}
          ayuda="EBITDA menos depreciaciones y amortizaciones"
        />
      </div>

      {d.ebitda > 0 && d.ingresosOperacionales > 0 && (
        <div className="bg-prestigio-50 border border-prestigio-200 rounded-xl p-4">
          <p className="text-sm text-prestigio-700 font-medium">
            📊 Margen EBITDA {anioActual}: {((d.ebitda / d.ingresosOperacionales) * 100).toFixed(1)}%
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
