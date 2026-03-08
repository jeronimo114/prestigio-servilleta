import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/30">
          PAE × Bancolombia
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <div className="text-7xl">🐦</div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Servilleta<br />Financiera
          </h1>
          <p className="text-blue-200 text-lg max-w-sm mx-auto">
            Tu diagnóstico financiero paso a paso, sin complicaciones. Pensado para empresarios reales.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🧙', titulo: 'Guiado', desc: 'Una pregunta a la vez' },
            { emoji: '🤖', titulo: 'IA incluida', desc: 'Finny te explica todo' },
            { emoji: '📥', titulo: 'Excel listo', desc: 'Descarga tu servilleta' },
          ].map((f) => (
            <div key={f.titulo} className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="text-2xl mb-2">{f.emoji}</div>
              <p className="text-white font-semibold text-sm">{f.titulo}</p>
              <p className="text-blue-200 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/wizard"
          className="block w-full bg-white text-blue-700 font-bold py-4 rounded-2xl text-lg hover:bg-blue-50 transition-colors shadow-xl"
        >
          Comenzar mi diagnóstico →
        </Link>

        <p className="text-blue-300 text-sm">
          Gratuito · 10 minutos · Confidencial
        </p>
      </div>
    </div>
  )
}
