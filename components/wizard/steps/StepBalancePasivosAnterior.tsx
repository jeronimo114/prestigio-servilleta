'use client'

import { useWizardStore } from '@/lib/wizard-store'
import { CampoMoneda } from '@/components/wizard/CampoMoneda'

interface Props { onNext: () => void; onPrev: () => void }

export function StepBalancePasivosAnterior({ onNext }: Props) {
  const { anioAnterior, datosAnioAnterior, updateDatosAnterior } = useWizardStore()
  const d = datosAnioAnterior

  const totalOblig = d.obligacionesFinancierasCP + d.obligacionesFinancierasLP
  const totalPasivos = totalOblig + d.proveedores + d.otrosPasivos

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-block bg-prestigio-100 text-prestigio-700 text-xs font-semibold px-3 py-1 rounded-full">
          Balance General — {anioAnterior}
        </div>
        <h2 className="text-2xl font-bold text-prestigio-900">Pasivos y Patrimonio</h2>
        <p className="text-gray-500 text-sm">Todo lo que debe tu empresa y lo que aportan los socios</p>
      </div>

      <div className="space-y-5">
        <CampoMoneda
          label="Obligaciones Financieras C.P."
          ayuda="Créditos bancarios que vencen en menos de 1 año (cuotas de leasing, tarjetas de crédito empresarial, etc.)"
          valor={d.obligacionesFinancierasCP}
          onChange={(v) => updateDatosAnterior('obligacionesFinancierasCP', v)}
          autoFocus
        />

        <CampoMoneda
          label="Obligaciones Financieras L.P."
          ayuda="Créditos bancarios a más de 1 año (hipotecas, créditos de largo plazo)"
          valor={d.obligacionesFinancierasLP}
          onChange={(v) => updateDatosAnterior('obligacionesFinancierasLP', v)}
        />

        <CampoMoneda
          label="Proveedores"
          ayuda="Lo que le debes a tus proveedores de mercancía o insumos"
          valor={d.proveedores}
          onChange={(v) => updateDatosAnterior('proveedores', v)}
        />

        <CampoMoneda
          label="Otros Pasivos"
          ayuda="Obligaciones laborales, anticipos de clientes, cuentas por pagar a vinculados, impuestos por pagar"
          valor={d.otrosPasivos}
          onChange={(v) => updateDatosAnterior('otrosPasivos', v)}
        />

        <CampoMoneda
          label="Capital + Superávit"
          ayuda="Lo que aportaron los socios como capital inicial más las reservas acumuladas"
          valor={d.capitalSuperavit}
          onChange={(v) => updateDatosAnterior('capitalSuperavit', v)}
        />

        <CampoMoneda
          label="Total Patrimonio"
          ayuda="Capital + Superávit + Utilidades acumuladas. Es lo que realmente vale la empresa para los socios"
          valor={d.totalPatrimonio}
          onChange={(v) => updateDatosAnterior('totalPatrimonio', v)}
        />
      </div>

      <div className="bg-prestigio-100 border-2 border-prestigio-300 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Pasivos de tu empresa</p>
        <p className="text-2xl font-bold text-prestigio-900">
          $ {totalPasivos.toLocaleString('es-CO', { maximumFractionDigits: 2 })} M
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-prestigio-200"
      >
        Continuar al Año Actual →
      </button>
    </div>
  )
}
