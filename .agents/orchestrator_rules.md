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

## 🔌 Acceso Total al Grafo MCP para Subagentes

**REGLA INVENTARIABLE:** Al definir o invocar cualquier subagente en este repositorio, el Orquestador DEBE incluir obligatoriamente:
- `enable_mcp_tools: true`

Esto equipa a todos los subagentes (`architect`, `frontend-dev`, `security-agent`, `qa-agent`, `perf-agent`, `code-review-frontend`, `product-owner`) con acceso completo al servidor MCP `code-review-graph` (`semantic_search_nodes`, `query_graph`, `get_review_context`, `detect_changes`, `get_impact_radius`, etc.).

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

## 📋 Protocolo de Commits Únicos por Hito

> [!CAUTION]
> **REGLA DE COMMITS POR HITO:** Queda estrictamente PROHIBIDO hacer commits parciales por cada paso o archivo modificado. 

1. Durante la Fase 2 (Ejecución), los subagentes trabajan en su rama/directorio y acumulan los cambios sin hacer `git commit`.
2. Se realizan las pruebas y verificaciones requeridas.
3. SOLO cuando TODOS los pasos del plan (`PROXIMA_TAREA.md`) estén listos y aprobados, se ejecuta **1 SOLO COMMIT Y PUSH POR HITO COMPLETO**.

### Formato de Commit de Hito
```
hito(scope): [descripción completa del hito alcanzado] [hash-sec]
```

**Ejemplo:** `hito(ui-contraste): corrección integral de colores fijos y refactorización a variables de tema [a1b2]`

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

## 🛠️ Fortalecimiento, Auditoría y Asignación de Skills

Las skills se gestionan, auditan y expanden de forma activa para dotar a los agentes de capacidades precisas sin desperdicio de contexto:

### A. Auditoría de Skills al inicio del Loop (Fase 1 - Diseño)
1.  **Análisis de Requisitos:** Una vez generado el blueprint técnico de la tarea, el Coordinador realiza una auditoría obligatoria de las habilidades requeridas.
2.  **Verificación de Suficiencia:** Compara las habilidades exigidas con las skills locales en `.agents/skills/` y las del sistema de AntiGravity.
3.  **Mapeo y Asignación:** Si las skills existentes cubren los requerimientos, las inyecta como herramientas (Function Calling) en el runtime del agente según su rol.

### B. Forjado de Skills Dinámicas (Skill Forge)
Si la auditoría determina que las skills existentes **no son suficientes** para el hito:
1.  **Investigación Web:** El Coordinador activa un subagente de investigación que busca en repositorios de GitHub, APIs, o documentación oficial de código abierto la lógica necesaria.
2.  **Implementación Local:** Crea un subdirectorio en `.agents/skills/[nombre-skill]/` e implementa el script con un archivo `SKILL.md` estructurado que detalle:
    *   `Input/Output` (Esquema JSON estricto).
    *   `Scope de Archivos` (Frontera de seguridad para evitar colisiones).
3.  **Validación de la Skill:** Antes de su uso, el Validador Técnico comprueba que la skill corra sin errores en el entorno local sandbox.

### C. Matriz de Asignación por Rol
*   **🧠 Pensador:** `KnowledgeGraphQuery` (Relaciones globales), `SemanticValidator`.
*   **🛠️ Técnico:** `KnowledgeGraphQuery` (Foco local), `RefactoringEngine`, `CodeReviewHelper`, más las skills técnicas forjadas específicas de la tarea.
*   **🧪 Científico:** `MathCalculationEngine`, `DataStructureAnalyzer`, más algoritmos o scripts científicos forjados.
*   **🎨 Creativo:** `CSSLayoutOptimizer`, `AnimationFidelityInspector`, más recursos visuales.

---


## 🧠 Base de Conocimiento Activa de Errores (docs/LECCIONES.md)

Para prevenir la repetición de fallas históricas y acelerar la resolución de problemas conocidos, el sistema utiliza `docs/LECCIONES.md` como una **Base de Conocimientos Activa**:
1.  **Consulta Preventiva (Fase 1 - Diseño):** Al recibir la tarea, el Pensador escanea `docs/LECCIONES.md` para identificar lecciones aprendidas anteriores vinculadas a los archivos o tecnologías involucradas en el blueprint.
2.  **Inyección de Restricciones (Fase 2 - Ejecución):** Si se detecta una lección histórica relevante, el Coordinador debe inyectar una regla de prevención en el prompt de sistema del subagente especialista (ej. *"REGLA PREVENTIVA HISTÓRICA: Evitar colores fijos en Drawer.tsx, usar variables CSS del tema según lección del 2026-07-13"*).
3.  **Resolución de Errores Automatizada (Fase 3 - Validación):** Si el Validador de Triple Capa reporta un fallo, contrastará el error técnico con la base de lecciones. Si hay coincidencia, el `diagnostico_fallo.txt` adjuntará la solución preestablecida para resolverlo inmediatamente.
4.  **Registro Obligatorio (Fase 4 - Cierre):** Todo fallo superado en el bucle que no estuviera previamente registrado debe documentarse en `docs/LECCIONES.md` siguiendo el formato estándar antes de proceder al commit final.

---

## 📋 Memoria del Orquestador (6 capas)

| Capa | Archivo | Cuándo se carga |
|:-----|:--------|:----------------|
| Inmediata | `PROXIMA_TAREA.md` | Cada tarea activa |
| De Estado | `loop_state.json` | Persistencia del loop activo (intentos, diagnósticos, rama) |
| Episódica | `docs/HITOS.md` | Al revisar progreso |
| Lecciones | `docs/LECCIONES.md` | Base de conocimientos activa de errores y aprendizaje |
| Redundancias | `docs/REDUNDANCIAS.md` | Al detectar duplicaciones |
| Permanente | `GEMINI.md` (raíz `C:\web`) | Siempre activa (ligera) |


