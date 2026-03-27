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
        <div className="inline-block bg-prestigio-100 text-prestigio-700 text-xs font-semibold px-3 py-1 rounded-full">
          Balance General — {anioActual}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">Pasivos y Patrimonio</h2>
      </div>

      <div className="space-y-5">
        <CampoMoneda label="Obligaciones Financieras C.P." ayuda="Obligaciones Financieras C.P.: créditos bancarios que vencen en menos de 1 año (cuotas de leasing, tarjetas empresariales)" valor={d.obligacionesFinancierasCP} onChange={(v) => updateDatosActual('obligacionesFinancierasCP', v)} autoFocus />
        <CampoMoneda label="Obligaciones Financieras L.P." ayuda="Obligaciones Financieras L.P.: créditos bancarios a más de 1 año (hipotecas, créditos de largo plazo)" valor={d.obligacionesFinancierasLP} onChange={(v) => updateDatosActual('obligacionesFinancierasLP', v)} />
        <CampoMoneda label="Proveedores" ayuda="Proveedores: lo que le debes a tus proveedores de mercancía o insumos" valor={d.proveedores} onChange={(v) => updateDatosActual('proveedores', v)} />
        <CampoMoneda label="Otros Pasivos" ayuda="Otros Pasivos: obligaciones laborales, anticipos de clientes, cuentas por pagar, impuestos por pagar" valor={d.otrosPasivos} onChange={(v) => updateDatosActual('otrosPasivos', v)} />
        <CampoMoneda label="Capital + Superávit" ayuda="Capital + Superávit: lo que aportaron los socios como capital inicial más las reservas acumuladas" valor={d.capitalSuperavit} onChange={(v) => updateDatosActual('capitalSuperavit', v)} />
        <CampoMoneda label="Total Patrimonio" ayuda="Total Patrimonio: capital + superávit + utilidades acumuladas. Es lo que realmente vale la empresa para los socios" valor={d.totalPatrimonio} onChange={(v) => updateDatosActual('totalPatrimonio', v)} />
      </div>

      <div className="bg-prestigio-100 border-2 border-prestigio-300 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Pasivos de tu empresa</p>
        <p className="text-2xl font-bold text-prestigio-900">$ {totalPasivos.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M</p>
      </div>

      <button onClick={onNext} className="w-full bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200">
        Ver mi Diagnóstico →
      </button>
    </div>
  )
}
