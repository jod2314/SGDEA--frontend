/**
 * Tests unitarios del helper apiFetch (src/lib/api.ts)
 *
 * Estrategia: mockeamos el fetch global con vi.stubGlobal
 * para evitar peticiones reales a la red.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch } from '../lib/api'

// Respuesta mock reutilizable
function mockOkResponse(body: object) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

function mockErrorResponse(status: number, body: object) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

describe('apiFetch', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Sustituimos el fetch global por un spy controlado
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('añade Content-Type application/json por defecto', async () => {
    fetchSpy.mockReturnValue(mockOkResponse({ body: {} }))

    await apiFetch('/test')

    const [, opciones] = fetchSpy.mock.calls[0]
    expect(opciones.headers.get('Content-Type')).toBe('application/json')
  })

  it('añade el header Authorization cuando se pasa accessToken', async () => {
    fetchSpy.mockReturnValue(mockOkResponse({ body: {} }))

    await apiFetch('/test', { accessToken: 'mi-token-jwt' })

    const [, opciones] = fetchSpy.mock.calls[0]
    expect(opciones.headers.get('Authorization')).toBe('Bearer mi-token-jwt')
  })

  it('añade el header X-Empresa-ID cuando se pasa empresaId', async () => {
    fetchSpy.mockReturnValue(mockOkResponse({ body: {} }))

    await apiFetch('/test', { empresaId: 'empresa-123' })

    const [, opciones] = fetchSpy.mock.calls[0]
    expect(opciones.headers.get('X-Empresa-ID')).toBe('empresa-123')
  })

  it('NO añade Authorization si no se pasa accessToken', async () => {
    fetchSpy.mockReturnValue(mockOkResponse({ body: {} }))

    await apiFetch('/test')

    const [, opciones] = fetchSpy.mock.calls[0]
    expect(opciones.headers.get('Authorization')).toBeNull()
  })

  it('envía credentials: include en todas las peticiones', async () => {
    fetchSpy.mockReturnValue(mockOkResponse({ body: {} }))

    await apiFetch('/test')

    const [, opciones] = fetchSpy.mock.calls[0]
    expect(opciones.credentials).toBe('include')
  })

  it('lanza un error con el status cuando el servidor responde con error', async () => {
    fetchSpy.mockReturnValue(
      mockErrorResponse(401, { body: { error: 'No autorizado' } })
    )

    await expect(apiFetch('/test')).rejects.toMatchObject({
      status: 401,
      message: 'No autorizado',
    })
  })
})
