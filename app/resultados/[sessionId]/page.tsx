'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useWizardStore } from '@/lib/wizard-store'
import { calcularIndicadores, indicadoresConSemaforo } from '@/lib/indicadores'
import { IndicadorCard } from '@/components/resultados/IndicadorCard'
import { DownloadButton } from '@/components/resultados/DownloadButton'
import { MascotaAI } from '@/components/asistente/MascotaAI'
import type { IndicadoresAnio } from '@/types/servilleta'

const CATEGORIAS = [
  {
    id: 'rentabilidad',
    titulo: '2. Rentabilidad',
    indicadores: ['Margen EBITDA', 'Margen Neto', 'Crecimiento en Ventas'],
  },
  {
    id: 'liquidez',
    titulo: '1. Liquidez',
    indicadores: ['EBITDA / Intereses', 'Rotación de Cartera', 'Rotación de Inventarios', 'Rotación de Proveedores', 'Ciclo Financiero', 'Palanca de Crecimiento'],
  },
  {
    id: 'endeudamiento',
    titulo: '3. Endeudamiento',
    indicadores: ['Endeudamiento', 'Endeudamiento Financiero'],
  },
  {
    id: 'palanca',
    titulo: '4. Palanca de Crecimiento',
    indicadores: ['Palanca de Crecimiento'],
  },
]

function generarRecomendaciones(ind: IndicadoresAnio): string[] {
  const recs: string[] = []

  if (ind.margenEbitda < 0.05) {
    recs.push('Tu margen EBITDA está por debajo del 5%. Revisa los gastos operacionales y busca oportunidades de reducción de costos sin afectar la calidad.')
  } else if (ind.margenEbitda < 0.15) {
    recs.push('Tu margen EBITDA puede mejorar. Considera optimizar tu mezcla de productos/servicios priorizando los más rentables.')
  }

  if (ind.palancaCrecimiento < 1) {
    recs.push('Tu Palanca de Crecimiento (PDC) es menor a 1, lo que significa que al crecer necesitas más caja. Reduce el KTNO mejorando la rotación de cartera o inventarios.')
  } else {
    recs.push('¡Excelente! Tu Palanca de Crecimiento (PDC) > 1 significa que al crecer generas caja. Es el momento de invertir en crecimiento.')
  }

  if (ind.endeudamiento > 0.7) {
    recs.push('Tu nivel de endeudamiento es alto. Prioriza reducir deuda antes de tomar nuevos créditos y mejora la generación de caja operativa.')
  }

  if (ind.cicloFinancieroDias > 120) {
    recs.push(`Tu ciclo financiero de ${Math.round(ind.cicloFinancieroDias)} días es extenso. Negocia mejores plazos con proveedores y acelera el cobro de cartera.`)
  }

  if (ind.crecimientoVentas < 0) {
    recs.push('Tus ventas decrecieron vs el año anterior. Analiza las causas: ¿mercado, competencia o mix de productos? Define una estrategia comercial para el próximo período.')
  } else if (ind.crecimientoVentas > 0.1) {
    recs.push(`¡Creciste un ${(ind.crecimientoVentas * 100).toFixed(1)}% en ventas! Asegúrate de que ese crecimiento sea rentable y no te descapitalice.`)
  }

  return recs.length > 0
    ? recs
    : ['Tu empresa muestra una salud financiera sólida. Continúa monitoreando tus indicadores mensualmente.']
}

