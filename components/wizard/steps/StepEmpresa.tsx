'use client'

import { useWizardStore } from '@/lib/wizard-store'

interface Props {
  onNext: () => void
  onPrev: () => void
}

export function StepEmpresa({ onNext }: Props) {
  const { nombre, cedula, empresa, email, sector, setNombre, setCedula, setEmpresa, setEmail, setSector } = useWizardStore()

  const sectores = [
    'Comercio', 'Manufactura', 'Servicios', 'Gastronomía', 'Construcción',
    'Salud', 'Educación', 'Agropecuario', 'Tecnología', 'Otro',
  ]

  const valido = nombre.trim() && cedula.trim() && empresa.trim() && email.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-prestigio-900">¿Quién eres tú?</h2>
        <p className="text-gray-500">Cuéntanos un poco sobre ti y tu empresa</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Tu nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: María García"
            autoFocus
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-prestigio-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Tu cédula *</label>
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
          <label className="block text-sm font-semibold text-gray-700">Sector económico</label>
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
      </div>

      <button
        onClick={onNext}
        disabled={!valido}
        className="w-full bg-prestigio-900 hover:bg-prestigio-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-prestigio-200"
      >
        Continuar →
      </button>
    </div>
  )
}
