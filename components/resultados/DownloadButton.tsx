'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { DatosAnio } from '@/types/servilleta'

interface Props {
  empresa: string
  nombre: string
  anioAnterior: number
  anioActual: number
  datosAnioAnterior: DatosAnio
  datosAnioActual: DatosAnio
}

export function DownloadButton(props: Props) {
  const [cargando, setCargando] = useState(false)

  async function descargar() {
    setCargando(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      })

      if (!res.ok) throw new Error('Error')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `servilleta-${props.empresa.replace(/\s+/g, '-').toLowerCase()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al generar el Excel. Por favor intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <button
      onClick={descargar}
      disabled={cargando}
      className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-200 text-base"
    >
      <Download size={20} />
      {cargando ? 'Generando Excel...' : 'Descargar mi Servilleta (Excel)'}
    </button>
  )
}
