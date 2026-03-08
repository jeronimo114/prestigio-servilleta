'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWizardStore } from '@/lib/wizard-store'
import { calcularIndicadores } from '@/lib/indicadores'

interface Props { onNext: () => void; onPrev: () => void }

export function StepConfirmacion({ onPrev }: Props) {
  const store = useWizardStore()
  const router = useRouter()
  const [cargando, setCargando] = useState(false)

  const indAnterior = calcularIndicadores(store.datosAnioAnterior)
  const indActual = calcularIndicadores(store.datosAnioActual, store.datosAnioAnterior.ingresosOperacionales)

  async function verResultados() {
    setCargando(true)
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: store.nombre,
          empresa: store.empresa,
          email: store.email,
          sector: store.sector,
          anioAnterior: store.anioAnterior,
          anioActual: store.anioActual,
          datosAnioAnterior: store.datosAnioAnterior,
          datosAnioActual: store.datosAnioActual,
          indicadoresAnterior: indAnterior,
          indicadoresActual: indActual,
        }),
      })

      if (res.ok) {
        const { id } = await res.json()
        store.setSessionId(id)
        router.push(`/resultados/${id}`)
      } else {
        // Si falla Supabase, igual ir a resultados con datos locales
        router.push('/resultados/local')
      }
    } catch {
      router.push('/resultados/local')
    } finally {
      setCargando(false)
    }
  }

  const resumen = [
    { label: 'Empresa', valor: store.empresa || 'Sin nombre' },
    { label: 'Período', valor: `${store.anioAnterior} → ${store.anioActual}` },
    { label: `Ingresos ${store.anioAnterior}`, valor: `$ ${store.datosAnioAnterior.ingresosOperacionales.toLocaleString('es-CO')} M` },
    { label: `Ingresos ${store.anioActual}`, valor: `$ ${store.datosAnioActual.ingresosOperacionales.toLocaleString('es-CO')} M` },
    { label: `EBITDA ${store.anioActual}`, valor: `$ ${store.datosAnioActual.ebitda.toLocaleString('es-CO')} M` },
    {
      label: 'Margen EBITDA',
      valor: store.datosAnioActual.ingresosOperacionales > 0
        ? `${((store.datosAnioActual.ebitda / store.datosAnioActual.ingresosOperacionales) * 100).toFixed(1)}%`
        : 'N/A',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-5xl text-center">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">¡Ya casi terminamos!</h2>
        <p className="text-gray-500 text-center text-sm">Revisa el resumen antes de ver tu diagnóstico</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
        {resumen.map(({ label, valor }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{valor}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={verResultados}
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-200 text-base"
        >
          {cargando ? 'Calculando indicadores...' : 'Ver mi Diagnóstico Financiero →'}
        </button>

        <button
          onClick={onPrev}
          className="w-full border-2 border-gray-200 text-gray-600 font-medium py-3 rounded-2xl hover:border-gray-300 transition-all text-sm"
        >
          ← Revisar datos
        </button>
      </div>
    </div>
  )
}
