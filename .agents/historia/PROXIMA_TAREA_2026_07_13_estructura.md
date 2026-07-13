# PROXIMA_TAREA - Corrección de Contraste en Jerarquía Organizacional e Investigación Preventiva

**Objetivo:** Modificar los estilos y variables CSS obsoletas en `EstructuraOrganizacional.tsx` para adaptarla a la paleta de temas del proyecto, y formalizar las directrices técnicas para prevenir regresiones de contraste a futuro en la documentación.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución Proyectados

### PASO 1: Corrección de contraste y tipado estricto en EstructuraOrganizacional.tsx
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\routes\EstructuraOrganizacional.tsx`
* **Criterios de Aceptación:**
  * Reemplazar variables CSS en desuso: `var(--primary-color)` por `var(--primary)`, `var(--text-muted)` por `var(--muted)` y `var(--border-color)` por `var(--glass-border)`.
  * Modificar `.tree-node-card` en los estilos locales del final del archivo: cambiar `background: white` por `var(--surface)` y `color` a `var(--text-primary)`.
  * Tipar todas las peticiones asíncronas con `auth.request<ApiResponse<T>>` y remover variables `<any>` y `any[]`.
  * Traducir comentarios en JSX a español.
* **Punto de Rollback:** `git checkout src/routes/EstructuraOrganizacional.tsx`

### PASO 2: Registro de directrices preventivas en docs/LECCIONES.md
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\docs\LECCIONES.md`
* **Criterios de Aceptación:**
  * Redactar y anexar la sección de "Investigación Preventiva de Contraste" con las tres reglas de desarrollo a futuro.
* **Punto de Rollback:** `git checkout docs/LECCIONES.md`

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en `c:\web\frontend` para asegurar que compila correctamente.
