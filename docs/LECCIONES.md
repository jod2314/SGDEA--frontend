# 📚 Lecciones Aprendidas — Frontend SGDEA
## Protocolo de Orquestación v2.0

Este archivo registra causa raíz de fallos, patrones descubiertos y decisiones de arquitectura que deben recordarse. El orquestador lo actualiza al finalizar cada hito donde ocurra algo relevante.

---

## Formato de registro

```markdown
### [AAAA-MM-DD] — Título de la lección
**Contexto:** ¿Qué se estaba haciendo?
**Qué falló / Qué se descubrió:** Descripción precisa
**Causa raíz:** Por qué ocurrió
**Solución aplicada:** Qué se hizo para resolverlo
**Patrón / Regla derivada:** Lo que debe recordarse para el futuro
**Agente involucrado:** [nombre del agente]
```

---

## Registro

### [2026-06-07] — Tipado estricto del retorno de la API en el frontend
**Contexto:** Refactorización e interactividad del Asistente de Onboarding bloqueante (`AsistenteOnboarding.tsx`) y los nuevos subcomponentes.
**Qué falló / Qué se descubrió:** Durante el build del frontend (`tsc`), se detectaron errores de tipo `Property 'statusCode' does not exist on type...` y `Property 'body' does not exist on type...` al procesar los retornos de `auth.request<T>()`.
**Causa raíz:** En la versión previa, `auth.request<T>()` devolvía directamente el tipo de la respuesta serializada. Al intentar estructurar las respuestas como wrappers estandarizados con `{ statusCode, body }` desde el backend, TypeScript arrojaba errores por incompatibilidad estructural.
**Solución aplicada:** Se definió la interfaz genérica `ApiResponse<T>` en `src/types/types.ts` con la firma `{ statusCode: number; body: T & { error?: string } }` y se inyectó en los llamados de `auth.request<ApiResponse<T>>`.
**Patrón / Regla derivada:** Todas las peticiones API del frontend que esperen un envoltorio estructurado de respuesta del backend deben tipar explícitamente el llamado usando la interfaz `ApiResponse<T>` para no violar la compilación estricta.
**Agente involucrado:** `frontend-dev`


---

## 🔍 Búsqueda rápida por etiqueta

Para buscar lecciones por tema, usar `Ctrl+F` con las siguientes etiquetas:

- `[TIPO_ERROR]` — Error de TypeScript
- `[LINT]` — Error de ESLint
- `[API]` — Problema con auth.request o endpoints
- `[ICONS]` — Problema con el patrón de íconos
- `[PERFORMANCE]` — Problema de bundle o carga
- `[SEGURIDAD]` — Problema de seguridad detectado
- `[ARQUITECTURA]` — Decisión de diseño importante
- `[REDUNDANCIA]` — Componente o función duplicada detectada
