'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Todos los campos son requeridos')
      return
    }
    setLoading(true)
    try {
      await api.post('/contact', form)
      toast.success('Mensaje enviado con éxito. Te responderemos pronto.')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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
            Contáctanos
          </h1>
          <p className="text-sm text-white/50 mt-3 max-w-lg">
            Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                id="contact-name"
                label="Nombre Completo"
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
              <Textarea
                id="contact-message"
                label="Mensaje"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
              />
              <Button type="submit" loading={loading}>
                <Send className="size-4 mr-2" /> Enviar Mensaje
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold text-ebony mb-6">
                Información de Contacto
              </h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Dirección', value: 'Campoalegre, Huila, Colombia' },
                  { icon: Phone, label: 'Teléfono', value: '+57 314 567 8910' },
                  { icon: Mail, label: 'Email', value: 'info@victorem.co' },
                  { icon: Clock, label: 'Horario', value: 'Lun - Sáb: 8:00 AM - 6:00 PM' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <item.icon className="size-5 text-gold-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-stone uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-ebony mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
