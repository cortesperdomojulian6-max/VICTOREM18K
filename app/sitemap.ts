import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://victorem.co', lastModified: new Date() },
    { url: 'https://victorem.co/catalogo', lastModified: new Date() },
    { url: 'https://victorem.co/historia', lastModified: new Date() },
    { url: 'https://victorem.co/contacto', lastModified: new Date() },
    { url: 'https://victorem.co/personalizacion', lastModified: new Date() },
    { url: 'https://victorem.co/cuidado', lastModified: new Date() },
    { url: 'https://victorem.co/politicas', lastModified: new Date() },
    { url: 'https://victorem.co/terminos', lastModified: new Date() },
  ]
}
