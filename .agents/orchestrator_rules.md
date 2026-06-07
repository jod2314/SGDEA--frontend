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

## 📋 Criterios de Aceptación General

Un paso se considera completado cuando:
- TypeScript compila sin errores (`tsc --noEmit`)
- El linter no reporta errores críticos (`npm run lint`)
- Los tests pasan (o hay advertencia documentada si no hay tests)
- El Security Agent aprobó el diff
- Los cambios están en `docs/HITOS.md`
- Si aplica: el Performance Agent aprobó o emitió advertencia documentada

---

## 📋 Memoria del Orquestador (5 capas)

| Capa | Archivo | Cuándo se carga |
|:-----|:--------|:----------------|
| Inmediata | `PROXIMA_TAREA.md` | Cada tarea activa |
| Episódica | `docs/HITOS.md` | Al revisar progreso |
| Lecciones | `docs/LECCIONES.md` | Cuando algo falla o se descubre un patrón |
| Redundancias | `docs/REDUNDANCIAS.md` | Al detectar duplicaciones |
| Permanente | `GEMINI.md` (raíz `C:\web`) | Siempre activa (ligera) |
