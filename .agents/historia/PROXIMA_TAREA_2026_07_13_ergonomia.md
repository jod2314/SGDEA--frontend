# PROXIMA_TAREA - Reestructuración Visual, Temas y Accesibilidad Tipográfica

**Objetivo:** Implementar la reestructuración estética ergonómica en el frontend de SGDEA para reducir el cansancio visual. Esto incluye el soporte dinámico para Tema Claro / Tema Oscuro y un rotador de tamaño de letra global, controlados en el `AppBar` y con persistencia en `localStorage`.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución Proyectados

### PASO 1: Reconfiguración Tipográfica y de Colores en index.css
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\index.css`
* **Criterios de Aceptación:**
  * Configuración tipográfica proporcional en base a `--font-size-base`.
  * Creación del esquema de colores para Tema Claro y Tema Oscuro (`html.dark-mode`) de bajo contraste y descanso visual.
  * Añadir transición suave (`transition: background-color 0.2s, color 0.2s`) a nivel del layout y body.
* **Punto de Rollback:** `git checkout src/index.css`

### PASO 2: Integración de Lógica y Botones en AppBar.tsx
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\layout\AppBar.tsx`
* **Criterios de Aceptación:**
  * Renderizar botones antes de "Cerrar Sesión":
    * Botón de Tema (Sol/Luna) utilizando `MdSunny` y `MdDarkMode`.
    * Botón de Tamaño de Letra usando `MdFormatSize`.
  * Implementar persistencia en `localStorage` de `theme` y `font-size-base`.
  * Aplicar cambios al elemento raíz `document.documentElement` en la carga del componente.
* **Punto de Rollback:** `git checkout src/layout/AppBar.tsx`

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en `c:\web\frontend` para asegurar que compila correctamente.
