const { describe, it, expect, beforeAll, afterAll } = require('vitest')
const request = require('supertest')
const app = require('../server')
const db = require('../db')

describe('Auth API', () => {
  const testUser = { name: 'Test User', email: `test_${Date.now()}@victorem.co`, password: 'Test123!' }

  it('POST /api/auth/register → 201', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('name', testUser.name)
  })

  it('POST /api/auth/register con email duplicado → 409', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.status).toBe(409)
  })

  it('POST /api/auth/login → 200', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('POST /api/auth/login con contraseña incorrecta → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me sin token → 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me con token → 200', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password })
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('email', testUser.email)
  })
})
