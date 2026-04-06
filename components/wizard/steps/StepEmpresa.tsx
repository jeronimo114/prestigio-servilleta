'use client'

import { useWizardStore } from '@/lib/wizard-store'

interface Props {
  onNext: () => void
  onPrev: () => void
}

export function StepEmpresa({ onNext }: Props) {
  const {
    nombre, cedula, empresa, email, sector,
    anioAnterior, anioActual,
    setNombre, setCedula, setEmpresa, setEmail, setSector,
    setAnioAnterior, setAnioActual,
  } = useWizardStore()

  const sectores = [
    'Comercio', 'Manufactura', 'Servicios', 'Gastronomia', 'Construccion',
    'Salud', 'Educacion', 'Agropecuario', 'Tecnologia', 'Otro',
  ]

  const anioActualReal = new Date().getFullYear()
  const aniosDisponibles = Array.from({ length: 8 }, (_, i) => anioActualReal - i)

  const valido = nombre.trim() && cedula.trim() && empresa.trim() && email.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-prestigio-900">Tu empresa</h2>
        <p className="text-gray-500">Cuentanos sobre ti y los periodos a analizar</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Tu nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Maria Garcia"
            autoFocus
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-prestigio-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Tu cedula *</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ej: 1017234567"
            inputMode="numeric"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-prestigio-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Nombre de tu empresa *</label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Ej: Textiles Nueva Mirada"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-prestigio-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-prestigio-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Sector economico</label>
          <div className="grid grid-cols-2 gap-2">
            {sectores.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  sector === s
                    ? 'border-prestigio-700 bg-prestigio-50 text-prestigio-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Periodos - integrado */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Periodos a comparar</p>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-xs text-gray-500">Ano anterior</label>
              <select
                value={anioAnterior}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setAnioAnterior(val)
                  if (anioActual <= val) setAnioActual(val + 1)
                }}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-base focus:border-prestigio-700 focus:outline-none transition-colors bg-white"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-3 text-gray-400">→</div>
            <div className="flex-1 space-y-1">
              <label className="block text-xs text-gray-500">Ano actual</label>
              <select
                value={anioActual}
                onChange={(e) => setAnioActual(parseInt(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-base focus:border-prestigio-700 focus:outline-none transition-colors bg-white"
              >
                {aniosDisponibles
                  .filter((a) => a > anioAnterior)
                  .map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!valido}
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-prestigio-200"
      >
        Continuar a la Servilleta →
      </button>
    </div>
  )
}
