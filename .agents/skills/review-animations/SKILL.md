---
name: review-animations
description: Strict constraint-based auditor for animations and motion code. Evaluates timing, easing, performance (GPU-only properties), and accessibility. Used by the Code Review Agent.
---

# Reviewing Animations - QA de Movimiento y Estilo

## Directrices de Auditoría (10 Reglas No Negociables)

1. **Movimiento Justificado:** Toda animación debe responder a un propósito claro (consistencia espacial, feedback de estado, evitar cambios bruscos). Prohibido "se ve genial" para elementos frecuentes.
2. **Frecuencia del Movimiento:** Elementos que se usan 100+ veces al día (atajos de teclado, barras de búsqueda rápidas) **NUNCA** se animan. Los que se usan decenas de veces tienen animaciones muy cortas (150ms).
3. **Easing Responsivo:** Entrada y salida con `ease-out` o curvas customizadas. `ease-in` en UI es bloqueante (se percibe lento).
4. **UI Sub-300ms:** Todas las animaciones visuales de controles de usuario deben durar menos de 300ms.
5. **Origen Físico Correcto:** Dropdowns y popovers escalan desde el trigger (`transform-origin`), no desde el centro. No usar `scale(0)` como punto inicial; usar `scale(0.95)`. (Modales exentos del centro).
6. **Interruptibilidad:** Rapid-fire o gestos (toasts, toggles, drags) deben responder a interrupciones sin brincos, usando transiciones fluidas de CSS o springs.
7. **Propiedades Aceleradas por GPU:** Animar **únicamente** `transform` y `opacity`. El uso de `width`, `height`, `margin`, `padding`, `top`, `left` es un hallazgo de rendimiento.
8. **Accesibilidad:** Respetar `prefers-reduced-motion` bajando la intensidad física del movimiento. Las animaciones hover deben estar encapsuladas en `@media (hover: hover)`.
9. **Asimetría:** Las acciones del usuario (pulsación) responden al instante; las reacciones del sistema se confirman de forma fluida.
10. **Cohesión:** El estilo del movimiento debe ser uniforme a lo largo de toda la plataforma.
