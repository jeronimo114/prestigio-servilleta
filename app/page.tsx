import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003a4b] to-[#004d63] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-10">
        {/* Logo mark */}
        <div className="flex justify-center">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="34" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            <circle cx="36" cy="36" r="24" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="36" cy="36" r="14" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
            <circle cx="36" cy="36" r="5" fill="white" fillOpacity="0.9" />
          </svg>
        </div>

        {/* Badge */}
        <div className="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20 tracking-wide">
          Prestigio
        </div>

        {/* Hero */}
        <div className="space-y-5">
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Servilleta<br />Financiera
          </h1>
          <p className="font-serif italic text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
            Tu cuenta de tienda, hecha servilleta
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: '✦', titulo: 'Simple', desc: 'Una sola pantalla' },
            { icon: '◎', titulo: 'IA incluida', desc: 'Resuelve tus dudas' },
            { icon: '↓', titulo: 'Excel listo', desc: 'Descarga tu servilleta' },
          ].map((f) => (
            <div key={f.titulo} className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <div className="text-xl mb-2 text-white/60">{f.icon}</div>
              <p className="text-white font-semibold text-sm">{f.titulo}</p>
              <p className="text-white/50 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/wizard"
          className="block w-full bg-white text-prestigio-900 font-bold py-4 rounded-2xl text-lg hover:bg-gris-100 transition-colors shadow-xl"
        >
          Comenzar mi diagnóstico →
        </Link>

        <p className="text-white/40 text-sm tracking-wide">
          Gratuito · Confidencial · Automatizado
        </p>

        {/* Tagline */}
        <p className="text-white/20 text-xs tracking-widest uppercase pt-4">
          Liderando desde el ser
        </p>
      </div>
    </div>
  )
}
