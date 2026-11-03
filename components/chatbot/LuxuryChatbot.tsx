'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Bot, User } from 'lucide-react'
import { STORE_KNOWLEDGE } from '@/lib/chatbot-knowledge'

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function LuxuryChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: STORE_KNOWLEDGE.welcome, 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    const currentInput = input.toLowerCase()
    setInput('')
    setIsTyping(true)

    // Simulamos tiempo de pensamiento para que sea natural
    await new Promise(resolve => setTimeout(resolve, 1200))

    let botResponse = "Lamento no haber comprendido exactamente tu consulta. ¿Podrías darme más detalles o intentar con otras palabras? También puedes contactarnos directamente vía WhatsApp para una atención personalizada."

    // Lógica de búsqueda de intención (Keywords)
    for (const key in STORE_KNOWLEDGE) {
      if (key === 'welcome') continue;
      const category = STORE_KNOWLEDGE[key as keyof typeof STORE_KNOWLEDGE] as any;
      if (category.keywords && category.keywords.some((kw: string) => currentInput.includes(kw))) {
        botResponse = category.response;
        break;
      }
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, botMsg])
    setIsTyping(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="size-16 rounded-full bg-gold-400 text-ebony shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <MessageCircle className="size-8" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-ebony border border-gold-400/30 w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold-600 to-gold-400 p-4 flex items-center justify-between text-ebony">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-ebony flex items-center justify-center">
                  <Bot className="size-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tighter">Victorem AI</p>
                  <p className="text-[10px] opacity-80">Asistente de Lujo en línea</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-zinc-900/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.sender === 'bot' ? 'bg-gold-400 text-ebony' : 'bg-zinc-700 text-white'}`}>
                      {msg.sender === 'bot' ? <Bot className="size-3" /> : <User className="size-3" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'bot' 
                        ? 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700' 
                        : 'bg-gold-400 text-ebony rounded-tr-none font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-zinc-700">
                    <div className="flex gap-1">
                      <span className="size-1 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu duda aquí..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button 
                onClick={handleSend}
                className="size-9 rounded-full bg-gold-400 text-ebony flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
