# PROXIMA_TAREA - Reestructuración Visual de Barra Lateral (Frontend)

**Objetivo:** Modificar visualmente la barra lateral (`Drawer.tsx`) para ocultar el bloque completo del menú de "Gestión Documental", conservando únicamente las opciones de "Análisis" (Dashboard) y "Cuenta" (Profile, Auditoría, Logout), manteniendo el AppBar y el enrutamiento de páginas intactos.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución

### PASO 1: Modificación de Drawer.tsx
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\layout\Drawer.tsx`
* **Criterios de Aceptación:**
  * Ocultar el menú de navegación de "Gestión Documental" (líneas 83 a 233).
  * Conservar el enlace de "Dashboard" bajo la sección de "Análisis".
  * Conservar las opciones de "Profile", "Auditoría" y "Logout" bajo la sección de "Cuenta".
  * Asegurar que no hay errores de sintaxis o de compilación TypeScript.
* **Punto de Rollback:** Reversar cambios en `Drawer.tsx` usando `git restore`.

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en la carpeta `c:\web\frontend` para asegurar que compila correctamente.
