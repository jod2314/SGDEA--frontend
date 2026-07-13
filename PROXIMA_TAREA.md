# PROXIMA_TAREA - Corrección de Contraste en Filtros, Tablas y Modales de Auditoría

**Objetivo:** Modificar los estilos del control global `.edit-input` en `index.css` y las tablas, filtros y modales en `Auditoria.tsx` para que se adapten correctamente a los temas claro/oscuro, asegurando que no queden textos ni fondos blancos de bajo contraste.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución Proyectados

### PASO 1: Modificación de la clase .edit-input en index.css
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\index.css`
* **Criterios de Aceptación:**
  * Reemplazar `background: white` por `var(--surface)`.
  * Inyectar `color: var(--text-primary)` y `border: 1px solid var(--glass-border)`.
* **Punto de Rollback:** `git checkout src/index.css`

### PASO 2: Corrección de estilos inline en Auditoria.tsx
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\routes\Auditoria.tsx`
* **Criterios de Aceptación:**
  * Fila de cabecera de la tabla (`<thead> tr`): Cambiar `background: '#f8f9fa'` por `var(--bg-app)` y borde por `var(--glass-border)`.
  * Líneas divisorias de filas (`<tbody> tr`): Cambiar `#eee` por `var(--glass-border)`.
  * Modal de Timeline: Cambiar `background: '#fff'` por `var(--surface)` y bordes por `var(--glass-border)`.
  * Caja de comentario del modal: Cambiar fondo `#f9f9f9` por `var(--bg-app)` y borde por `var(--primary)`.
  * Badges de acciones y eventos (líneas 127 y 187): Cambiar fondo y color fijos por `background: 'var(--primary-light-2)'` y `color: 'var(--primary)'`.
  * Nodo del timeline (línea 247/248): Cambiar `border: '2px solid white'` por `border: '2px solid var(--surface)'`.
  * Clase local `.text-muted` (línea 266): Cambiar `color: #888` por `color: var(--muted)`.
* **Punto de Rollback:** `git checkout src/routes/Auditoria.tsx`

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en `c:\web\frontend` para asegurar que compila correctamente.
