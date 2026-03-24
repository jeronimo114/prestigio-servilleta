'use client'

interface Props {
  paso: number
  total: number
  titulo: string
}

export function ProgressBar({ paso, total, titulo }: Props) {
  const porcentaje = Math.round((paso / total) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gris-600">{titulo}</span>
        <span className="text-sm text-gris-500">
          Paso {paso} de {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-prestigio-700 to-prestigio-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
