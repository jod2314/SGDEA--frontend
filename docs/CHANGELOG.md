# CHANGELOG — Frontend SGDEA

Todos los cambios notables en este proyecto serán documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### Añadido
- Sistema de orquestación de agentes (`.agents/`)
  - `stack.config.md` — configuración del stack tecnológico
  - `AGENT_CATALOG.md` — catálogo dinámico de agentes especialistas
  - `orchestrator_rules.md` — reglas de scope y convenciones
  - `scripts/run_tests.ps1` — gate de testing antes de commit
  - `scripts/rollback.ps1` — protocolo de rollback automático
  - `docs/HITOS.md` — registro continuo de hitos
  - `docs/CHANGELOG.md` — este archivo
- `.env.example` — plantilla de variables de entorno sin valores sensibles

---

## Formato de Entradas Futuras

```
## [versión] — YYYY-MM-DD

### Añadido
- Nueva funcionalidad X

### Modificado
- Cambio en componente Y

### Corregido
- Bug en módulo Z

### Eliminado
- Feature obsoleta W
```
