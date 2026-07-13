# CHANGELOG — Frontend SGDEA

Todos los cambios notables en este proyecto serán documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### Añadido

## [1.1.1] — 2026-07-13

### Modificado
- Reestructuración visual de la barra lateral (`Drawer.tsx`) para ocultar el bloque completo del menú de "Gestión Documental" y conservar solo "Análisis" (Dashboard) y "Cuenta" (Profile, Auditoría, Logout).
- Remoción de importaciones de iconos en desuso en `Drawer.tsx`, optimizando y reduciendo el tamaño del archivo a 115 líneas.

### [1.1.0] — 2026-06-07

### Añadido
- Gestión de comités de archivo (`ComiteArchivo.tsx`) con formularios para miembros, roles y redacción y oficialización de actas a PDF inmutable.
- Creador interactivo de Tabla de Valoración Documental (TVD) (`TablaValoracion.tsx`) con sugerencias por sector y enlace de acta aprobada.
- Interfaz interactiva de la Matriz de Riesgos del depósito (`MatrizRiesgos.tsx`) con cálculo dinámico de nivel de riesgo en base a probabilidad * impacto.
- Asistente de intervención de fondos acumulados interactivo con acordeón de 7 fases, visualización de progreso dinámico, ramas de decisión para contingencias biológicas/plagas y modal Tiptap integrado para oficializar actas de comité y desinfección.

- Plan de Trabajo Guiado (`src/routes/AsistenteOnboarding.tsx`) con un árbol de decisión metodológico (Pasos 0 a 7) para la implementación asistida del SGD, checklists de tareas generadas dinámicamente y botones de acción integrados.
- Modal integrado con editor de texto **Tiptap** en `AsistenteOnboarding.tsx` para la edición interactiva y oficialización a PDF/A inmutable de manuales normativos (Manual de Gestión y PGD).
- Funcionalidad de **Carga Masiva de Fondos Acumulados (FUID)** mediante Excel/CSV en `FondosAcumulados.tsx` con Drag & Drop y visor detallado de incidencias y errores por fila.
- Recomendador inteligente de series TRD/TVD en `ConfiguracionTRD.tsx` basado en el catálogo nacional BANTER por sector comercial, con importación en lote.
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
