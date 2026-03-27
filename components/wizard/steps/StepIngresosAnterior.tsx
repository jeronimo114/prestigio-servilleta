'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepIngresosAnterior({ onNext }: Props) {
  const { anioAnterior, datosAnioAnterior, updateDatosAnterior } = useWizardStore()
  const d = datosAnioAnterior

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-oliva-100 text-oliva-600 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">Ingresos y Utilidad Bruta</h2>
        <p className="text-gray-500 text-sm">Cifras en millones de pesos colombianos</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="Ingresos Operacionales"
          ayuda="Ingresos Operacionales: todo el dinero que entró por ventas o servicios de tu negocio en el año"
          valor={d.ingresosOperacionales}
          onChange={(v) => updateDatosAnterior('ingresosOperacionales', v)}
          autoFocus
        />

        <CampoMoneda
          label="Utilidad Bruta"
          ayuda="Utilidad Bruta: ingresos menos el costo de lo que vendiste o fabricaste. Si vendes ropa y compraste por $30M para venderla en $50M, la utilidad bruta es $20M"
          valor={d.utilidadBruta}
          onChange={(v) => updateDatosAnterior('utilidadBruta', v)}
        />
      </div>

      {d.ingresosOperacionales > 0 && d.utilidadBruta > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 font-medium">
            Margen bruto de tu empresa: {((d.utilidadBruta / d.ingresosOperacionales) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-green-600 mt-1">
            De cada $100 que vendes, ${ ((d.utilidadBruta / d.ingresosOperacionales) * 100).toFixed(0) } quedan para cubrir gastos
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={d.ingresosOperacionales === 0}
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200"
      >
        Continuar →
      </button>
    </div>
  )
}
