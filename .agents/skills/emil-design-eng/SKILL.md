---
name: emil-design-eng
description: Encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, custom easings, and fluid physics (springs). Used by the Frontend Developer.
---

# Design Engineering - Emil Kowalski's Philosophy

## Directrices de Animación y Craft

### 1. Curvas de Easing Personalizadas
Evitar easings predeterminados de CSS (`ease-in` o `ease-out` débiles). Usar curvas más rápidas al inicio y fluidas al final:
```css
/* Easing fuerte para elementos que entran a la pantalla */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* Easing fuerte para morphing y movimientos internos */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* Curva fluida estilo iOS para paneles laterales */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```
* **Prohibido:** Usar `ease-in` para transiciones de UI, ya que se siente lento al inicio del movimiento que es cuando el usuario está más atento.

### 2. Duraciones Límite de UI
Todas las transiciones de UI deben mantenerse por debajo de **300ms**:
- Feedback de pulsación (activo): 100-160ms.
- Tooltips y pequeños popovers: 125-200ms.
- Menús desplegables: 150-250ms.
- Modales y paneles laterales: 200-450ms.

### 3. Físicas de Spring
Para gestos e interacciones que deban sentirse "vivas" (como arrastre o revelaciones interactivas), usar físicas de spring.
- Configuración recomendada estilo Apple:
  `{ type: "spring", duration: 0.5, bounce: 0.2 }`
- Evitar rebotes excesivos en la UI común (mantener bounce en 0.1 - 0.2).

### 4. Detalles de Craft en Componentes
- **Botones y enlaces:** Siempre aplicar `transform: scale(0.97)` en el estado `:active` con una transición de 160ms para dar feedback físico inmediato.
- **Entradas visuales:** Nunca animar desde `scale(0)` (nada sale de la nada en el mundo físico). Animar desde `scale(0.95)` y `opacity: 0`.
- **Origen de transformación:** Dropdowns y Tooltips deben desplegarse usando el origen de transformación (`transform-origin`) del elemento disparador, no desde el centro.
