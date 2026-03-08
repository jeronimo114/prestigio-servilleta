'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepIngresosActual({ onNext }: Props) {
  const { anioActual, anioAnterior, datosAnioActual, datosAnioAnterior, updateDatosActual } = useWizardStore()
  const d = datosAnioActual

  const crecimiento = datosAnioAnterior.ingresosOperacionales > 0
    ? ((d.ingresosOperacionales - datosAnioAnterior.ingresosOperacionales) / datosAnioAnterior.ingresosOperacionales) * 100
    : null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioActual}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Ingresos y Utilidad Bruta</h2>
        <p className="text-gray-500 text-sm">Ahora el año más reciente</p>
      </div>

      {/* Referencia del año anterior */}
      <div className="bg-gray-50 rounded-xl p-3 flex gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-400 text-xs">{anioAnterior}</p>
          <p className="font-semibold text-gray-600">$ {datosAnioAnterior.ingresosOperacionales.toLocaleString('es-CO')} M</p>
        </div>
        <div className="text-gray-300">→</div>
        <div className="text-center">
          <p className="text-gray-400 text-xs">{anioActual}</p>
          <p className="font-semibold text-blue-600">$ {d.ingresosOperacionales > 0 ? d.ingresosOperacionales.toLocaleString('es-CO') : '?'} M</p>
        </div>
        {crecimiento !== null && (
          <div className={`ml-auto font-bold text-sm ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {crecimiento >= 0 ? '+' : ''}{crecimiento.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="Ingresos Operacionales"
          ayuda={`Total de ventas o ingresos por servicios en ${anioActual}`}
          valor={d.ingresosOperacionales}
          onChange={(v) => updateDatosActual('ingresosOperacionales', v)}
          autoFocus
        />

        <CampoMoneda
          label="Utilidad Bruta"
          ayuda="Ingresos menos el costo de lo que vendiste"
          valor={d.utilidadBruta}
          onChange={(v) => updateDatosActual('utilidadBruta', v)}
        />
      </div>

      <button
        onClick={onNext}
        disabled={d.ingresosOperacionales === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-200"
      >
        Continuar →
      </button>
    </div>
  )
}
