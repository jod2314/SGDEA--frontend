# 📋 PRÓXIMA TAREA — Frontend SGDEA

## Objetivo
Ampliar la interfaz de usuario de SGDEA para incluir el paso de fondos acumulados en el asistente inteligente, robustecer la toolbar del editor Tiptap (carga de imágenes locales, tablas avanzadas y formateo), permitir asignar jefes a dependencias en el organigrama y registrar la ubicación física granular de expedientes en su inventario.

---

## Pasos Técnicos de Ejecución

### Paso 1: Robustecer el Editor Tiptap (Toolbar y Formato)
* **Descripción:** 
  1. Instalar y configurar extensiones de Tiptap para Heading, BulletList, OrderedList, Blockquote, HorizontalRule, TextStyle y Color.
  2. Implementar los botones en la toolbar de [CrearEditarPlantilla.tsx](file:///C:/web/frontend/src/routes/CrearEditarPlantilla.tsx) para dar formato enriquecido.
* **Subagente Asignado:** `self` (Orquestador principal/Frontend specialist)
* **Archivos Modificados:**
  * `frontend/src/routes/CrearEditarPlantilla.tsx` [MODIFY]
* **Criterio de Aceptación:** El editor permite alternar entre encabezados H1-H3, crear listas y cambiar colores del texto.
* **Punto de Rollback:** Revertir los cambios en `CrearEditarPlantilla.tsx`.

### Paso 2: Carga de Imágenes Locales y Tablas en Tiptap
* **Descripción:**
  1. Añadir botón para cargar imagen de disco en la toolbar del editor.
  2. Implementar modal o selector que envíe el archivo al backend (`POST /documentos/upload-imagen`) e inserte el nodo `image` con la URL resultante.
  3. Añadir controles interactivos para inserción y borrado avanzado de tablas (filas, columnas).
* **Subagente Asignado:** `self`
* **Archivos Modificados:**
  * `frontend/src/routes/CrearEditarPlantilla.tsx` [MODIFY]
* **Criterio de Aceptación:** Al presionar subir imagen, se carga en local y se renderiza dentro del papel A4 del editor.

### Paso 3: Asistente Onboarding - Paso de Fondos Acumulados
* **Descripción:**
  1. Agregar el nuevo paso "Fondos Acumulados" en [AsistenteOnboarding.tsx](file:///C:/web/frontend/src/routes/AsistenteOnboarding.tsx).
  2. Renderizar preguntas y formulario de levantamiento de fondos si la empresa lo declara.
* **Subagente Asignado:** `self`
* **Archivos Modificados:**
  * `frontend/src/routes/AsistenteOnboarding.tsx` [MODIFY]
* **Criterio de Aceptación:** El asistente transiciona correctamente al paso de fondos acumulados y recolecta el diagnóstico.

### Paso 4: Organigrama (Jefe) y Custodia de Expedientes (Ubicación)
* **Descripción:**
  1. Modificar el organigrama y la tabla en [EstructuraOrganizacional.tsx](file:///C:/web/frontend/src/routes/EstructuraOrganizacional.tsx) para listar y guardar el jefe de área.
  2. En [Expedientes.tsx](file:///C:/web/frontend/src/routes/Expedientes.tsx), en la vista de detalle del expediente, agregar un panel o formulario para registrar: Sección, Bloque, Estante y Peldaño físicos.
* **Subagente Asignado:** `self`
* **Archivos Modificados:**
  * `frontend/src/routes/EstructuraOrganizacional.tsx` [MODIFY]
  * `frontend/src/routes/Expedientes.tsx` [MODIFY]
* **Criterio de Aceptación:** El organigrama muestra el nombre del jefe asignado y los expedientes salvan e imprimen su estantería física.

### Paso 5: Nuevo Módulo de Inventario de Fondos Acumulados
* **Descripción:**
  1. Crear la vista [FondosAcumulados.tsx](file:///C:/web/frontend/src/routes/FondosAcumulados.tsx) para listar y registrar inventarios de fondos acumulados preexistentes.
  2. Habilitar la exportación del FUID histórico en formato CSV.
* **Subagente Asignado:** `self`
* **Archivos Modificados:**
  * `frontend/src/routes/FondosAcumulados.tsx` [NEW]
  * `frontend/src/App.tsx` (rutas) [MODIFY]
* **Criterio de Aceptación:** La vista renderiza, permite la carga manual del inventario de fondos y la exportación correcta de los datos.
