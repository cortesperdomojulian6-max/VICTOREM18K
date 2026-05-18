const { describe, it, expect, beforeAll } = require('vitest')
const request = require('supertest')
const app = require('../server')

describe('Products API', () => {
  it('GET /api/products → 200 + array', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/products/:id inexistente → 404', async () => {
    const res = await request(app).get('/api/products/99999')
    expect(res.status).toBe(404)
  })
})
