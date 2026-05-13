import { NextRequest, NextResponse } from 'next/server'
import type { RequestListener } from 'http'
import { Readable } from 'stream'

function toBuffer(chunk: unknown): Buffer {
  if (chunk instanceof Buffer) return chunk
  if (chunk instanceof Uint8Array) return Buffer.from(chunk)
  if (typeof chunk === 'string') return Buffer.from(chunk)
  return Buffer.from(String(chunk))
}

export function createExpressHandler(app: RequestListener) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const url = new URL(request.url)

    const bodyBuffer =
      request.method !== 'GET' && request.method !== 'HEAD'
        ? Buffer.from(await request.arrayBuffer())
        : undefined

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    const req = Object.assign(new Readable({
      read() {
        if (bodyBuffer) this.push(bodyBuffer)
        this.push(null)
      },
    }), {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      ip,
      socket: { setTimeout: () => {}, destroy: () => {} },
      connection: { setTimeout: () => {} },
    })

    const chunks: Buffer[] = []
    const responseHeaders: Record<string, string | string[]> = {}
    let resolvePromise: (() => void) | null = null

    const serverRes = {
      statusCode: 200,
      statusMessage: 'OK',
      headersSent: false,

      writeHead(status: number, ...args: unknown[]) {
        serverRes.statusCode = status
        if (args.length > 0) {
          const last = args[args.length - 1]
          if (typeof last === 'object' && last !== null) {
            Object.assign(responseHeaders, last)
          }
        }
        serverRes.headersSent = true
        return this
      },

      write(chunk: unknown) {
        if (chunk !== null && chunk !== undefined) chunks.push(toBuffer(chunk))
        return true
      },

      end(chunk?: unknown) {
        if (chunk !== null && chunk !== undefined) chunks.push(toBuffer(chunk))
        serverRes.headersSent = true
        if (resolvePromise) resolvePromise()
        return this
      },

      setHeader(name: string, value: string | string[]) {
        responseHeaders[name] = value
        return this
      },

      getHeaders() { return responseHeaders },
      getHeader(name: string) { return responseHeaders[name] },
      hasHeader(name: string) { return name in responseHeaders },
      removeHeader(name: string) { delete responseHeaders[name] },
    }

    await new Promise<void>((resolve, reject) => {
      resolvePromise = resolve
      try {
        app(req as never, serverRes as never)
      } catch (err) {
        reject(err)
      }
    })

    const buffer = Buffer.concat(chunks)
    return new NextResponse(buffer.length > 0 ? new Uint8Array(buffer) : null, {
      status: serverRes.statusCode,
      headers: responseHeaders as Record<string, string>,
    })
  }
}

