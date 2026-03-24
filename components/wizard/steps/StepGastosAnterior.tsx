'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepGastosAnterior({ onNext }: Props) {
  const { anioAnterior, datosAnioAnterior, updateDatosAnterior } = useWizardStore()
  const d = datosAnioAnterior

  const utilidadNeta = d.utilidadOperacional - d.intereses - d.impuestos + d.otrosIngresosEgresos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-oliva-100 text-oliva-600 text-xs font-semibold px-3 py-1 rounded-full">
          Estado de Resultados — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">Gastos Financieros e Impuestos</h2>
        <p className="text-gray-500 text-sm">Lo que le pagas al banco y al Estado</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="Intereses Financieros"
          ayuda="Lo que pagaste de intereses por créditos bancarios, leasing, etc. Si no tienes deuda, pon 0"
          valor={d.intereses}
          onChange={(v) => updateDatosAnterior('intereses', v)}
          autoFocus
        />

        <CampoMoneda
          label="Impuestos"
          ayuda="Renta e impuestos pagados al Estado en el año. Si eres persona natural o no tributas, pon 0"
          valor={d.impuestos}
          onChange={(v) => updateDatosAnterior('impuestos', v)}
        />

        <CampoMoneda
          label="Otros Ingresos / Egresos"
          ayuda="Ingresos o gastos que no son de la operación principal (arriendos recibidos, ventas de activos, multas). Puede ser negativo (escribe el número con signo negativo si es un egreso)"
          valor={d.otrosIngresosEgresos}
          onChange={(v) => updateDatosAnterior('otrosIngresosEgresos', v)}
        />
      </div>

      {/* Utilidad neta calculada */}
      <div className={`border-2 rounded-xl p-4 ${utilidadNeta >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Utilidad Neta calculada</p>
        <p className={`text-2xl font-bold ${utilidadNeta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          $ {utilidadNeta.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Utilidad Op. {d.utilidadOperacional.toLocaleString('es-CO')} − Intereses {d.intereses.toLocaleString('es-CO')} − Impuestos {d.impuestos.toLocaleString('es-CO')} + Otros {d.otrosIngresosEgresos.toLocaleString('es-CO')}
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200"
      >
        Continuar →
      </button>
    </div>
  )
}
