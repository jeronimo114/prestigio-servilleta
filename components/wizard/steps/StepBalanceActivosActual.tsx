'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepBalanceActivosActual({ onNext }: Props) {
  const { anioActual, datosAnioActual, updateDatosActual } = useWizardStore()
  const d = datosAnioActual

  const totalActivos = d.carteraNeta + d.inventarios + d.activosFijosNetos + d.otrosActivos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-prestigio-100 text-prestigio-700 text-xs font-semibold px-3 py-1 rounded-full">
          Balance General — {anioActual}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">Activos</h2>
      </div>

      <div className="space-y-5">
        <CampoMoneda label="Cartera Neta" ayuda="Cartera Neta: plata que te deben los clientes (cuentas por cobrar). Si cobras de contado, pon 0" valor={d.carteraNeta} onChange={(v) => updateDatosActual('carteraNeta', v)} autoFocus />
        <CampoMoneda label="Inventarios" ayuda="Inventarios: mercancía o materia prima que tienes guardada. Si eres de servicios, pon 0" valor={d.inventarios} onChange={(v) => updateDatosActual('inventarios', v)} />
        <CampoMoneda label="Activos Fijos Netos" ayuda="Activos Fijos Netos: maquinaria, equipos, vehículos, terrenos (ya descontada la depreciación)" valor={d.activosFijosNetos} onChange={(v) => updateDatosActual('activosFijosNetos', v)} />
        <CampoMoneda label="Otros Activos" ayuda="Otros Activos: anticipos pagados, dinero en cuentas bancarias, efectivo en caja" valor={d.otrosActivos} onChange={(v) => updateDatosActual('otrosActivos', v)} />
      </div>

      <div className="bg-prestigio-100 border-2 border-prestigio-300 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Activos de tu empresa</p>
        <p className="text-2xl font-bold text-prestigio-900">$ {totalActivos.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M</p>
      </div>

      <button onClick={onNext} className="w-full bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200">
        Continuar →
      </button>
    </div>
  )
}
