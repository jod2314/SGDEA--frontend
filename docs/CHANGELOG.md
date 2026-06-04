# CHANGELOG — Frontend SGDEA

Todos los cambios notables en este proyecto serán documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### Añadido
- Plan de Trabajo Guiado (`src/routes/AsistenteOnboarding.tsx`) con un árbol de decisión metodológico (Pasos 0 a 7) para la implementación asistida del SGD, checklists de tareas generadas dinámicamente y botones de acción integrados.
- Nueva vista e interfaz de **Terceros y Entidades** (`src/routes/Entidades.tsx`) para la administración y registro interactivo de terceros en el ecosistema (persona natural o jurídica).
- Botón de **Cerrar Sesión** persistente y destacado con icono en el extremo derecho de la barra superior (`AppBar.tsx`), utilizando la llamada segura a API `auth.request()`.
- Soporte para fijar y desfijar la barra lateral (`isPinned` y botón de pin en `Drawer.tsx`) con un ancho compacto de 72px e interactividad fluida al hacer hover.
- Habilitación de scroll vertical interno y estilizado para el listado de opciones de la barra lateral.
- Nuevo módulo e inventario de **Fondos Acumulados** (`src/routes/FondosAcumulados.tsx`) que permite listar, registrar fondos históricos y exportar el FUID en formato CSV.
- Soporte para asignación de Jefes en la vista de `EstructuraOrganizacional.tsx`.
- Formulario interactivo en el detalle del expediente (`src/routes/Expedientes.tsx`) para la custodia física (Sección, Bloque, Estante, Peldaño, Caja, Carpeta).
- Toolbar ampliado en el editor Tiptap (`src/routes/CrearEditarPlantilla.tsx`) con headings, blockquote, horizontalrule, deshacer/rehacer, inserción y borrado de tablas y carga de imágenes locales con `auth.request()`.
- Soporte para descargas de blobs/form-data en `src/lib/api.ts` vía `responseType`.
- Sistema de orquestación de agentes (`.agents/`)
  - `stack.config.md` — configuración del stack tecnológico
  - `AGENT_CATALOG.md` — catálogo dinámico de agentes especialistas
  - `orchestrator_rules.md` — reglas de scope y convenciones
  - `scripts/run_tests.ps1` — gate de testing antes de commit
  - `scripts/rollback.ps1` — protocolo de rollback automático
  - `docs/HITOS.md` — registro continuo de hitos
  - `docs/CHANGELOG.md` — este archivo
- `.env.example` — plantilla de variables de entorno sin valores sensibles

### Modificado
- Integrado bloqueo dinámico de navegación en `PortalLayout.tsx` para redirección automática al asistente si el onboarding del tenant no se ha finalizado.
- Optimización del comportamiento del menú lateral cuando está desfijado (`unpinned`): deshabilitación temporal del hover al hacer clic en desfijar para evitar que el contenido se meta debajo del menú de manera inmediata.
- Migrado el llamado de signout en `PortalLayout.tsx` para usar `auth.request` de forma segura.

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
