'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepBalanceActivosAnterior({ onNext }: Props) {
  const { anioAnterior, datosAnioAnterior, updateDatosAnterior } = useWizardStore()
  const d = datosAnioAnterior

  const totalActivos = d.carteraNeta + d.inventarios + d.activosFijosNetos + d.otrosActivos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
          Balance General — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Activos</h2>
        <p className="text-gray-500 text-sm">Todo lo que tiene tu empresa</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="Cartera Neta"
          ayuda="Plata que te deben los clientes (cuentas por cobrar). Si cobras de contado, pon 0"
          valor={d.carteraNeta}
          onChange={(v) => updateDatosAnterior('carteraNeta', v)}
          autoFocus
        />

        <CampoMoneda
          label="Inventarios"
          ayuda="Mercancía o materia prima que tienes guardada. Si eres de servicios, pon 0"
          valor={d.inventarios}
          onChange={(v) => updateDatosAnterior('inventarios', v)}
        />

        <CampoMoneda
          label="Activos Fijos Netos"
          ayuda="Maquinaria, equipos, vehículos, terrenos, edificios (ya descontada la depreciación)"
          valor={d.activosFijosNetos}
          onChange={(v) => updateDatosAnterior('activosFijosNetos', v)}
        />

        <CampoMoneda
          label="Otros Activos"
          ayuda="Anticipos pagados, dinero en cuentas bancarias, efectivo en caja, otros activos no clasificados arriba"
          valor={d.otrosActivos}
          onChange={(v) => updateDatosAnterior('otrosActivos', v)}
        />
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Activos</p>
        <p className="text-2xl font-bold text-purple-700">
          $ {totalActivos.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-200"
      >
        Continuar →
      </button>
    </div>
  )
}
