import { MetadataRoute } from 'next'
import { api } from '@/lib/api'
import type { Product } from '@/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://victorem.co'

  // Rutas estáticas
  const routes = [
    '',
    '/catalogo',
    '/personalizacion',
    '/historia',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Rutas dinámicas de productos
    const products = await api.get<Product[]>('/products')
    
    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/catalogo?id=${product.id}`,
      lastModified: new Date(product.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...routes, ...productRoutes]
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return routes
  }
}
