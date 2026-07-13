# Estándares de Animación (Referencia Técnica)

## 1. Tabla de Frecuencias
- **100+ veces/día:** Sin animación.
- **Decenas de veces/día:** Movimiento mínimo/sutil (~100-150ms).
- **Ocasional (modales, toasts):** Estándar (~150-250ms).
- **Raro/Onboarding:** Animaciones detalladas y lúdicas (hasta 500ms).

## 2. Presupuesto de Tiempos
- Feedback de click (activo): `100ms - 160ms`.
- Tooltips y Popovers: `125ms - 200ms`.
- Selects y Dropdowns: `150ms - 250ms`.
- Modales y Drawers: `200ms - 450ms`.

## 3. Curvas Aprobadas
- `ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (UI estándar).
- `ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)` (movimientos de traslación).
- `ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)` (paneles y modales laterales).

## 4. Auditoría de Propiedades GPU
- **Permitido:** `transform` (translate, scale, rotate) y `opacity`.
- **Prohibido:** Animaciones en `width`, `height`, `margin`, `padding`, `top`, `bottom`, `left`, `right`, `font-size`, `line-height`.
