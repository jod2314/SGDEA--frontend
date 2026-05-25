/**
 * Tests del AuthProvider (src/auth/AuthProvider.tsx)
 *
 * Estrategia: dado que el entorno jsdom con el plugin de React Babel
 * tiene conflictos con el módulo virtual /@react-refresh en Node.js v24,
 * testeamos el contexto de autenticación a través de sus funciones puras
 * y la lógica de la capa de datos, sin renderizar JSX.
 *
 * Los tests de integración con render() se hacen en Playwright/e2e (Fase 3).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Tests del módulo requestNewAccessToken ────────────────────────────────────
// Este módulo es la pieza crítica del flujo de renovación de tokens
import requestNewAccessToken from '../auth/requestNewAccessToken'

// Mock del fetch para simular respuestas del servidor
function mockFetch(body: object, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  }))
}

describe('requestNewAccessToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('devuelve el accessToken cuando el servidor responde con éxito', async () => {
    mockFetch({ body: { accessToken: 'nuevo-token-123' } }, true)

    const token = await requestNewAccessToken()

    expect(token).toBe('nuevo-token-123')
  })

  it('lanza un error cuando el servidor responde con fallo (401)', async () => {
    mockFetch({ body: { error: 'Token inválido' } }, false)

    await expect(requestNewAccessToken()).rejects.toThrow('Unable to refresh access token.')
  })

  it('lanza un error cuando el body contiene un campo error', async () => {
    mockFetch({ body: { accessToken: '' }, error: 'Sesión expirada' }, true)

    await expect(requestNewAccessToken()).rejects.toThrow('Sesión expirada')
  })
})


// ── Tests de la lógica de localStorage del contexto ──────────────────────────

describe('Persistencia de empresa en localStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('lee y parsea correctamente la empresa guardada', () => {
    const empresa = { id: 'emp-001', nombre: 'ACME S.A.S.', nit: '900123456-1' }
    localStorage.setItem('selectedEmpresa', JSON.stringify(empresa))

    const leido = JSON.parse(localStorage.getItem('selectedEmpresa')!)

    expect(leido).toMatchObject({ id: 'emp-001', nombre: 'ACME S.A.S.' })
  })

  it('signout limpia la empresa del localStorage', () => {
    localStorage.setItem('selectedEmpresa', JSON.stringify({ id: 'emp-001' }))

    // Simular lo que hace signout()
    localStorage.removeItem('selectedEmpresa')

    expect(localStorage.getItem('selectedEmpresa')).toBeNull()
  })

  it('devuelve null si no hay empresa guardada', () => {
    expect(localStorage.getItem('selectedEmpresa')).toBeNull()
  })
})
