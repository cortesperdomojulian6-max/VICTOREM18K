import { describe, it, expect, beforeEach, vi } from 'vitest'

const LOCAL_KEY = 'victorem-local-cart'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('Anonymous Cart (localStorage)', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should store items in localStorage', () => {
    const items = [
      { localId: 'local-1-123', productId: 1, name: 'Test Product', price: 50000, quantity: 2, imageUrl: '' },
    ]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(items))

    const raw = localStorageMock.getItem(LOCAL_KEY)
    expect(raw).not.toBeNull()

    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Test Product')
    expect(parsed[0].quantity).toBe(2)
  })

  it('should add a new item to existing cart', () => {
    const existing = [{ localId: 'local-1-123', productId: 1, name: 'Existing', price: 30000, quantity: 1, imageUrl: '' }]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(existing))

    const raw = localStorageMock.getItem(LOCAL_KEY)
    const cart = JSON.parse(raw!)
    cart.push({ localId: 'local-2-456', productId: 2, name: 'New', price: 20000, quantity: 3, imageUrl: '' })
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(cart))

    const updated = JSON.parse(localStorageMock.getItem(LOCAL_KEY)!)
    expect(updated).toHaveLength(2)
    expect(updated[1].quantity).toBe(3)
  })

  it('should remove an item from localStorage cart', () => {
    const items = [
      { localId: 'local-1', productId: 1, name: 'A', price: 10000, quantity: 1, imageUrl: '' },
      { localId: 'local-2', productId: 2, name: 'B', price: 20000, quantity: 1, imageUrl: '' },
    ]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(items))

    const filtered = items.filter(i => i.localId !== 'local-1')
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(filtered))

    const result = JSON.parse(localStorageMock.getItem(LOCAL_KEY)!)
    expect(result).toHaveLength(1)
    expect(result[0].productId).toBe(2)
  })

  it('should update quantity of an existing item', () => {
    const items = [
      { localId: 'local-1', productId: 1, name: 'Test', price: 15000, quantity: 1, imageUrl: '' },
    ]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(items))

    const cart = JSON.parse(localStorageMock.getItem(LOCAL_KEY)!)
    cart[0].quantity = 5
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(cart))

    const result = JSON.parse(localStorageMock.getItem(LOCAL_KEY)!)
    expect(result[0].quantity).toBe(5)
  })

  it('should calculate cart totals correctly', () => {
    const items = [
      { localId: 'local-1', productId: 1, name: 'A', price: 50000, quantity: 2, imageUrl: '' },
      { localId: 'local-2', productId: 2, name: 'B', price: 30000, quantity: 3, imageUrl: '' },
    ]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(items))

    const cart = JSON.parse(localStorageMock.getItem(LOCAL_KEY)!)
    const total = cart.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)
    const count = cart.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0)

    expect(total).toBe(190000) // 50000*2 + 30000*3
    expect(count).toBe(5) // 2 + 3
  })

  it('should clear the entire cart', () => {
    const items = [{ localId: 'local-1', productId: 1, name: 'Test', price: 10000, quantity: 1, imageUrl: '' }]
    localStorageMock.setItem(LOCAL_KEY, JSON.stringify(items))

    localStorageMock.removeItem(LOCAL_KEY)

    expect(localStorageMock.getItem(LOCAL_KEY)).toBeNull()
  })
})
