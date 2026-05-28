import { describe, it, expect } from 'vitest'
import { formatPrice, cn, slugify, truncate } from '@/lib/utils'

describe('formatPrice', () => {
  it('formatea 80000 como $80.000', () => {
    expect(formatPrice(80000)).toContain('80.000')
  })

  it('formatea 0 como $0', () => {
    expect(formatPrice(0)).toContain('0')
  })

  it('formatea 150000 como $150.000', () => {
    expect(formatPrice(150000)).toContain('150.000')
  })

  it('incluye el símbolo de pesos', () => {
    expect(formatPrice(50000)).toContain('$')
  })
})

describe('cn', () => {
  it('combina clases correctamente', () => {
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
  })

  it('maneja clases condicionales', () => {
    expect(cn('base', true && 'visible', false && 'hidden')).toBe('base visible')
  })
})

describe('slugify', () => {
  it('convierte texto a slug', () => {
    expect(slugify('Hola Mundo')).toBe('hola-mundo')
  })

  it('maneja caracteres especiales', () => {
    expect(slugify('¡Feliz Año Nuevo!')).toBe('feliz-ano-nuevo')
  })
})

describe('truncate', () => {
  it('trunca texto largo', () => {
    expect(truncate('Hola Mundo Cruel', 9)).toBe('Hola Mund…')
  })

  it('no trunca texto corto', () => {
    expect(truncate('Hola', 10)).toBe('Hola')
  })
})
