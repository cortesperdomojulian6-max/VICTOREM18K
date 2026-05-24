'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const FAQ: Record<string, string> = {
  materiales: 'Los balines de oro laminado 18K combinan perfectamente con todos nuestros dijones. El neopreno negro y café son los más versátiles para cualquier diseño.',
  talla: 'La talla 17 de pulsera equivale aproximadamente a 22 balines de 6mm. Para una talla 16 serían unos 20 balines, y para talla 18 unos 24 balines.',
  cuidado: 'Recomendamos evitar el contacto con agua, perfumes y cremas. Guarda tu joya en su estuche y límpiala con un paño suave después de usarla.',
  tiempo: 'Cada pieza se fabrica a mano en Campoalegre, Huila. El tiempo de producción estimado es de 3 a 5 días hábiles, más el tiempo de envío.',
  dijones: 'Tenemos 16 dijones disponibles en categorías: religiosos, símbolos, amor, suerte y animales. Puedes verlos todos en el paso 2 del configurador.',
  personalizacion: 'Puedes elegir el tipo de balín (liso o diamantado), el color del metal (oro, plata, rosado o negro), el dije que más te guste y agregar neoprenos de color.',
}

function getAnswer(input: string): string | null {
  const lower = input.toLowerCase()
  if (lower.includes('material') || lower.includes('combin') || lower.includes('balín') || lower.includes('balin')) return FAQ.materiales
  if (lower.includes('talla') || lower.includes('medida') || lower.includes('tamaño') || lower.includes('tamano') || lower.includes('cm')) return FAQ.talla
  if (lower.includes('cuidado') || lower.includes('limpia') || lower.includes('agua') || lower.includes('guardar')) return FAQ.cuidado
  if (lower.includes('tiempo') || lower.includes('demora') || lower.includes('fabrica') || lower.includes('entrega') || lower.includes('día') || lower.includes('dia')) return FAQ.tiempo
  if (lower.includes('dijon') || lower.includes('dije') || lower.includes('disponible')) return FAQ.dijones
  if (lower.includes('personaliz') || lower.includes('paso') || lower.includes('configurador') || lower.includes('como')) return FAQ.personalizacion
  return null
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Hola! Soy tu asistente de personalización Victorem. ¿En qué puedo ayudarte a diseñar tu joya ideal?' },
  ])
  const [input, setInput] = useState('')
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')

    const answer = getAnswer(text)
    if (answer) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
      }, 400)
    } else {
      setShowWhatsApp(true)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Para esa consulta especializada, por favor escríbenos a nuestro WhatsApp: +57 310 787 5531. Te atenderemos personalmente.' },
        ])
      }, 400)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white shadow-2xl border border-black/10 overflow-hidden mb-2">
          <div className="bg-ebony px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-gold-400" />
              <span className="text-sm font-medium text-white">Asistente Victorem</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold-400 text-ebony'
                    : 'bg-white border border-black/5 text-stone shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {showWhatsApp && (
              <div className="flex justify-center mt-2">
                <a
                  href="https://wa.me/573107875531"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-black/5 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              placeholder="Escribe tu pregunta..."
              className="flex-1 border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold-400 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-3 py-2 bg-gold-400 text-ebony disabled:opacity-40 hover:bg-gold-300 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="size-14 rounded-full bg-gold-400 text-ebony shadow-xl hover:bg-gold-300 transition-all flex items-center justify-center"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  )
}
