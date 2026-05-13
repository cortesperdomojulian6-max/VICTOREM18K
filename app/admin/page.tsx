'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Package, TrendingUp, DollarSign, Trash2, RefreshCw } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AdminStats {
  total_usuarios: number
  total_productos: number
  total_pedidos: number
  ingresos: number
}

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  registration_date: string
}

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Acceso no autorizado')
      router.push('/')
      return
    }

    const load = async () => {
      try {
          const [statsData, usersData] = await Promise.all([
            api.get<AdminStats>('/admin/stats'),
            api.get<AdminUser[]>('/admin/users'),
          ])
        setStats(statsData)
        setUsers(usersData)
        setAuthorized(true)
      } catch {
        toast.error('No tienes permisos de administrador')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${userName}"? Esta acción no se puede deshacer.`)) return
    setDeleting(userId)
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success(`Usuario "${userName}" eliminado`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error al eliminar usuario')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="container-main py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-pearl/60 w-48" />
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-pearl/60" />
            ))}
          </div>
          <div className="h-64 bg-pearl/60" />
        </div>
      </div>
    )
  }

  if (!authorized) return null

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
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, label: 'Usuarios', value: stats.total_usuarios },
              { icon: Package, label: 'Pedidos', value: stats.total_pedidos },
              { icon: TrendingUp, label: 'Productos', value: stats.total_productos },
              { icon: DollarSign, label: 'Ingresos', value: formatPrice(stats.ingresos) },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 border border-black/4"
              >
                <card.icon className="size-8 text-gold-400 mb-3" />
                <p className="text-2xl font-heading font-semibold text-ebony">{card.value}</p>
                <p className="text-xs text-stone uppercase tracking-wider mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-white border border-black/4">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-pearl">
            <h2 className="font-heading text-xl font-medium text-ebony">
              Usuarios Registrados
            </h2>
            <span className="text-xs text-stone">{users.length} usuarios</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pearl/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Nombre</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Registro</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-pearl/30 hover:bg-snow/50 transition-colors">
                    <td className="px-6 py-4 text-stone font-mono text-xs">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="size-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ebony font-bold text-xs flex items-center justify-center shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-ebony">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone">{user.email}</td>
                    <td className="px-6 py-4 text-stone text-xs">
                      {new Date(user.registration_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={deleting === user.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === user.id ? (
                          <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone text-sm">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
