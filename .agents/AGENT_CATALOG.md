# 📋 Catálogo de Agentes — Frontend SGDEA
## Protocolo de Orquestación v2.0

Registro del **equipo permanente de 7 agentes** del repo frontend.

> **Regla de oro:** Ningún agente toca archivos fuera de su scope sin autorización explícita del orquestador.  
> Si un agente necesita hacerlo, emite un `HANDOFF_REQUEST` al orquestador detallando qué archivo y por qué.

---

## 🎭 Equipo Permanente

| Rol | Nombre | Especialidad | Scope de archivos | Prompt base | Estado |
|:---:|:-------|:-------------|:------------------|:------------|:------:|
| 🏛️ Arquitecto | `architect` | Cimientos de UI (ui-ux-pro-max), contratos, modelo datos | `docs/architecture/*`, `PROXIMA_TAREA.md` | `.agents/prompts/architect.md` | ✅ Activo |
| 🖥️ Frontend Dev | `frontend-dev` | Páginas, componentes, estilos, físicas (emil-design-eng) | `src/*`, `public/*`, `index.html`, `vite.config.ts`, `package.json` | `.agents/prompts/frontend-dev.md` | ✅ Activo |
| 🔒 Seguridad | `security-agent` | Deps scan, secret scan, OWASP, auth | `package.json`, `.env.example`, `src/` (lectura) | `.agents/prompts/security-agent.md` | ✅ Activo |
| 🧪 QA | `qa-agent` | Tests, cobertura ≥70%, lint | `src/**/*.test.*`, `src/**/*.spec.*` | `.agents/prompts/qa-agent.md` | ✅ Activo |
| 📦 Performance | `perf-agent` | Bundle size, lazy loading, tree shaking | `vite.config.ts`, `src/*` (lectura), `index.html` | `.agents/prompts/perf-agent.md` | ✅ Activo |
| 🔍 Code Review | `code-review-frontend` | Revisión React/TS, QA Animaciones (review-animations) | `src/` (lectura), `docs/HITOS.md` | `.agents/prompts/code-review-frontend.md` | ✅ Activo |
| 🎯 Product Owner | `product-owner` | Validar requisito vs entrega | `PROXIMA_TAREA.md` (lectura), `docs/` | `.agents/prompts/product-owner.md` | ✅ Activo |

---

## 📋 Orden de ejecución en el Gate (Fase 3)

```
Paso ejecutado por frontend-dev
         ↓
    HANDOFF_NOTES
         ↓
  code-review-frontend  ← APROBADO o RECHAZADO
         ↓ (si APROBADO)
      qa-agent          ← QA APROBADO / ADVERTENCIA / RECHAZADO
         ↓ (si no RECHAZADO)
  security-agent        ← APROBADO o BLOQUEADO
         ↓ (si APROBADO)
    perf-agent          ← PERF APROBADO / ADVERTENCIA / BLOQUEADO
         ↓ (si implementó UI visible)
   product-owner        ← PO APROBADO o RECHAZADO
         ↓ (si todo OK)
       COMMIT
```

---

## 📋 Fase 1 — Diseño (antes del código)

```
Orquestador redacta borrador PROXIMA_TAREA.md
         ↓
      architect         ← ARQUITECTURA APROBADA o RECHAZADA
         ↓ (si RECHAZADA → vuelve a borrador)
  Se publica PROXIMA_TAREA.md con sello ✅
         ↓
     Fase 2 — Ejecución
```

---

## 📋 Protocolo de Handoff

Al finalizar cada paso, el agente ejecutor DEBE entregar un bloque estructurado:

```markdown
## HANDOFF_NOTES — [Nombre del Agente] — Paso [N]

### Lo implementado
- [bullet 1]
- [bullet 2]
- [bullet 3 máx]

### Contratos/Dependencias para el siguiente agente
- [Endpoint o tipo que el siguiente agente necesita conocer]

### Decisiones tomadas
- [Decisión]: [Justificación]

### Riesgos y advertencias
- [Riesgo detectado o advertencia para el siguiente paso]
```

---

## 📋 Protocolo Anti-Redundancias

Antes de crear cualquier archivo nuevo, el agente responde mentalmente:

1. ¿Existe ya algo similar en `src/components/` o `src/utils/`?
2. ¿Puedo extender un componente existente en vez de crear uno nuevo?
3. ¿Este import se usa realmente?
4. ¿Esta dependencia npm es necesaria o puedo resolverlo con nativo?
5. ¿Este estilo ya existe en el design system / CSS global?

Si la respuesta a cualquier pregunta es "sí", debe justificar por qué igualmente crea el archivo nuevo.

---

## 📋 Sistema de Auto-Creación Dinámica de Agentes (Agent Forge)

Si el Coordinador determina que no hay un agente permanente o temporal adecuado para resolver la tarea en curso, iniciará la auto-creación dinámica utilizando el siguiente protocolo:
1.  **Investigación de Perfil:** Se ejecuta una búsqueda web o consulta en el Grafo de Conocimiento sobre los mejores patrones de diseño para el sub-módulo en cuestión.
2.  **Clasificación por Categoría:** El nuevo agente se clasifica en una de las 4 categorías:
    *   `🧠 Pensador`: Orientado al análisis conceptual, estructura lógica y detección de incongruencias.
    *   `🛠️ Técnico`: Especializado en codificación sintáctica, tipado estricto TypeScript y pruebas de software.
    *   `🧪 Científico`: Diseñado para cálculos complejos, procesamiento algorítmico y análisis matemático.
    *   `🎨 Creativo`: Focado en la estética UI/UX, animaciones fluidas y maquetación visual.
3.  **Asignación de Skills Exclusiva:** El Coordinador adjunta al agente únicamente el conjunto de skills atómicas correspondientes a su rol (p. ej., `CSSLayoutOptimizer` al Creativo, o `RefactoringEngine` al Técnico) para optimizar el contexto.
4.  **Registro Temporal:** Se añade el perfil a la tabla de agentes con el prefijo `[Forge]` y estado `🔄 Temporal`. Al finalizar la tarea y pasar el Gate, el perfil se archiva para auditoría.

---

## 📋 Instrucciones para actualizar este catálogo

Solo el orquestador puede actualizar este archivo. Para añadir un agente especialista temporal o forjado:
1. Definirlo con `define_subagent` usando el system_prompt del archivo de prompts correspondiente o auto-generado por el Coordinador.
2. Añadir una fila a la tabla con estado `🔄 Temporal` o `🛠️ Forjado`
3. Cuando el loop finalice con éxito, marcarlo como `❌ Archivado`.

