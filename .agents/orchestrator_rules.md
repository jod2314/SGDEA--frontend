# Reglas del Orquestador — Frontend SGDEA
## Protocolo de Orquestación v2.0

---

## 🎭 Scopes por agente

Cada agente solo puede modificar los archivos dentro de su scope. Si necesita tocar algo fuera, emite `HANDOFF_REQUEST` al orquestador.

```
frontend/
├── src/                  ✅ frontend-dev, code-review-frontend (lectura)
│   ├── components/       ✅ frontend-dev
│   ├── routes/           ✅ frontend-dev
│   ├── layout/           ✅ frontend-dev
│   ├── context/          ✅ frontend-dev
│   ├── hooks/            ✅ frontend-dev
│   ├── types/            ✅ frontend-dev
│   └── utils/            ✅ frontend-dev
│   └── **/*.test.*       ✅ qa-agent
│   └── **/*.spec.*       ✅ qa-agent
├── public/               ✅ frontend-dev
├── index.html            ✅ frontend-dev, perf-agent (lectura)
├── vite.config.ts        ✅ frontend-dev (si requerido), perf-agent (lectura)
├── package.json          ✅ frontend-dev (deps), security-agent (lectura)
├── tsconfig.json         ⚠️  SOLO con aprobación explícita del usuario
├── .env.example          ✅ frontend-dev, security-agent
├── docs/                 ✅ orquestador, todos los agentes (escritura en HITOS.md, LECCIONES.md, REDUNDANCIAS.md)
└── .agents/              ❌ NUNCA desde un subagente — SOLO el orquestador
```

### Archivos PROHIBIDOS para subagentes
```
├── .env                  ❌ NUNCA (secretos reales)
├── .git/                 ❌ NUNCA
├── node_modules/         ❌ NUNCA
└── dist/                 ❌ NUNCA (artefacto de build)
```

---

## 📋 Convenciones Obligatorias

1. **Tipos:** Toda nueva interfaz va en `src/types/types.ts`
2. **API calls:** Usar exclusivamente `auth.request<T>(endpoint, options)`
3. **Íconos:** `const MdIcon = (IconsMd as any).MdIconName` — importar `IconsMd` de `react-icons/md`
4. **Comentarios:** En español
5. **Commits:** Formato `tipo(scope): descripción [hash-sec]`
6. **Funciones:** ≤ 40 líneas (advertencia si supera, no bloqueante)
7. **Componentes:** ≤ 150 líneas antes de extraer sub-componentes

---

## 📋 Protocolo de Handoff (OBLIGATORIO)

Cuando el Paso N termina y el Paso N+1 es de otro agente:

1. El agente del Paso N entrega `HANDOFF_NOTES` (ver formato en `AGENT_CATALOG.md`)
2. El orquestador inyecta las `HANDOFF_NOTES` en el contexto del siguiente agente
3. El siguiente agente DEBE leer las notas antes de empezar

**El orquestador nunca continúa sin HANDOFF_NOTES cuando el siguiente paso depende del actual.**

---

## 📋 Protocolo Anti-Redundancias (OBLIGATORIO)

Antes de crear cualquier archivo nuevo, el agente responde las 5 preguntas del catálogo. Si hay dudas, busca en `src/` antes de crear.

El **Performance Agent** audita redundancias en cada gate y registra en `docs/REDUNDANCIAS.md`.

---

## 📋 Matriz del Gate de Testing (Fase 3)

| TypeScript | Lint | Tests | Security | Performance | Resultado |
|:----------:|:----:|:-----:|:--------:|:-----------:|:----------|
| ✅ | ✅ | ✅ | ✅ | ✅ o ⚠️ | **COMMIT** |
| ✅ | ✅ | ✅ | ✅ | ❌ (>10%) | **PAUSA** — notificar usuario |
| ✅ | ✅ | ⚠️ (50-70%) | ✅ | cualquier | **COMMIT** + warning en HITOS.md |
| ✅ | ❌ | - | - | - | **PAUSA** — fix lint rápido |
| ❌ | - | - | - | - | **ROLLBACK** + notificar |
| - | - | ❌ (fallan) | - | - | **ROLLBACK** + notificar |
| - | - | - | ❌ (critical/high) | - | **ROLLBACK** + notificar |

---

## 📋 Formato de Commit

```
tipo(scope): descripción concisa [hash-sec]
```

**Donde `[hash-sec]`** es un mini-hash de 4 chars generado por el Security Agent para trazabilidad de revisiones de seguridad. Si el Security Agent no ejecutó (tarea sin cambios de seguridad), omitir el hash.

