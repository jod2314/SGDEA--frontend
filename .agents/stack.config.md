# Stack Tecnológico — Frontend SGDEA

## Framework y Lenguaje
- Framework: React 18
- Bundler: Vite 4
- Lenguaje: TypeScript 5

## UI y Estado
- Estilos: CSS Modules / CSS vanilla
- Editor de texto enriquecido: Tiptap
- Gráficas: Recharts
- Estado global: AuthContext (Context API)
- Íconos: react-icons (patrón `IconsMd as any`)

## Comunicación con API
- Método: `auth.request<T>(endpoint, options)` — siempre incluye tokens y header `X-Empresa-ID`
- URL base: `VITE_API_URL` (variable de entorno)

## Testing
- Estado actual: ⚠️ SIN TESTS CONFIGURADOS
- Framework objetivo: Vitest + React Testing Library
- Cobertura mínima objetivo: 60% (a implementar en Fase 2)

## Build y Deploy
- Dev server: `npm run dev` (puerto 5173)
- Build producción: `npm run build` (tsc + vite build)
- Deploy actual: Vercel (`vercel.json` configurado)

## Convenciones del Proyecto
- Tipos: definir en `src/types/types.ts`
- Íconos: `import { IconsMd } from 'react-icons/md'; const MdIcon = (IconsMd as any).MdIcon`
- Rutas: respetar flujo `isOnboardingCompleted` para módulos operativos
