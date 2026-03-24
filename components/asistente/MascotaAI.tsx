'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import type { Message } from '@/lib/ai-client'

// FAQs contextuales por paso del wizard
const FAQS_POR_PASO: Record<string, string[]> = {
  'Datos básicos': [
    '¿Por qué necesitan mi email?',
    '¿Mis datos son confidenciales?',
    '¿Qué sector elijo si tengo varios?',
  ],
  'Períodos': [
    '¿Qué pasa si mi empresa tiene menos de 2 años?',
    '¿Puedo usar el mismo año en ambos campos?',
    '¿Qué es un período contable?',
  ],
  'Estado de resultados': [
    '¿Qué son los Ingresos Operacionales?',
    '¿Cómo calculo la Utilidad Bruta?',
    '¿Qué es el EBITDA?',
    '¿Qué incluye en Utilidad Operacional?',
    '¿Cómo sé cuántos intereses pagué?',
  ],
  'Balance General': [
    '¿Qué es la Cartera Neta?',
    '¿Qué van en Otros Activos?',
    '¿Cuál es la diferencia entre deuda CP y LP?',
    '¿Qué incluye en Otros Pasivos?',
    '¿Cómo calculo el Patrimonio?',
  ],
  'Confirmación': [
    '¿Puedo cambiar un dato después?',
    '¿Qué indicadores me van a calcular?',
    '¿Qué es la Palanca de Crecimiento?',
  ],
  'default': [
    '¿Qué es el EBITDA?',
    '¿Para qué sirve la servilleta financiera?',
    '¿Qué es el KTNO?',
    '¿Cómo interpreto los semáforos?',
  ],
}

function getFaqs(paso: string): string[] {
  // Busca coincidencia parcial en las claves
  const key = Object.keys(FAQS_POR_PASO).find(k => paso.toLowerCase().includes(k.toLowerCase()))
  return FAQS_POR_PASO[key ?? 'default']
}

interface Props {
  paso: string
  campo: string
}

export function MascotaAI({ paso, campo }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola, soy el Asistente Prestigio. Estoy aquí para ayudarte con cualquier duda sobre los datos financieros que estás ingresando.',
    },
  ])
  const [cargando, setCargando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historial])

  async function enviar() {
    if (!mensaje.trim() || cargando) return

    const nuevoMensaje: Message = { role: 'user', content: mensaje }
    setHistorial((h) => [...h, nuevoMensaje])
    setMensaje('')
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, paso, campo, historial }),
      })

      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let respuesta = ''

      setHistorial((h) => [...h, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices?.[0]?.delta?.content || ''
              respuesta += token
              setHistorial((h) => {
                const nuevo = [...h]
                nuevo[nuevo.length - 1] = { role: 'assistant', content: respuesta }
                return nuevo
              })
            } catch {}
          }
        }
      }
    } catch (e) {
      setHistorial((h) => [
        ...h,
        {
          role: 'assistant',
          content: 'Ups, tuve un problema técnico. ¿Me repites la pregunta?',
        },
      ])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat bubble */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-prestigio-100 flex flex-col overflow-hidden"
            style={{ maxHeight: '560px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-prestigio-900 to-prestigio-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-prestigio-900">P</div>
                <div>
                  <p className="text-white font-semibold text-sm">Asistente Prestigio</p>
                  <p className="text-prestigio-200 text-xs">Tu guía financiero</p>
                </div>
              </div>
              <button onClick={() => setAbierto(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" style={{ minHeight: '180px', maxHeight: '240px' }}>
              {historial.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 bg-prestigio-100 rounded-full flex items-center justify-center text-xs font-bold text-prestigio-900 mr-2 flex-shrink-0 mt-1">P</div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-prestigio-900 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.content || (cargando && i === historial.length - 1 ? (
                      <span className="flex gap-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-100">.</span>
                        <span className="animate-bounce delay-200">.</span>
                      </span>
                    ) : null)}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* FAQ chips contextuales */}
            <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5">Preguntas frecuentes</p>
              <div className="flex flex-wrap gap-1.5">
                {getFaqs(paso).map((faq) => (
                  <button
                    key={faq}
                    onClick={() => {
                      setMensaje(faq)
                      // Pequeño delay para que se vea la pregunta antes de enviar
                      setTimeout(() => {
                        setMensaje('')
                        const nuevoMensaje: Message = { role: 'user', content: faq }
                        setHistorial((h) => [...h, nuevoMensaje])
                        setCargando(true)
                        fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mensaje: faq, paso, campo, historial }),
                        }).then(async (res) => {
                          if (!res.body) throw new Error('No stream')
                          const reader = res.body.getReader()
                          const decoder = new TextDecoder()
                          let respuesta = ''
                          setHistorial((h) => [...h, { role: 'assistant', content: '' }])
                          while (true) {
                            const { done, value } = await reader.read()
                            if (done) break
                            const chunk = decoder.decode(value)
                            for (const line of chunk.split('\n')) {
                              if (line.startsWith('data: ')) {
                                const data = line.slice(6)
                                if (data === '[DONE]') continue
                                try {
                                  const token = JSON.parse(data).choices?.[0]?.delta?.content || ''
                                  respuesta += token
                                  setHistorial((h) => {
                                    const n = [...h]
                                    n[n.length - 1] = { role: 'assistant', content: respuesta }
                                    return n
                                  })
                                } catch {}
                              }
                            }
                          }
                        }).catch(() => {
                          setHistorial((h) => [...h, { role: 'assistant', content: 'Ups, tuve un problema. ¿Me repites la pregunta?' }])
                        }).finally(() => setCargando(false))
                      }, 80)
                    }}
                    disabled={cargando}
                    className="text-xs bg-prestigio-50 hover:bg-prestigio-100 text-prestigio-700 border border-prestigio-200 rounded-full px-2.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    {faq}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviar()}
                  placeholder="Pregúntame algo..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-prestigio-500"
                  disabled={cargando}
                />
                <button
                  onClick={enviar}
                  disabled={cargando || !mensaje.trim()}
                  className="bg-prestigio-900 text-white rounded-xl px-3 py-2 hover:bg-prestigio-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot button */}
      <motion.button
        onClick={() => setAbierto(!abierto)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!abierto ? { y: [0, -4, 0] } : {}}
        transition={!abierto ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
        className="w-16 h-16 bg-gradient-to-br from-prestigio-900 to-prestigio-700 rounded-full shadow-lg flex items-center justify-center border-4 border-white"
        title="Habla con el Asistente Prestigio"
      >
        {abierto ? <X size={24} className="text-white" /> : <span className="text-white text-xl font-bold">P</span>}
      </motion.button>

      {/* Notification dot */}
      {!abierto && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-oliva-500 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs font-bold">1</span>
        </motion.div>
      )}
    </div>
  )
}
