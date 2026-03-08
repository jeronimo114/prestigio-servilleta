'use client'

import { useState, useEffect } from 'react'

interface Props {
  label: string
  ayuda?: string
  valor: number
  onChange: (v: number) => void
  unidad?: string
  autoFocus?: boolean
}

function formatearMoneda(valor: number): string {
  if (valor === 0) return ''
  return valor.toLocaleString('es-CO')
}

export function CampoMoneda({ label, ayuda, valor, onChange, unidad = 'Millones COP', autoFocus }: Props) {
  const [displayValue, setDisplayValue] = useState(valor > 0 ? formatearMoneda(valor) : '')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) {
      setDisplayValue(valor > 0 ? formatearMoneda(valor) : '')
    }
  }, [valor, focused])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(raw)
    const num = parseFloat(raw)
    onChange(isNaN(num) ? 0 : num)
  }

  function handleBlur() {
    setFocused(false)
    if (valor > 0) setDisplayValue(formatearMoneda(valor))
  }

  function handleFocus() {
    setFocused(true)
    setDisplayValue(valor > 0 ? String(valor) : '')
  }

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold text-gray-800">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          placeholder="0"
          className="w-full pl-8 pr-28 py-4 text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
          {unidad}
        </span>
      </div>
      {ayuda && (
        <p className="text-sm text-gray-500 bg-blue-50 rounded-lg px-3 py-2 border-l-4 border-blue-300">
          💡 {ayuda}
        </p>
      )}
    </div>
  )
}
