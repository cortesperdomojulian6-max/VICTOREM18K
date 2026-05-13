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

    const req = Object.assign(new Readable({
      read() {
        if (bodyBuffer) this.push(bodyBuffer)
        this.push(null)
      },
    }), {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      socket: { setTimeout: () => {} },
      connection: { setTimeout: () => {} },
    })

    const chunks: Buffer[] = []
    let statusCode = 200
    let responseHeaders: Record<string, string | string[]> = {}

    const serverRes = {
      statusCode: 200,
      statusMessage: 'OK',

      writeHead: (status: number, ...args: unknown[]) => {
        statusCode = status
        if (args.length > 0) {
          const last = args[args.length - 1]
          if (typeof last === 'object' && last !== null) {
            responseHeaders = last as Record<string, string | string[]>
          }
        }
        return serverRes
      },

      write: (chunk: unknown) => {
        if (chunk !== null && chunk !== undefined) chunks.push(toBuffer(chunk))
        return true
      },

      end: (_chunk?: unknown) => {
        if (_chunk !== null && _chunk !== undefined) chunks.push(toBuffer(_chunk))
        return serverRes
      },

      setHeader: (name: string, value: string | string[]) => {
        responseHeaders[name] = value
        return serverRes
      },

      getHeaders: () => responseHeaders,
      getHeader: (name: string) => responseHeaders[name],
      removeHeader: (name: string) => { delete responseHeaders[name] },
    }

    await new Promise<void>((resolve, reject) => {
      serverRes.end = (chunk?: unknown) => {
        if (chunk !== null && chunk !== undefined) chunks.push(toBuffer(chunk))
        resolve()
        return serverRes
      }

      try {
        app(req as never, serverRes as never)
      } catch (err) {
        reject(err)
      }
    })

    const buffer = Buffer.concat(chunks)
    return new NextResponse(buffer.length > 0 ? new Uint8Array(buffer) : null, {
      status: statusCode,
      headers: responseHeaders as Record<string, string>,
    })
  }
}
