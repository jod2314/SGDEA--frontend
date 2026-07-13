# PROXIMA_TAREA - Actualización Estética y Animaciones Premium (Fase de Diseño)

**Objetivo:** Implementar una actualización visual estética premium basada en la guía de diseño de `ui-ux-pro-max-skill`, integrando estilos de tipo *Glassmorphism/Minimalist Modern* y micro-animaciones fluidas en el Dashboard, AppBar y Drawer de la aplicación.

**Estado de Aprobación:** VALIDACIÓN ARQUITECTURA: ✅ (Aprobado por el Subagente de Arquitectura)

---

## 📋 Pasos Técnicos de Ejecución Proyectados

### PASO 1: Reconfiguración del Sistema de Diseño en index.css
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\index.css`
* **Criterios de Aceptación:**
  * Definición de la paleta de colores HSL/RGB premium esmerilada.
  * Creación de clases utilitarias de Glassmorphism (`.glass-card`, `.glass-blur`).
  * Integración de transiciones nativas ultra-suaves para hovers de layouts.
* **Punto de Rollback:** `git checkout src/index.css`

### PASO 2: Estilización y Micro-animaciones en Dashboard
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\routes\Dashboard.tsx`
* **Criterios de Aceptación:**
  * Aplicación del estilo Glassmorphism a las tarjetas de KPIs y paneles de gráficas.
  * Integración de animaciones de entrada suaves para los bloques.
* **Punto de Rollback:** `git checkout src/routes/Dashboard.tsx`

### PASO 3: Rediseño Premium de Drawer y AppBar
* **Agente Asignado:** `frontend-dev`
* **Archivos a Modificar:**
  * `c:\web\frontend\src\layout\Drawer.tsx`
  * `c:\web\frontend\src\layout\AppBar.tsx`
* **Criterios de Aceptación:**
  * Rediseño translúcido y acoplado al tema Glassmorphism.
  * Animación suave en transiciones de apertura/cierre y menús contextuales.
* **Punto de Rollback:** `git checkout src/layout/Drawer.tsx src/layout/AppBar.tsx`

---

## 🛡️ Protocolo de Calidad
* **Code Review Agent:** `code-review-frontend`
* **Gate de Pruebas:**
  * `npm run build` en `c:\web\frontend` para asegurar que compila correctamente.
