export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string | null
  category: string | null
  features: string[] | null
  stock: number | null
  created_at: string
}

export interface CartItem {
  id: number
  product_id: number
  cantidad: number
  name: string
  price: number
  image_url: string | null
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface Order {
  id: number
  numero_pedido: string
  total: number
  estado: string
  metodo_pago: string
  fecha: string
  items?: OrderItem[]
}

export interface OrderItem {
  product_id: number
  cantidad: number
  precio_unitario: number
}

export interface Address {
  id: number
  destinatario: string
  direccion: string
  ciudad: string
  departamento: string
  telefono: string
}

export interface User {
  id: number
  name: string
  email: string
  role?: string
  avatar_url: string | null
  registration_date: string
}

export interface AuthResponse {
  id: number
  name: string
  email: string
  role: string
  token: string
}
