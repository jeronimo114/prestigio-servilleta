'use client'

import { useWizardStore } from '@/lib/wizard-store'

interface Props {
  onNext: () => void
  onPrev: () => void
}

export function StepEmpresa({ onNext }: Props) {
  const { nombre, empresa, email, sector, setNombre, setEmpresa, setEmail, setSector } = useWizardStore()

  const sectores = [
    'Comercio', 'Manufactura', 'Servicios', 'Gastronomía', 'Construcción',
    'Salud', 'Educación', 'Agropecuario', 'Tecnología', 'Otro',
  ]

  const valido = nombre.trim() && empresa.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">¿Quién eres tú?</h2>
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
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Nombre de tu empresa *</label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Ej: Textiles Nueva Mirada"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors"
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
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-blue-200"
      >
        Continuar →
      </button>
    </div>
  )
}
