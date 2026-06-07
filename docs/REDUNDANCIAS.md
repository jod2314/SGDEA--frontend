# 🔁 Registro de Redundancias — Frontend SGDEA
## Protocolo de Orquestación v2.0

Este archivo registra las duplicaciones detectadas por el Performance Agent o el Code Review Agent durante los gates de testing. El objetivo es eliminarlas en el siguiente hito de mantenimiento.

---

## Tabla de redundancias activas

| Fecha | Categoría | Severidad | Descripción | Acción recomendada |
|:------|:----------|:---------:|:------------|:-------------------|
| *(se llena automáticamente)* | | | | |

---

## Categorías de redundancia

| Categoría | Descripción |
|:----------|:------------|
| **Componente duplicado** | Dos componentes que hacen lo mismo |
| **Función duplicada** | Lógica repetida en dos archivos |
| **Import fantasma** | Import declarado pero no usado |
| **Dependencia innecesaria** | Paquete npm que resuelve lo que ya hace otro instalado o el browser nativo |
| **CSS duplicado** | Estilo ya definido en otro archivo o en el design system |
| **Bundle/Performance** | Chunk grande, import circular, lazy loading faltante |

---

## Severidad

| Nivel | Criterio | Acción |
|:------|:---------|:-------|
| **ALTA** | Bundle creció >10%, componente duplicado con >100 líneas, ciclo de import | Resolver antes del siguiente commit |
| **MEDIA** | Bundle creció 5-10%, función duplicada, dependencia innecesaria | Resolver en el próximo hito |
| **BAJA** | Import fantasma, CSS duplicado menor | Resolver en sesión de mantenimiento |

---

## Registro histórico

*(Este archivo se poblará automáticamente cuando el Performance Agent o el Code Review Agent detecten redundancias en el gate de testing.)*
