# Próxima Tarea: Módulo Cocreador de Intervención de Fondos Acumulados

## Objetivo
Implementar el Asistente Cocreador y Guía Metódica de 7 Fases para la intervención de Fondos Acumulados en el frontend y backend del ecosistema SGDEA, con gestión de contingencias y autogeneración de actas firmadas.

## Pasos Técnicos

### Paso 1: Backend - Esquema y Rutas del Asistente de Intervención
- **Subagente Asignado:** Backend Logic Specialist (self)
- **Archivos a Modificar/Crear:**
  - [NEW] `backend/schema/intervencionFondo.js`
  - [NEW] `backend/services/intervencionFondoService.js`
  - [NEW] `backend/routes/intervencionFondo.js`
  - [MODIFY] `backend/index.js`
- **Criterio de Aceptación:**
  - El esquema debe compilar y registrar correctamente el estado de la checklist y contingencias de la empresa.
  - Endpoints de actualización de tareas, contingencias y actas debidamente asegurados por multi-tenant (`verifyEmpresaContext`) y auditados con el objeto `req`.
- **Punto de Rollback:** `git checkout -- backend/index.js` y borrar archivos nuevos.

### Paso 2: Frontend - Estructuración de Tipos e Interfaz del Asistente
- **Subagente Asignado:** Frontend Specialist (self)
- **Archivos a Modificar:**
  - [MODIFY] `frontend/src/types/types.ts`
  - [MODIFY] `frontend/src/routes/FondosAcumulados.tsx`
- **Criterio de Aceptación:**
  - Interfaz de FondosAcumulados dividida en pestañas (FUID e Intervención).
  - Acordeón interactivo de 7 fases con checkboxes funcionales que llaman a la API y actualizan la barra de progreso en vivo.
  - Tarjetas interactivas de contingencia (plagas, sin fecha) en las fases 4 y 5.
  - Cero errores de TypeScript.
- **Punto de Rollback:** `git checkout -- frontend/src/types/types.ts frontend/src/routes/FondosAcumulados.tsx`.

### Paso 3: Frontend & Backend - Modal de Editor Tiptap para Actas de Intervención
- **Subagente Asignado:** Fullstack Integration Specialist (self)
- **Archivos a Modificar/Crear:**
  - [MODIFY] `frontend/src/routes/FondosAcumulados.tsx`
  - [NEW] `backend/templates/manuales/acta-cuarentena.html`
  - [NEW] `backend/templates/manuales/acta-eliminacion.html`
- **Criterio de Aceptación:**
  - El usuario puede abrir un borrador de acta (Comité, Desinfección, Eliminación) desde el asistente, editarlo en el editor Tiptap en un modal y oficializarlo.
  - Se genera correctamente el PDF inmutable firmado con hash SHA-256 en base de datos.
- **Punto de Rollback:** Revertir cambios locales en los archivos modificados.

## Cierre de Tarea y Pruebas
- Ejecutar tests en backend y frontend.
- Pasar por Code Review Agent.
- Hacer commit del hito y registrar en `HITOS.md` y `CHANGELOG.md`.