### Tipos de Commit Permitidos

| Tipo | Uso |
|:-----|:----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio funcional |
| `style` | Cambios de UI/estilos |
| `docs` | Documentación |
| `test` | Tests |
| `chore` | Mantenimiento (deps, config) |
| `perf` | Optimización de performance |
| `security` | Parche de seguridad |

---

## 📋 Criterios de Aceptación General (Validador de Triple Capa)

Un paso o hito se considera completamente aprobado y listo para commit únicamente tras superar el **Validador de Triple Capa (Loop Controller)**:
1.  **Capa Técnica:**
    *   TypeScript compila sin errores (`tsc --noEmit`).
    *   El linter no reporta errores críticos (`npm run lint`).
    *   Los tests unitarios pasan con cobertura aprobada (Fase 3).
    *   El Security Agent aprueba el diff.
2.  **Capa Semántica (KnowledgeGraph):**
    *   Se verifica que los cambios no generen colisiones con la lógica existente mediante la skill `KnowledgeGraphQuery`.
    *   Se comprueba la fidelidad del código y los comentarios en español respecto al blueprint inicial del Pensador.
3.  **Capa de Integración:**
    *   Las partes modificadas por subagentes especialistas encajan entre sí sin romper dependencias de otros módulos.

---

## 🔁 El Bucle de Desarrollo Recursivo (Loop System)

Cuando se ejecutan tareas complejas, se activa la espiral de desarrollo recursivo:
1.  **El Pensador (Thinker):** Define el blueprint técnico, criterios de aceptación y realiza el mapeo de dependencias utilizando `KnowledgeGraphQuery`.
2.  **El Coordinador (Coordinator):** Distribuye subtareas y auto-crea agentes si el perfil no existe, inyectando las skills necesarias bajo demanda.
3.  **El Validador (Loop Controller):** Evalúa el Gate de Triple Capa.
    *   **Si pasa:** Transmite el éxito al Pensador para que realice el Acta de Cierre, realice el commit/push y finalice el bucle.
    *   **Si falla (Iteración < 4):** Genera un `diagnostico_fallo.txt` detallado y reinicia el bucle inyectando el diagnóstico como contexto directo al Pensador.
    *   **Si falla (Iteración >= 4):** Detiene el bucle (PAUSA), resguarda los cambios en una rama temporal `fix/failed-attempt` y notifica al usuario con un resumen de los bloqueos.

---

## 🛠️ Fortalecimiento y Asignación de Skills

Las skills se gestionan dinámicamente según la macro-categoría del agente asignado para conservar tokens y precisión:
1.  **Estructura Requerida (`SKILL.md`):** Todas las skills deben declarar explícitamente su formato de entrada/salida (JSON) y validar que los argumentos cumplan con los scopes de archivos permitidos.
2.  **Uso Segmentado del Grafo de Conocimiento (`KnowledgeGraphQuery`):**
    *   **Pensador / Coordinador:** Consultan dependencias arquitectónicas globales e impactos cruzados.
    *   **Subagentes Ejecutores:** Consultan únicamente definiciones de API locales, variables e interfaces de su subárea para no inundar el contexto.
3.  **Matriz de Asignación por Rol:**
    *   **🧠 Pensador:** `KnowledgeGraphQuery` (Relaciones globales), `SemanticValidator`.
    *   **🛠️ Técnico:** `KnowledgeGraphQuery` (Foco local), `RefactoringEngine`, `CodeReviewHelper`.
    *   **🧪 Científico:** `MathCalculationEngine`, `DataStructureAnalyzer`.
    *   **🎨 Creativo:** `CSSLayoutOptimizer`, `AnimationFidelityInspector`.

---

## 📋 Memoria del Orquestador (6 capas)

| Capa | Archivo | Cuándo se carga |
|:-----|:--------|:----------------|
| Inmediata | `PROXIMA_TAREA.md` | Cada tarea activa |
| De Estado | `loop_state.json` | Persistencia del loop activo (intentos, diagnósticos, rama) |
| Episódica | `docs/HITOS.md` | Al revisar progreso |
| Lecciones | `docs/LECCIONES.md` | Cuando algo falla o se descubre un patrón |
| Redundancias | `docs/REDUNDANCIAS.md` | Al detectar duplicaciones |
| Permanente | `GEMINI.md` (raíz `C:\web`) | Siempre activa (ligera) |

