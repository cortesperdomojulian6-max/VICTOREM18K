import { NextRequest, NextResponse } from 'next/server'
import type { RequestListener } from 'http'
import { createExpressHandler } from '@/lib/express-adapter'

let handler: ReturnType<typeof createExpressHandler> | null = null

async function getHandler() {
  if (!handler) {
    const { default: app } = await import('../../../backend/server')
    handler = createExpressHandler(app as RequestListener)
  }
  return handler
}

async function handleRequest(request: NextRequest) {
  const h = await getHandler()
  return h(request)
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const DELETE = handleRequest
export const PATCH = handleRequest
