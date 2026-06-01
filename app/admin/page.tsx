'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Package, TrendingUp, DollarSign, Trash2, RefreshCw, Edit3, Plus, X, Check, Search } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { formatPrice, productImageUrl } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'

interface AdminStats {
  total_usuarios: number; total_productos: number; total_pedidos: number; ingresos: number
}

interface AdminUser { id: number; name: string; email: string; role: string; registration_date: string }

interface AdminOrder { id: number; numero_pedido: string; total: string; estado: string; metodo_pago: string; fecha: string; user_name: string; user_email: string }

interface AdminProduct { id: number; name: string; description: string; price: string; image_url: string; category: string; category_id: number; stock: number; active: boolean }

type Tab = 'dashboard' | 'products' | 'orders' | 'users'

const STATUS_FLOW = ['pendiente', 'pagado', 'confirmado', 'enviado', 'entregado'] as const

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-blue-100 text-blue-700',
  confirmado: 'bg-gold-100 text-gold-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [deleting, setDeleting] = useState<number | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image_url: '', stock: 0, category_id: '' })
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])

  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Acceso no autorizado')
      router.push('/')
      return
    }

    if (isAuthenticated) {
      const load = async () => {
        try {
          const [statsData, usersData, ordersData, productsData, categoriesData] = await Promise.all([
            api.get<AdminStats>('/admin/stats'),
            api.get<AdminUser[]>('/admin/users'),
            api.get<AdminOrder[]>('/admin/orders'),
            api.get<AdminProduct[]>('/admin/products'),
            api.get<{ id: number; name: string; slug: string }[]>('/categories'),
          ])
          setStats(statsData); setUsers(usersData); setOrders(ordersData); setProducts(productsData); setCategories(categoriesData)
          setAuthorized(true)
        } catch { toast.error('No tienes permisos de administrador'); router.push('/') }
        finally { setLoading(false) }
      }
      load()
    }
  }, [isAuthenticated, authLoading, router])

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Eliminar a "${userName}"?`)) return
    setDeleting(userId)
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success(`Usuario eliminado`); setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Error') }
    finally { setDeleting(null) }
  }

  const handleUpdateStatus = async (orderId: number, estado: string) => {
    setUpdatingOrder(orderId)
    try {
      await api.put(`/admin/orders/${orderId}/status`, { estado })
      toast.success(`Orden actualizada a "${estado}"`)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, estado } : o))
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Error') }
    finally { setUpdatingOrder(null) }
  }

  const handleDeleteProduct = async (productId: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    try {
      await api.delete(`/admin/products/${productId}`)
      toast.success(`Producto eliminado`); setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Error') }
  }

  const openProductForm = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({ name: product.name, description: product.description || '', price: product.price, image_url: product.image_url || '', stock: product.stock, category_id: String(product.category_id || '') })
    } else {
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', image_url: '', stock: 0, category_id: '' })
    }
    setShowProductModal(true)
  }

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) { toast.error('Nombre y precio requeridos'); return }
    if (!productForm.category_id) { toast.error('Selecciona una categoría'); return }
    try {
      const body = { ...productForm, category_id: Number(productForm.category_id), price: Number(productForm.price) }
      if (editingProduct) {
        const updated = await api.put<AdminProduct>(`/admin/products/${editingProduct.id}`, body)
        setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...updated } : p))
        toast.success('Producto actualizado')
      } else {
        const created = await api.post<AdminProduct>('/admin/products', body)
        setProducts((prev) => [...prev, created])
        toast.success('Producto creado')
      }
      setShowProductModal(false)
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Error') }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container-main py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-32 bg-pearl/60" />))}
          </div>
          <div className="h-64 bg-pearl/60" />
        </div>
      </div>
    )
  }

  if (authLoading || !authorized) return null

  const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'products', label: 'Productos', icon: Package },
    { key: 'orders', label: 'Pedidos', icon: Package },
    { key: 'users', label: 'Usuarios', icon: Users },
  ]

  return (
    <>
      <div className="bg-ebony/90">
        <div className="container-main py-14 md:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 mb-6">
            <a href="/" className="hover:text-gold-400 transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-white/80">Admin</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-5xl font-light text-white tracking-[0.08em]">
            Panel de Administración
          </h1>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="flex gap-1 mb-10 border-b border-pearl">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                tab === t.key ? 'border-gold-400 text-gold-400' : 'border-transparent text-stone hover:text-ebony'
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            {tab === 'dashboard' && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: Users, label: 'Usuarios', value: stats.total_usuarios },
                  { icon: Package, label: 'Pedidos', value: stats.total_pedidos },
                  { icon: TrendingUp, label: 'Productos', value: stats.total_productos },
                  { icon: DollarSign, label: 'Ingresos', value: formatPrice(stats.ingresos) },
                ].map((card, i) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 border border-black/4"
                  >
                    <card.icon className="size-8 text-gold-400 mb-3" />
                    <p className="text-2xl font-heading font-semibold text-ebony">{card.value}</p>
                    <p className="text-xs text-stone uppercase tracking-wider mt-1">{card.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {tab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
                    <input
                      type="text" placeholder="Buscar productos..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-pearl text-sm focus:outline-none focus:border-gold-400"
                    />
                  </div>
                  <ButtonAdd onClick={() => openProductForm()} />
                </div>

                <div className="bg-white border border-black/4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-pearl/50 bg-snow">
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Producto</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Precio</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Stock</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-pearl/30 hover:bg-snow/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-10 bg-cream flex items-center justify-center text-xs text-stone overflow-hidden">
                                {p.image_url ? <img src={productImageUrl(p.image_url) ?? undefined} alt="" className="size-full object-cover" /> : <Package className="size-5" />}
                              </div>
                              <span className="font-medium text-ebony">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone">{formatPrice(Number(p.price))}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openProductForm(p)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gold-400 hover:bg-gold-400/5 transition-colors">
                              <Edit3 className="size-3.5" /> Editar
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id, p.name)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-12 text-center text-stone text-sm">No hay productos</td></tr>
                      )}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="bg-white border border-black/4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pearl/50 bg-snow">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Pedido</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Total</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Estado</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-pearl/30 hover:bg-snow/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-stone">#{o.numero_pedido}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ebony">{o.user_name}</p>
                          <p className="text-xs text-stone">{o.user_email}</p>
                        </td>
                        <td className="px-4 py-3 font-heading font-semibold text-gold-400">{formatPrice(Number(o.total))}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.estado}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            disabled={updatingOrder === o.id}
                            className={`text-xs font-semibold px-2 py-1 border-none cursor-pointer ${STATUS_COLORS[o.estado] || 'bg-pearl text-stone'}`}
                          >
                            {[...STATUS_FLOW, 'cancelado'].map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone">{new Date(o.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-stone text-sm">No hay pedidos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-white border border-black/4">
                <div className="flex items-center justify-between p-4 pb-3 border-b border-pearl">
                  <h2 className="font-heading text-lg font-medium text-ebony">Usuarios Registrados</h2>
                  <span className="text-xs text-stone">{users.length} usuarios</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pearl/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Registro</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-pearl/30 hover:bg-snow/50 transition-colors">
                        <td className="px-4 py-3 text-stone font-mono text-xs">#{user.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="size-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-xs flex items-center justify-center shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-ebony">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone">{user.email}</td>
                        <td className="px-4 py-3 text-stone text-xs">
                          {new Date(user.registration_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteUser(user.id, user.name)} disabled={deleting === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleting === user.id ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-stone text-sm">No hay usuarios</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowProductModal(false) }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg p-8 mx-4 border border-gold-400/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-semibold text-ebony">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-silver hover:text-ebony transition-colors">
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-iron tracking-wide mb-1">Nombre</label>
                  <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-iron tracking-wide mb-1">Descripción</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400 min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-iron tracking-wide mb-1">Precio</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-iron tracking-wide mb-1">Stock</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-iron tracking-wide mb-1">Categoría</label>
                  <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400 bg-white">
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-iron tracking-wide mb-1">Imagen</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        placeholder="URL de imagen..."
                        className="w-full px-3.5 py-3 border border-pearl text-sm focus:outline-none focus:border-gold-400" />
                    </div>
                    <label className="shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider bg-ebony text-white hover:bg-ebony/80 cursor-pointer transition-colors">
                      <Plus className="size-4" /> Subir
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) { toast.error('La imagen debe ser menor a 2MB'); return }
                        const reader = new FileReader()
                        reader.onload = async () => {
                          try {
                            const result = await api.post<{ url: string }>('/upload', { file: reader.result, filename: file.name })
                            setProductForm({ ...productForm, image_url: result.url })
                            toast.success('Imagen subida')
                          } catch { toast.error('Error al subir imagen') }
                        }
                        reader.readAsDataURL(file)
                      }} />
                    </label>
                  </div>
                  {productForm.image_url && (
                    <img src={productImageUrl(productForm.image_url) ?? undefined} alt="Preview" className="mt-2 h-24 w-24 object-cover border border-pearl" />
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-8 justify-end">
                <button onClick={() => setShowProductModal(false)}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone hover:text-ebony transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveProduct}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-gold-400 text-ebony hover:bg-gold-500 transition-colors">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ButtonAdd({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gold-400 text-ebony hover:bg-gold-500 transition-colors"
    >
      <Plus className="size-4" /> Nuevo Producto
    </button>
  )
}