export default function ResultadosPage() {
  const params = useParams()
  const router = useRouter()
  const store = useWizardStore()
  const sessionId = params.sessionId as string

  const isLocal = sessionId === 'local' || sessionId?.startsWith('local-')

  // Use store data (always available since wizard just completed)
  const { empresa, nombre, anioAnterior, anioActual, datosAnioAnterior, datosAnioActual } = store

  const indActual = calcularIndicadores(datosAnioActual, datosAnioAnterior)
  const indAnterior = calcularIndicadores(datosAnioAnterior)
  const listaIndicadores = indicadoresConSemaforo(indActual)
  const recomendaciones = generarRecomendaciones(indActual)

  const rojos = listaIndicadores.filter(i => i.semaforo === 'rojo').length
  const verdes = listaIndicadores.filter(i => i.semaforo === 'verde').length

  if (!empresa && !isLocal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">No hay datos disponibles</p>
          <button onClick={() => router.push('/')} className="text-prestigio-700 underline">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gris-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/wizard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={16} />
            Volver al formulario
          </button>
          <span className="text-xs text-gray-400">Prestigio</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-2xl font-bold text-prestigio-900">
            Diagnóstico Financiero
          </h1>
          <p className="text-gray-500">
            {empresa || 'Tu empresa'} — {anioActual}
          </p>

          {/* Summary badge */}
          <div className="inline-flex gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
            <span className="text-sm text-green-600 font-semibold">{verdes} Saludable</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-yellow-600 font-semibold">{listaIndicadores.filter(i => i.semaforo === 'amarillo').length} Atención</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-red-600 font-semibold">{rojos} Crítico</span>
          </div>
        </motion.div>

        {/* Download button - prominente */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DownloadButton
            empresa={empresa || 'empresa'}
            nombre={nombre || ''}
            anioAnterior={anioAnterior}
            anioActual={anioActual}
            datosAnioAnterior={datosAnioAnterior}
            datosAnioActual={datosAnioActual}
          />
        </motion.div>

        {/* Indicadores grid */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-prestigio-900 mb-4">Tus Indicadores — {anioActual}</h2>
          <div className="grid grid-cols-2 gap-3">
            {listaIndicadores.map((ind, i) => (
              <motion.div
                key={ind.nombre}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <IndicadorCard indicador={ind} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Comparación años */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-bold text-prestigio-900 mb-4">Comparación {anioAnterior} vs {anioActual}</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {[
              { label: 'Ingresos', ant: datosAnioAnterior.ingresosOperacionales, act: datosAnioActual.ingresosOperacionales, fmt: 'M' },
              { label: 'EBITDA', ant: datosAnioAnterior.ebitda, act: datosAnioActual.ebitda, fmt: 'M' },
              { label: 'Utilidad Neta', ant: indAnterior.utilidadNeta, act: indActual.utilidadNeta, fmt: 'M' },
              { label: 'KTNO', ant: indAnterior.ktno, act: indActual.ktno, fmt: 'M' },
            ].map(({ label, ant, act, fmt }, i) => {
              const vari = ant ? ((act - ant) / ant) * 100 : 0
              return (
                <div key={label} className={`flex items-center px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                  <span className="flex-1 text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-medium text-gray-500 w-24 text-right">$ {ant.toLocaleString('es-CO', { maximumFractionDigits: 1 })} {fmt}</span>
                  <span className="text-sm font-semibold text-gray-800 w-24 text-right">$ {act.toLocaleString('es-CO', { maximumFractionDigits: 1 })} {fmt}</span>
                  <span className={`w-16 text-right text-xs font-bold ${vari >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {vari >= 0 ? '+' : ''}{vari.toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Roadmap / Recomendaciones */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="text-lg font-bold text-prestigio-900 mb-4">Tu Hoja de Ruta</h2>
          <div className="space-y-3">
            {recomendaciones.map((rec, i) => (
              <div key={i} className="bg-prestigio-50 border border-prestigio-100 rounded-xl p-4 flex gap-3">
                <span className="text-prestigio-700 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                <p className="text-sm text-prestigio-900 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* PDC explicación */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className={`rounded-2xl border-2 p-5 ${indActual.palancaCrecimiento > 1 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <h3 className="font-bold text-gray-800 mb-2">
              Palanca de Crecimiento (PDC): {indActual.palancaCrecimiento.toFixed(2)}x
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {indActual.palancaCrecimiento > 1
                ? `¡Excelente! Tu Palanca de Crecimiento (PDC) de ${indActual.palancaCrecimiento.toFixed(2)} indica que por cada peso que crece tu empresa, genera ${((indActual.palancaCrecimiento - 1) * 100).toFixed(0)} centavos adicionales de caja. Crecer es rentable para ti.`
                : `Tu Palanca de Crecimiento (PDC) de ${indActual.palancaCrecimiento.toFixed(2)} indica que al crecer necesitas inyectar caja adicional. El objetivo es llevar el PDC > 1 reduciendo el KTNO o mejorando el EBITDA.`}
            </p>
          </div>
        </motion.section>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pb-8 space-y-3"
        >
          <DownloadButton
            empresa={empresa || 'empresa'}
            nombre={nombre || ''}
            anioAnterior={anioAnterior}
            anioActual={anioActual}
            datosAnioAnterior={datosAnioAnterior}
            datosAnioActual={datosAnioActual}
          />
          <button
            onClick={() => { store.reset(); router.push('/') }}
            className="w-full border-2 border-gray-200 text-gray-600 font-medium py-3 rounded-2xl hover:border-gray-300 text-sm transition-all"
          >
            <RefreshCw size={14} className="inline mr-2" />
            Hacer un nuevo análisis
          </button>
        </motion.div>
      </main>

      <MascotaAI paso="resultados" campo="" />
    </div>
  )
}
