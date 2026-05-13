'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulated — in production, send to API or email service
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Mensaje enviado. Te responderemos pronto.')
    setForm({ name: '', email: '', message: '' })
    setLoading(false)
  }

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Contacto</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Contacto
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="font-heading text-2xl font-medium text-ebony">Hablemos</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Dirección', value: 'Calle 20 #9-59, Campoalegre, Huila' },
                  { icon: Phone, label: 'Teléfono', value: '+57 310 787 5531' },
                  { icon: Mail, label: 'Email', value: 'info@victorem.co' },
                  { icon: Clock, label: 'Horario', value: 'Lun - Sáb: 9:00 AM - 6:00 PM' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="size-10 flex items-center justify-center bg-cream shrink-0">
                      <item.icon className="size-5 text-gold-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-sm text-ebony">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 border border-black/4 shadow-sm">
              <h3 className="font-heading text-xl font-medium text-ebony mb-2">Envíanos un mensaje</h3>
              <Input
                id="contact-name"
                label="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="contact-email"
                label="Correo Electrónico"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-xs font-medium text-iron tracking-wide">
                  Mensaje
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-white border border-pearl text-sm font-body text-iron focus:outline-none focus:border-gold-400 transition-colors resize-none"
                />
              </div>
              <Button type="submit" loading={loading} className="w-full">
                <Send className="size-4 mr-2" />
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
