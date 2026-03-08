'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepBalancePasivosActual({ onNext }: Props) {
  const { anioActual, datosAnioActual, updateDatosActual } = useWizardStore()
  const d = datosAnioActual

  const totalOblig = d.obligacionesFinancierasCP + d.obligacionesFinancierasLP
  const totalPasivos = totalOblig + d.proveedores + d.otrosPasivos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          Balance General — {anioActual}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Pasivos y Patrimonio</h2>
      </div>

      <div className="space-y-5">
        <CampoMoneda label="Obligaciones Financieras C.P." ayuda="Deuda bancaria a menos de 1 año" valor={d.obligacionesFinancierasCP} onChange={(v) => updateDatosActual('obligacionesFinancierasCP', v)} autoFocus />
        <CampoMoneda label="Obligaciones Financieras L.P." ayuda="Deuda bancaria a más de 1 año" valor={d.obligacionesFinancierasLP} onChange={(v) => updateDatosActual('obligacionesFinancierasLP', v)} />
        <CampoMoneda label="Proveedores" ayuda="Lo que le debes a tus proveedores" valor={d.proveedores} onChange={(v) => updateDatosActual('proveedores', v)} />
        <CampoMoneda label="Otros Pasivos" ayuda="Obligaciones laborales, anticipos de clientes, etc." valor={d.otrosPasivos} onChange={(v) => updateDatosActual('otrosPasivos', v)} />
        <CampoMoneda label="Capital + Superávit" ayuda="Aportes de socios más reservas" valor={d.capitalSuperavit} onChange={(v) => updateDatosActual('capitalSuperavit', v)} />
        <CampoMoneda label="Total Patrimonio" ayuda="Todo lo que vale la empresa para los socios" valor={d.totalPatrimonio} onChange={(v) => updateDatosActual('totalPatrimonio', v)} />
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Pasivos</p>
        <p className="text-2xl font-bold text-blue-700">$ {totalPasivos.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M</p>
      </div>

      <button onClick={onNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-200">
        Ver mi Diagnóstico →
      </button>
    </div>
  )
}
