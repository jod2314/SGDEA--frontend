# PROXIMA_TAREA - Refinamiento Estético, Físicas de Transición y Corrección de Bloqueantes

**Objetivo:** Refinar el diseño estético de la aplicación para una visualización más suave (bajo brillo y contraste), prevenir el parpadeo de inicio (theme flash) al recargar e implementar las transiciones físicas adecuadas para solucionar los bloqueantes del Code Review de animaciones.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución Proyectados

### PASO 1: Inyección del script de bloqueo de renderizado en index.html
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\index.html`
* **Criterios de Aceptación:**
  * Script inline síncrono al inicio de `<head>` que cargue e inyecte la clase `dark-mode` y `--font-size-base` de `localStorage` al elemento raíz `html`.
* **Punto de Rollback:** `git checkout index.html`

### PASO 2: Ajuste de variables de color, animaciones y accesibilidad en index.css
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\index.css`
* **Criterios de Aceptación:**
  * Colores Sleek Slate (oscuro) y Warm Cream (claro) con bajo brillo y contraste.
  * Ocultar textos del drawer colapsado usando `width: 0; opacity: 0; overflow: hidden; visibility: hidden;` en lugar de `display: none`.
  * Modificar transiciones físicas de layout y de pre-cargas del body.
  * Aplicar curva `cubic-bezier(0.16, 1, 0.3, 1)` a la transición de transformaciones del drawer.
  * Encapsular hovers bajo query `@media (hover: hover) and (pointer: fine)`.
  * Solucionar animación de dropdowns y reconfigurar la regla de accesibilidad `prefers-reduced-motion`.
* **Punto de Rollback:** `git checkout src/index.css`

### PASO 3: Integración de la transición temporal de tema en AppBar.tsx
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\layout\AppBar.tsx`
* **Criterios de Aceptación:**
  * Al hacer clic en alternar tema, añadir temporalmente la clase `.theme-transitioning` al `body` por 300ms, activando las transiciones de color de forma selectiva.
* **Punto de Rollback:** `git checkout src/layout/AppBar.tsx`

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en `c:\web\frontend` para asegurar que compila correctamente.
