import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Correo inválido.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await pool.query(
    'SELECT id FROM newsletter_subscribers WHERE email = $1',
    [normalizedEmail]
  )
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Ya estás suscripto.' }, { status: 409 })
  }

  const result = await pool.query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1) RETURNING id, created_at`,
    [normalizedEmail]
  )

  return NextResponse.json({ success: true, id: result.rows[0].id })
}
