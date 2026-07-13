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

### [2026-07-13] — Reducción y modularización de componentes principales (Drawer.tsx)
**Contexto:** Ocultación del menú de "Gestión Documental" en la barra lateral.
**Qué falló / Qué se descubrió:** Al remover el bloque JSX del menú, el linter de TypeScript detecta múltiples variables declaradas pero no usadas correspondientes a los iconos en desuso de `react-icons/md`, lo que causaría warnings bloqueantes en compilaciones estrictas.
**Causa raíz:** Variables e importaciones redundantes de la biblioteca de iconos no removidas después de eliminar los NavLinks correspondientes del DOM.
**Solución aplicada:** Se removieron todas las importaciones y constantes de iconos que quedaron en desuso. Esto limpió las variables muertas y además redujo el tamaño del archivo de 278 a 115 líneas, cumpliendo con la regla de diseño de un máximo de 150 líneas por componente.
**Patrón / Regla derivada:** Cada vez que se remueva JSX o enlaces en el menú lateral, se debe limpiar de forma inmediata y sistemática todas las importaciones y constantes asociadas a fin de mantener el componente libre de código muerto y bajo el límite de tamaño.
**Agente involucrado:** `frontend-dev`

---

### [2026-07-13] — Prevención de Layout Reflows en Transiciones de Ancho y Márgenes (index.css)
**Contexto:** Transición de expansión/colapso de la barra lateral (Drawer) y márgenes de contenido.
**Qué falló / Qué se descubrió:** El validador de la skill `review-animations` bloqueó las transiciones en propiedades CSS no aceleradas por hardware como `width`, `padding` y `margin-left` por obligar al navegador a recalcular el flujo geométrico completo del layout (Reflow) a 60 FPS, degradando el rendimiento.
**Causa raíz:** Programación de animaciones en propiedades físicas de caja (box model) en lugar de usar transformaciones 2D (`transform: translate`) o transiciones instantáneas para redistribuciones mayores de pantalla.
**Solución aplicada:** Se desactivó el retraso/duración de las transiciones sobre `width` y `margin-left`, haciendo que el redimensionamiento del menú lateral y el margen del área principal sea instantáneo. Las animaciones restantes se limitaron estrictamente a opacidad (`opacity`) y transformaciones (`transform`).
**Patrón / Regla derivada:** Para animaciones de alto rendimiento en interfaces web de uso intensivo, nunca transicionar `width`, `height`, `margin` ni `padding`. El movimiento debe ser instantáneo o basarse puramente en transformaciones aceleradas por GPU.
**Agente involucrado:** `code-review-frontend`

---

### [2026-07-13] — Evitar parpadeo de estilos (FOUC) en carga inicial de temas en SPAs
**Contexto:** Carga del tema guardado en `localStorage` al recargar la página.
**Qué falló / Qué se descubrió:** El navegador cargaba primero los estilos por defecto (modo claro) y aplicaba las transiciones de fondo del body, y milisegundos después React inyectaba la clase `.dark-mode` tras cargar el script de JS, causando un parpadeo visual molesto ("theme flash").
**Causa raíz:** Asincronía en la inicialización del tema en React, que ocurre después del parsing inicial del DOM y del primer pintado (paint) del navegador.
**Solución aplicada:** Se inyectó un script síncrono inline al inicio del `<head>` en `index.html` para aplicar inmediatamente la clase `.dark-mode` y configurar la variable `--font-size-base` de forma síncrona, interceptando el primer pintado del navegador.
**Patrón / Regla derivada:** Para sistemas de temas en aplicaciones SPA de alto rendimiento, la inicialización del tema y tamaño de fuente de `localStorage` debe realizarse mediante un script síncrono bloqueante en el `<head>`, bloqueando el pintado inicial hasta que el tema correcto sea inyectado en la etiqueta `html`.
**Agente involucrado:** `frontend-dev`

---

### [2026-07-13] — Transiciones fluidas en Flexbox reemplazando display: none por visibility: hidden
**Contexto:** Colapso físico de textos en el menú lateral para centrar iconos.
**Qué falló / Qué se descubrió:** El uso de `display: none` para colapsar los textos anulaba la transición suave de opacidad del texto (`150ms`), causando que el texto desapareciera de golpe en lugar de desvanecerse progresivamente.
**Causa raíz:** La propiedad `display` no es animable o transicionable en CSS nativo y destruye de inmediato la renderización en el flujo geométrico.
**Solución aplicada:** Se reemplazó el `display: none` por una regla coordinada de transiciones de ancho y opacidad (`opacity: 0`, `width: 0`), combinada con `visibility: hidden` y `pointer-events: none` para ocultar físicamente el texto del flujo sin interrumpir la animación.
**Patrón / Regla derivada:** Para colapsar elementos en Flexbox manteniendo transiciones suaves, transicionar de manera asimétrica `width` y `opacity` a cero y aplicar `visibility: hidden` al final de la transición para anular la interactividad y lectura por accesibilidad.
**Agente involucrado:** `code-review-frontend`


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
