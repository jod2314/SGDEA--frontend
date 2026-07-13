---
name: ui-ux-pro-max
description: UI/UX design intelligence with HSL color palettes, typography guidelines, responsive standards, and accessibility criteria (contrast, keyboard navigation). Used by the Architect and Frontend Developer.
---

# UI/UX Pro Max - Inteligencia de Diseño

## Principios y Directrices del Proyecto

### 1. Accesibilidad (Prioridad 1 - Crítica)
- Relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande.
- Soporte completo para navegación por teclado (Tab) y focos visibles (focus rings de 2-4px).
- Emojis no deben usarse como iconos; usar siempre SVGs (react-icons/md).
- Respetar `prefers-reduced-motion` reduciendo desplazamientos físicos.

### 2. Layout y Responsive (Prioridad 2)
- Enfoque de desarrollo mobile-first.
- Spacing scale de 4px/8px para márgenes y paddings.
- Readable font-size de 16px mínimo para evitar auto-zoom en inputs de iOS.

### 3. Tokens de Color (SaaS Corporativo)
- **Background:** `#0b0f19` (Azul Slate oscuro profundo).
- **Tarjetas Glassmorphism:**
  ```css
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  ```
- **Acento Primario:** `#6366f1` (Indigo).
- **Acento Secundario:** `#10b981` (Esmeralda).
