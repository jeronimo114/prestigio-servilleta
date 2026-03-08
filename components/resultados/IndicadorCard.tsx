'use client'

import type { IndicadorConSemaforo } from '@/types/servilleta'
import { formatearValor } from '@/lib/indicadores'

const SEMAFORO_COLORS = {
  verde: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    valor: 'text-green-700',
  },
  amarillo: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
    valor: 'text-yellow-700',
  },
  rojo: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    valor: 'text-red-700',
  },
}

const SEMAFORO_LABELS = {
  verde: 'Saludable',
  amarillo: 'Atención',
  rojo: 'Crítico',
}

interface Props {
  indicador: IndicadorConSemaforo
}

export function IndicadorCard({ indicador }: Props) {
  const colors = SEMAFORO_COLORS[indicador.semaforo]

  return (
    <div className={`rounded-2xl border-2 p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 leading-tight pr-2">{indicador.nombre}</h3>
        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${colors.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {SEMAFORO_LABELS[indicador.semaforo]}
        </span>
      </div>
      <p className={`text-2xl font-bold mb-2 ${colors.valor}`}>
        {formatearValor(indicador.valor, indicador.formato)}
      </p>
      <p className="text-xs text-gray-500 leading-snug">{indicador.descripcion}</p>
    </div>
  )
}
