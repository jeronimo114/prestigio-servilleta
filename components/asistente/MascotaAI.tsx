'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle } from 'lucide-react'
import type { Message } from '@/lib/ai-client'

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
      content: '¡Hola! Soy Finny 🐦 Tu guía financiero del PAE. ¿Tienes alguna duda sobre lo que estás ingresando? ¡Pregúntame!',
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
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">🐦</div>
                <div>
                  <p className="text-white font-semibold text-sm">Finny</p>
                  <p className="text-blue-200 text-xs">Asistente PAE</p>
                </div>
              </div>
              <button onClick={() => setAbierto(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" style={{ minHeight: '240px', maxHeight: '320px' }}>
              {historial.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🐦</div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
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

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviar()}
                  placeholder="Pregúntame algo..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
                  disabled={cargando}
                />
                <button
                  onClick={enviar}
                  disabled={cargando || !mensaje.trim()}
                  className="bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg flex items-center justify-center text-2xl border-4 border-white"
        title="Habla con Finny"
      >
        {abierto ? <X size={24} className="text-white" /> : '🐦'}
      </motion.button>

      {/* Notification dot */}
      {!abierto && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs font-bold">1</span>
        </motion.div>
      )}
    </div>
  )
}
