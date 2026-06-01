'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Package, MapPin, Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { User as UserType, Order, Address } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'

export type Tab = 'profile' | 'orders' | 'addresses'

function ProfileTab({ user, onUpdate }: { user: UserType; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { toast.error('El nombre es requerido'); return }
    setLoading(true)
    try {
      await api.put('/users/profile', { name: name.trim(), email: email.trim() })
      toast.success('Perfil actualizado')
      setEditing(false)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-elevated p-8 border border-subtle">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gold-400/30">
        <h2 className="font-heading text-xl font-medium text-primary">Mi Perfil</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-gold-400 hover:text-gold-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Pencil className="size-3.5" /> Editar
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="size-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-2xl flex items-center justify-center shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-heading text-lg font-medium text-primary">{user.name}</p>
          <p className="text-xs text-muted">Miembro desde {new Date(user.registration_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4 max-w-md">
          <Input id="profile-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="profile-email" label="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button loading={loading} onClick={handleSave}>
              <Check className="size-4 mr-2" /> Guardar
            </Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setName(user.name); setEmail(user.email) }}>
              <X className="size-4 mr-2" /> Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-md">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Correo Electrónico</span>
            <p className="text-sm text-primary mt-0.5">{user.email}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order[]>('/orders')
      .then(setOrders)
      .catch(() => toast.error('Error al cargar pedidos'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-elevated p-6 border border-subtle">
            <div className="h-5 bg-pearl/60 w-48 mb-3" />
            <div className="h-4 bg-pearl/40 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-elevated p-8 border border-subtle text-center">
        <Package className="size-12 text-pearl mx-auto mb-4" />
        <h3 className="font-heading text-lg font-medium text-primary mb-2">Sin pedidos aún</h3>
        <p className="text-sm text-muted mb-6">Cuando realices tu primera compra, aquí podrás ver el estado de tus pedidos.</p>
        <a href="/catalogo">
          <Button>Explorar Catálogo</Button>
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-elevated p-6 border border-subtle hover:border-gold-400/25 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-heading text-base font-medium text-primary">
                Pedido #{order.numero_pedido}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {new Date(order.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-wider ${
                order.estado === 'entregado' ? 'bg-green-100 text-green-700' :
                order.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                order.estado === 'enviado' ? 'bg-blue-100 text-blue-700' :
                'bg-gold-100 text-gold-700'
              }`}>
                {order.estado}
              </span>
              <p className="text-sm font-semibold text-gold-400 mt-1.5">{formatPrice(Number(order.total))}</p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Pago: {order.metodo_pago === 'wompi' ? 'Wompi' : 'Transferencia'}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ destinatario: '', direccion: '', ciudad: '', departamento: '', telefono: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api.get<Address[]>('/addresses')
      .then(setAddresses)
      .catch(() => toast.error('Error al cargar direcciones'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm({ destinatario: '', direccion: '', ciudad: '', departamento: '', telefono: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.destinatario.trim() || !form.direccion.trim() || !form.ciudad.trim() || !form.departamento.trim() || !form.telefono.trim()) {
      toast.error('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form)
        toast.success('Dirección actualizada')
      } else {
        await api.post('/addresses', form)
        toast.success('Dirección agregada')
      }
      resetForm()
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección?')) return
    try {
      await api.delete(`/addresses/${id}`)
      toast.success('Dirección eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const startEdit = (addr: Address) => {
    setForm({ destinatario: addr.destinatario, direccion: addr.direccion, ciudad: addr.ciudad, departamento: addr.departamento, telefono: addr.telefono })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-elevated p-6 border border-subtle">
            <div className="h-5 bg-pearl/60 w-48 mb-3" />
            <div className="h-4 bg-pearl/40 w-64" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-medium text-primary">Mis Direcciones</h2>
        {!showForm && (
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="size-3.5 mr-1.5" /> Agregar
          </Button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-hover p-6 border border-gold-400/30 mb-6">
          <h3 className="font-heading text-base font-medium text-primary mb-4">
            {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input id="addr-destinatario" label="Destinatario" value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Input id="addr-direccion" label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <Input id="addr-ciudad" label="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <Input id="addr-depto" label="Departamento" value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
            <Input id="addr-telefono" label="Teléfono" type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button size="sm" loading={saving} onClick={handleSave}>
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </motion.div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-elevated p-8 border border-subtle text-center">
          <MapPin className="size-12 text-pearl mx-auto mb-4" />
          <p className="text-sm text-muted">No tienes direcciones guardadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-elevated p-6 border border-subtle flex items-start justify-between gap-4 hover:border-gold-400/25 transition-colors">
              <div>
                <p className="font-medium text-sm text-primary">{addr.destinatario}</p>
                <p className="text-sm text-muted mt-1">{addr.direccion}</p>
                <p className="text-sm text-muted">{addr.ciudad}, {addr.departamento}</p>
                <p className="text-sm text-muted">{addr.telefono}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(addr)} className="size-8 flex items-center justify-center text-muted hover:text-gold-400 hover:bg-gold-400/10 transition-all" aria-label="Editar">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="size-8 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-all" aria-label="Eliminar">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function MiPerfilClient({ initialTab }: { initialTab?: Tab }) {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>(initialTab ?? 'profile')

  const { user: authUser, isAuthenticated, isLoading: authLoading, logout } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Debes iniciar sesión')
      router.push('/')
      return
    }
    
    if (isAuthenticated) {
      api.get<UserType>('/users/profile')
        .then(setUser)
        .catch(() => { logout(); router.push('/') })
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, authLoading, router, logout])

  if (loading || authLoading) {
    return (
      <div className="container-main py-20">
        <div className="animate-pulse max-w-3xl mx-auto space-y-4">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="h-64 bg-pearl/60" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const TABS: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'orders', label: 'Pedidos', icon: Package },
    { key: 'addresses', label: 'Direcciones', icon: MapPin },
  ]

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Mi Perfil</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Mi Perfil
          </h1>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="flex flex-col md:flex-row gap-2 mb-8 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {tab === 'profile' && <ProfileTab user={user} onUpdate={() => api.get<UserType>('/users/profile').then(setUser)} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'addresses' && <AddressesTab />}
        </div>
      </div>
    </>
  )
}
