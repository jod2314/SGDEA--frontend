import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

const MdAdd = (IconsMd as any).MdAdd;
const MdDelete = (IconsMd as any).MdDelete;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdHistory = (IconsMd as any).MdHistory;
const MdCloudUpload = (IconsMd as any).MdCloudUpload;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdErrorOutline = (IconsMd as any).MdErrorOutline;
const MdUndo = (IconsMd as any).MdUndo;
const MdRedo = (IconsMd as any).MdRedo;
const MdFormatBold = (IconsMd as any).MdFormatBold;
const MdFormatItalic = (IconsMd as any).MdFormatItalic;
const MdHighlighter = (IconsMd as any).MdHighlight || (IconsMd as any).MdFormatColorFill;
const MdFormatListBulleted = (IconsMd as any).MdFormatListBulleted;
const MdFormatListNumbered = (IconsMd as any).MdFormatListNumbered;
const MdClose = (IconsMd as any).MdClose;
const MdTrendingUp = (IconsMd as any).MdTrendingUp;
const MdInfo = (IconsMd as any).MdInfo;
const MdExpandLess = (IconsMd as any).MdExpandLess;
const MdExpandMore = (IconsMd as any).MdExpandMore;



interface FondoAcumulado {
  _id: string;
  codigoInventario: string;
  seccion: string;
  subseccion?: string;
  asunto: string;
  fechasExtremas?: {
    inicial?: string;
    final?: string;
  };
  soporte: "FISICO" | "DIGITAL" | "AMBOS";
  volumen?: {
    cajas?: number;
    carpetas?: number;
    folios?: number;
  };
  estadoConservacion: "BUENO" | "REGULAR" | "MALO";
  createdAt: string;
}

export default function FondosAcumulados() {
  const auth = useAuth();
  const [fondos, setFondos] = useState<FondoAcumulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pestaña activa del módulo
  const [activeTab, setActiveTab] = useState<"inventario" | "asistente">("inventario");
  const [intervencion, setIntervencion] = useState<any | null>(null);
  const [cargandoIntervencion, setCargandoIntervencion] = useState(true);
  const [faseAcordeonOpen, setFaseAcordeonOpen] = useState<number>(1);
  const [tareaExpandida, setTareaExpandida] = useState<string | null>(null);

  // Estados locales para Apéndices Técnicos de Tareas
  // Tarea 1.1
  const [medidaLargo, setMedidaLargo] = useState("");
  const [medidaAncho, setMedidaAncho] = useState("");
  const [medidaAlto, setMedidaAlto] = useState("");
  const [medidaEstanterias, setMedidaEstanterias] = useState("");
  const [medidaEntrepanios, setMedidaEntrepanios] = useState("");
  const [medidaLongitud, setMedidaLongitud] = useState("");

  // Tarea 1.2
  const [tempAmb, setTempAmb] = useState("");
  const [humAmb, setHumAmb] = useState("");
  const [luxAmb, setLuxAmb] = useState("");

  // Tarea 1.3
  const [pregunta1, setPregunta1] = useState("");
  const [pregunta2, setPregunta2] = useState("");
  const [pregunta3, setPregunta3] = useState("");
  const [pregunta4, setPregunta4] = useState("");

  // Tarea 1.5
  const [escenario, setEscenario] = useState("");

  // Tarea 4.1
  const [epp1, setEpp1] = useState(false);
  const [epp2, setEpp2] = useState(false);
  const [epp3, setEpp3] = useState(false);
  const [epp4, setEpp4] = useState(false);
  const [epp5, setEpp5] = useState(false);

  // Tarea 5.5
  const [rotuloCaja, setRotuloCaja] = useState("");
  const [rotuloCarpeta, setRotuloCarpeta] = useState("");
  const [rotuloDependencia, setRotuloDependencia] = useState("");
  const [rotuloSerie, setRotuloSerie] = useState("");
  const [rotuloFechas, setRotuloFechas] = useState("");
  const [rotuloFolios, setRotuloFolios] = useState("");

  // Tarea 3.1 (Jerarquía histórica)
  const [dependenciasDisponibles, setDependenciasDisponibles] = useState<any[]>([]);
  const [nuevaDepCodigo, setNuevaDepCodigo] = useState("");
  const [nuevaDepNombre, setNuevaDepNombre] = useState("");
  const [nuevaDepPadreId, setNuevaDepPadreId] = useState("");

  // Sincronizar contingencias cargadas de base de datos a estados locales
  useEffect(() => {
    if (intervencion?.contingencias) {
      const c = typeof intervencion.contingencias.get === 'function' 
        ? Object.fromEntries(intervencion.contingencias)
        : intervencion.contingencias;
      
      // Tarea 1.1
      if (c.apendice_1_1) {
        setMedidaLargo(c.apendice_1_1.largo || "");
        setMedidaAncho(c.apendice_1_1.ancho || "");
        setMedidaAlto(c.apendice_1_1.alto || "");
        setMedidaEstanterias(c.apendice_1_1.estanterias || "");
        setMedidaEntrepanios(c.apendice_1_1.entrepanios || "");
        setMedidaLongitud(c.apendice_1_1.longitudEntrepanio || "");
      }
      // Tarea 1.2
      if (c.apendice_1_2) {
        setTempAmb(c.apendice_1_2.temperatura || "");
        setHumAmb(c.apendice_1_2.humedad || "");
        setLuxAmb(c.apendice_1_2.iluminacion || "");
      }
      // Tarea 1.3
      if (c.apendice_1_3) {
        setPregunta1(c.apendice_1_3.pregunta1 || "");
        setPregunta2(c.apendice_1_3.pregunta2 || "");
        setPregunta3(c.apendice_1_3.pregunta3 || "");
        setPregunta4(c.apendice_1_3.pregunta4 || "");
      }
      // Tarea 1.5
      if (c.apendice_1_5) {
        setEscenario(c.apendice_1_5.escenario || "");
      }
      // Tarea 4.1
      if (c.apendice_4_1) {
        setEpp1(c.apendice_4_1.epp1 || false);
        setEpp2(c.apendice_4_1.epp2 || false);
        setEpp3(c.apendice_4_1.epp3 || false);
        setEpp4(c.apendice_4_1.epp4 || false);
        setEpp5(c.apendice_4_1.epp5 || false);
      }
    }
  }, [intervencion]);

  // Guardar datos del apéndice y marcar la tarea en base de datos
  const guardarDatosApendice = async (tareaId: string, claveApendice: string, datos: any) => {
    try {
      const responseContingencia = await auth.request<any>("/intervencion-fondo/contingencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contingenciaId: claveApendice,
          detalles: datos
        })
      });

      if (responseContingencia.statusCode === 200) {
        const responseTarea = await auth.request<any>("/intervencion-fondo/tarea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tareaId: tareaId,
            completado: true
          })
        });

        if (responseTarea.statusCode === 200) {
          setIntervencion(responseTarea.body.wizard);
          alert("Datos técnicos del apéndice guardados y tarea completada con éxito.");
          setTareaExpandida(null);
        }
      }
    } catch (err: any) {
      alert(err.message || "Error al registrar la información del apéndice");
    }
  };

  // Estados del modal y generación de actas
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [tipoActaActiva, setTipoActaActiva] = useState<string | null>(null);
  const [datosActa, setDatosActa] = useState<any>({});
  const [cargandoActa, setCargandoActa] = useState(false);

  // Editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      (Table as any).configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      (TextAlign as any).configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Highlight,
    ],
    content: "",
  });

  const selectedEmpresa = auth.getSelectedEmpresa();


  // Carga masiva
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    message: string;
    totalProcesados: number;
    totalGuardados: number;
    errores: { fila: number; codigo: string; mensajes: string[] }[];
  } | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Estado del formulario
  const [showForm, setShowForm] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBulkUploading(true);
    setError("");
    setBulkResult(null);

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const json = await auth.request<any>("/fondos-acumulados/importar-masivo", {
        method: "POST",
        body: formData,
      });
      
      setBulkResult(json.body);
      setFile(null);
      fetchFondos();
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setBulkUploading(false);
    }
  };

  const [codigoInventario, setCodigoInventario] = useState("");
  const [seccion, setSeccion] = useState("");
  const [subseccion, setSubseccion] = useState("");
  const [asunto, setAsunto] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [soporte, setSoporte] = useState<"FISICO" | "DIGITAL" | "AMBOS">("FISICO");
  const [cajas, setCajas] = useState(0);
  const [carpetas, setCarpetas] = useState(0);
  const [folios, setFolios] = useState(0);
  const [estadoConservacion, setEstadoConservacion] = useState<"BUENO" | "REGULAR" | "MALO">("BUENO");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchFondos();
    }
  }, [auth.isAuthenticated]);

  async function fetchFondos() {
    try {
      setLoading(true);
      const json = await auth.request<any>("/fondos-acumulados");
      setFondos(json.body.fondos || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await auth.request<any>("/fondos-acumulados", {
        method: "POST",
        body: JSON.stringify({
          codigoInventario,
          seccion,
          subseccion: subseccion || undefined,
          asunto,
          fechasExtremas: {
            inicial: fechaInicial || undefined,
            final: fechaFinal || undefined,
          },
          soporte,
          volumen: {
            cajas: Number(cajas) || 0,
            carpetas: Number(carpetas) || 0,
            folios: Number(folios) || 0,
          },
          estadoConservacion,
        }),
      });

      setShowForm(false);
      resetForm();
      fetchFondos();
    } catch (err: any) {
      setError(err.message || "Error al guardar el registro");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Deseas eliminar este registro de inventario histórico?")) return;
    try {
      await auth.request<any>(`/fondos-acumulados/${id}`, {
        method: "DELETE",
      });
      fetchFondos();
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  }

  async function handleExportarFuid() {
    try {
      const blob = await auth.request<Blob>("/fondos-acumulados/exportar-fuid", {
        method: "GET",
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FUID_Historico_Fondos_Acumulados.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al exportar el inventario");
    }
  }

  // Cargar el estado del asistente de intervención desde el servidor
  async function fetchIntervencionState() {
    try {
      setCargandoIntervencion(true);
      const response = await auth.request<any>("/intervencion-fondo/estado");
      if (response.statusCode === 200) {
        setIntervencion(response.body.wizard);
        setFaseAcordeonOpen(response.body.wizard.faseActual || 1);
      }
    } catch (err: any) {
      console.error("Error al cargar estado de intervención:", err);
    } finally {
      setCargandoIntervencion(false);
    }
  }

  // Marcar o desmarcar una tarea de la checklist
  async function handleToggleTarea(tareaId: string, completadaActualmente: boolean) {
    if (!intervencion) return;
    try {
      const response = await auth.request<any>("/intervencion-fondo/tarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tareaId,
          completado: !completadaActualmente
        })
      });

      if (response.statusCode === 200) {
        setIntervencion(response.body.wizard);
        if (response.body.wizard.faseActual !== intervencion.faseActual) {
          setFaseAcordeonOpen(response.body.wizard.faseActual);
        }
      }
    } catch (err: any) {
      alert(err.message || "Error al actualizar la tarea de intervención");
    }
  }

  // Registrar respuestas a contingencias
  async function handleContingencia(contingenciaId: string, detalles: any) {
    try {
      const response = await auth.request<any>("/intervencion-fondo/contingencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contingenciaId,
          detalles
        })
      });

      if (response.statusCode === 200) {
        setIntervencion(response.body.wizard);
      }
    } catch (err: any) {
      alert(err.message || "Error al registrar la contingencia");
    }
  }

  // Abrir el editor modal con el borrador del acta correspondiente
  async function handleOpenActaEditor(tipoActa: string) {
    setTipoActaActiva(tipoActa);
    setCargandoActa(true);
    
    // Inicializar datos del acta
    let datosIniciales: any = {};
    if (tipoActa === "ACTA_CONSTITUCION_COMITE") {
      datosIniciales = {
        presidente: "",
        secretario: "",
        responsableArchivo: "",
        asesorJuridico: "",
        funciones: ""
      };
    } else if (tipoActa === "ACTA_CUARENTENA_PLAGAS") {
      datosIniciales = {
        descripcionLote: "",
        ubicacionOrigen: "",
        tipoPlaga: "Humedad activa / Hongos",
        operario: ""
      };
    } else if (tipoActa === "ACTA_ELIMINACION_ACUMULADOS") {
      datosIniciales = {
        detalleEliminacion: "",
        metrosLineales: 0,
        cantidadUnidades: 0
      };
    }

    setDatosActa(datosIniciales);
    setShowEditorModal(true);
    setCargandoActa(false);
  }

  // Solicitar al backend la generación del PDF final inmutable
  async function handleOficializarActa() {
    if (!tipoActaActiva) return;
    setSubmitting(true);
    try {
      const response = await auth.request<Blob>("/intervencion-fondo/generar-acta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoActa: tipoActaActiva,
          datos: datosActa
        }),
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ACTA_${tipoActaActiva}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Recargar estado de intervención
      await fetchIntervencionState();
      setShowEditorModal(false);
      setTipoActaActiva(null);
    } catch (err: any) {
      alert(err.message || "Error al generar y oficializar el acta");
    } finally {
      setSubmitting(false);
    }
  }

  const cargarDependencias = async () => {
    try {
      const res = await auth.request<any>("/archivistica/dependencias");
      if (res.statusCode === 200) {
        setDependenciasDisponibles(res.body.dependencias || []);
      }
    } catch (err) {
      console.error("Error al cargar dependencias:", err);
    }
  };

  const handleCrearDependenciaHistorica = async () => {
    try {
      const res = await auth.request<any>("/intervencion-fondo/registrar-jerarquia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          codigoDependencia: nuevaDepCodigo,
          nombreDependencia: nuevaDepNombre,
          dependenciaPadreId: nuevaDepPadreId || null
        }
      });

      if (res.statusCode === 200 || (res.body && res.body.dependencia)) {
        alert("Dependencia histórica creada exitosamente y registrada en el organigrama.");
        setNuevaDepCodigo("");
        setNuevaDepNombre("");
        setNuevaDepPadreId("");
        await cargarDependencias();
        if (res.body?.wizard) {
          setIntervencion(res.body.wizard);
        } else {
          await fetchIntervencionState();
        }
      }
    } catch (err: any) {
      alert(err.message || "Error al crear la dependencia histórica");
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && activeTab === "asistente") {
      fetchIntervencionState();
      cargarDependencias();
    }
  }, [auth.isAuthenticated, activeTab, selectedEmpresa?.id]);

  function resetForm() {

    setCodigoInventario("");
    setSeccion("");
    setSubseccion("");
    setAsunto("");
    setFechaInicial("");
    setFechaFinal("");
    setSoporte("FISICO");
    setCajas(0);
    setCarpetas(0);
    setFolios(0);
    setEstadoConservacion("BUENO");
  }

  return (
    <PortalLayout>
      <div className="fondos-container">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem" }}>Fondos Acumulados e Intervención</h1>
            <p className="text-muted" style={{ margin: "4px 0 0 0" }}>Organización y regularización de tus archivos históricos bajo los estándares del AGN.</p>
          </div>
          {activeTab === "inventario" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={handleExportarFuid} disabled={fondos.length === 0}>
                <MdFileDownload /> Exportar FUID (CSV)
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}>
                <MdCloudUpload /> Carga Masiva (Excel/CSV)
              </button>
              <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowBulkUpload(false); }}>
                <MdAdd /> {showForm ? "Cerrar Formulario" : "Registrar Fondo Histórico"}
              </button>
            </div>
          )}
        </header>

        {/* Pestañas de Navegación del Módulo */}
        <div style={{ display: "flex", gap: "15px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: "24px" }}>
          <button 
            type="button"
            className={`tab-button ${activeTab === "inventario" ? "active" : ""}`}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "inventario" ? "3px solid var(--primary)" : "3px solid transparent",
              fontWeight: activeTab === "inventario" ? "bold" : "normal",
              color: activeTab === "inventario" ? "var(--primary)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
            onClick={() => setActiveTab("inventario")}
          >
            🗄️ Inventario FUID
          </button>
          <button 
            type="button"
            className={`tab-button ${activeTab === "asistente" ? "active" : ""}`}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "asistente" ? "3px solid var(--primary)" : "3px solid transparent",
              fontWeight: activeTab === "asistente" ? "bold" : "normal",
              color: activeTab === "asistente" ? "var(--primary)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
            onClick={() => setActiveTab("asistente")}
          >
            🪄 Asistente de Intervención (Cocreador)
          </button>
        </div>

        {error && <div className="errorMessage" style={{ marginBottom: "20px" }}>{error}</div>}

        {activeTab === "inventario" && (
          <>
            {showBulkUpload && (
              <section className="card" style={{ padding: "25px", marginBottom: "30px", borderLeft: "4px solid #0288d1" }}>

            <h2>Carga Masiva de Fondos Acumulados (FUID)</h2>
            <p className="text-muted small" style={{ marginBottom: "15px" }}>
              Arrastra un archivo Excel (.xlsx, .xls) o CSV con el formato oficial del FUID para importar múltiples registros en lote.
            </p>
            
            <form onSubmit={handleBulkUpload} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? "2px dashed var(--primary-color)" : "2px dashed var(--border-color)",
                  borderRadius: "12px",
                  padding: "30px",
                  textAlign: "center",
                  backgroundColor: dragActive ? "rgba(26, 115, 232, 0.05)" : "rgba(0, 0, 0, 0.01)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => document.getElementById("file-upload-input")?.click()}
              >
                <input 
                  id="file-upload-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleChangeFile}
                  style={{ display: "none" }}
                />
                <MdCloudUpload size={40} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
                {file ? (
                  <div>
                    <p style={{ margin: "0 0 5px 0" }}><strong>Archivo seleccionado:</strong> {file.name}</p>
                    <p className="small text-muted" style={{ margin: 0 }}>({(file.size / 1024).toFixed(1)} KB)</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 5px 0" }}>Arrastra y suelta tu archivo aquí, o haz clic para buscar.</p>
                    <p className="small text-muted" style={{ margin: 0 }}>Extensiones soportadas: .xlsx, .xls, .csv</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowBulkUpload(false); setFile(null); setBulkResult(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!file || bulkUploading}>
                  {bulkUploading ? "Procesando Archivo..." : "Iniciar Carga Masiva"}
                </button>
              </div>
            </form>

            {bulkResult && (
              <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                  {bulkResult.totalGuardados > 0 ? (
                    <MdCheckCircle size={24} style={{ color: "#137333" }} />
                  ) : (
                    <MdErrorOutline size={24} style={{ color: "#c5221f" }} />
                  )}
                  <div>
                    <h4 style={{ margin: 0 }}>Carga Masiva Completa</h4>
                    <p className="small text-muted" style={{ margin: 0 }}>
                      Se procesaron {bulkResult.totalProcesados} filas: <strong>{bulkResult.totalGuardados} importadas con éxito</strong> y {bulkResult.errores.length} con incidencias.
                    </p>
                  </div>
                </div>

                {bulkResult.errores.length > 0 && (
                  <div style={{ backgroundColor: "#fce8e6", border: "1px solid #f8bbd0", borderRadius: "8px", padding: "15px" }}>
                    <h5 style={{ margin: "0 0 10px 0", color: "#c5221f", display: "flex", alignItems: "center", gap: "5px" }}>
                      <MdErrorOutline /> Reporte de Incidencias/Errores ({bulkResult.errores.length})
                    </h5>
                    <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {bulkResult.errores.map((err, i) => (
                        <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }} className="small">
                          <strong>Fila {err.fila} (Código: {err.codigo}):</strong>
                          <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px", color: "#c5221f" }}>
                            {err.mensajes.map((m, j) => (
                              <li key={j}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {showForm && (
          <section className="card" style={{ padding: "20px", marginBottom: "30px", borderLeft: "4px solid var(--primary-color)" }}>
            <h2>Registrar Inventario Histórico (FUID)</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Código Inventario (Consecutivo)</label>
                  <input
                    type="text"
                    value={codigoInventario}
                    onChange={(e) => setCodigoInventario(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="Ej: FUID-2026-001"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Sección Productora</label>
                  <input
                    type="text"
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="Ej: Contabilidad"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Subsección (Opcional)</label>
                  <input
                    type="text"
                    value={subseccion}
                    onChange={(e) => setSubseccion(e.target.value)}
                    className="edit-input"
                    placeholder="Ej: Impuestos"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label>Asunto / Serie Documental Histórica</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  required
                  className="edit-input"
                  placeholder="Ej: Comprobantes de Pago y Facturas"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Fecha Inicial (Fecha Extrema Inicial)</label>
                  <input
                    type="date"
                    value={fechaInicial}
                    onChange={(e) => setFechaInicial(e.target.value)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Fecha Final (Fecha Extrema Final)</label>
                  <input
                    type="date"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Soporte de Conservación</label>
                  <select
                    value={soporte}
                    onChange={(e) => setSoporte(e.target.value as any)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  >
                    <option value="FISICO">Físico</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Volumen Cajas</label>
                  <input
                    type="number"
                    value={cajas}
                    onChange={(e) => setCajas(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Volumen Carpetas</label>
                  <input
                    type="number"
                    value={carpetas}
                    onChange={(e) => setCarpetas(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Volumen Folios</label>
                  <input
                    type="number"
                    value={folios}
                    onChange={(e) => setFolios(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Estado Conservación</label>
                  <select
                    value={estadoConservacion}
                    onChange={(e) => setEstadoConservacion(e.target.value as any)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  >
                    <option value="BUENO">Bueno</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALO">Malo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Registrando..." : "Registrar Inventario"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="card" style={{ padding: "20px" }}>
          <h2><MdHistory /> Registros de Fondos Históricos</h2>
          <div style={{ marginTop: "20px", overflowX: "auto" }}>
            {loading ? (
              <p>Cargando inventarios...</p>
            ) : fondos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <MdHistory size={60} style={{ opacity: 0.3, marginBottom: "15px" }} />
                <p>No se han registrado fondos acumulados en el inventario.</p>
                <p className="small">Haz clic en "Registrar Fondo Histórico" para comenzar.</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Código</th>
                    <th style={{ padding: "10px" }}>Sección / Subsección</th>
                    <th style={{ padding: "10px" }}>Asunto / Serie</th>
                    <th style={{ padding: "10px" }}>Fechas Extremas</th>
                    <th style={{ padding: "10px" }}>Volumen</th>
                    <th style={{ padding: "10px" }}>Estado</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {fondos.map((f) => (
                    <tr key={f._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "10px" }}>
                        <strong>{f.codigoInventario}</strong>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div>{f.seccion}</div>
                        {f.subseccion && (
                          <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
                            {f.subseccion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px" }}>{f.asunto}</td>
                      <td style={{ padding: "10px" }} className="small">
                        {f.fechasExtremas?.inicial
                          ? new Date(f.fechasExtremas.inicial).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {f.fechasExtremas?.final
                          ? new Date(f.fechasExtremas.final).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "10px" }} className="small">
                        {f.volumen?.cajas || 0} cajas, {f.volumen?.carpetas || 0} carp., {f.volumen?.folios || 0} fols.
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          Soporte: {f.soporte}
                        </div>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background:
                              f.estadoConservacion === "BUENO"
                                ? "#e6f4ea"
                                : f.estadoConservacion === "REGULAR"
                                ? "#fef7e0"
                                : "#fce8e6",
                            color:
                              f.estadoConservacion === "BUENO"
                                ? "#137333"
                                : f.estadoConservacion === "REGULAR"
                                ? "#b06000"
                                : "#c5221f",
                          }}
                        >
                          {f.estadoConservacion}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleDelete(f._id)}
                          title="Eliminar"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </>
    )}

    {activeTab === "asistente" && (
      cargandoIntervencion ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", justifyContent: "center" }}>
          <div style={{ border: "3px solid rgba(0,0,0,0.1)", borderTop: "3px solid var(--primary)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite" }} />
          <span>Cargando asistente de intervención...</span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Indicador de Progreso del Asistente */}
        <div className="card" style={{ padding: "24px", background: "var(--surface)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdTrendingUp style={{ color: "var(--primary)" }} /> Progreso de Organización de Fondos Acumulados
            </h3>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--primary)" }}>{intervencion?.progreso ?? 0}%</span>
          </div>
          <div style={{ background: "#f1f3f4", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
            <div 
              style={{ 
                width: `${intervencion?.progreso ?? 0}%`, 
                background: (intervencion?.progreso ?? 0) === 100 ? "#34a853" : "var(--primary)", 
                height: "100%", 
                transition: "width 0.4s ease" 
              }} 
            />
          </div>
          <p className="small text-muted" style={{ margin: 0 }}>
            Completa cada una de las actividades del checklist maestro para organizar el archivo físico de tu organización bajo la normatividad del Archivo General de la Nación (AGN).
          </p>
        </div>

        {/* Acordeón de las 7 Fases */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {FASES_METODOLOGIA.map((fase) => {
            const esAbierta = faseAcordeonOpen === fase.numero;
            const tareasDeFase = fase.tareas;
            const completadasEnFase = tareasDeFase.filter(t => intervencion?.checklist?.[t.id] || intervencion?.checklist?.get?.(t.id)).length;
            const totalTareasFase = tareasDeFase.length;
            const esCompletadaFase = completadasEnFase === totalTareasFase;

            return (
              <div key={fase.numero} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--surface)" }}>
                {/* Encabezado del Acordeón */}
                <div 
                  onClick={() => setFaseAcordeonOpen(esAbierta ? 0 : fase.numero)}
                  style={{
                    padding: "18px 24px",
                    background: esAbierta ? "rgba(26,115,232,0.04)" : "var(--surface)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: esAbierta ? "1px solid rgba(0,0,0,0.06)" : "none",
                    transition: "background-color 150ms"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {esCompletadaFase ? (
                      <MdCheckCircle size={22} style={{ color: "#34a853" }} />
                    ) : (
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: "2px solid var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        color: "var(--primary)"
                      }}>
                        {fase.numero}
                      </div>
                    )}
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>{fase.titulo}</strong>
                      <div className="small text-muted" style={{ marginTop: "2px" }}>
                        {completadasEnFase} de {totalTareasFase} tareas completadas
                      </div>
                    </div>
                  </div>
                  <div>
                    {esAbierta ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                  </div>
                </div>

                {/* Contenido de la Fase */}
                {esAbierta && (
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {tareasDeFase.map((tarea) => {
                      const completada = !!(intervencion?.checklist?.[tarea.id] || intervencion?.checklist?.get?.(tarea.id));

                      return (
                        <div 
                          key={tarea.id}
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: "16px",
                            padding: "14px 18px",
                            background: "#f8f9fa",
                            borderRadius: "10px",
                            borderLeft: completada ? "4px solid #34a853" : "4px solid #fbbc05",
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={completada} 
                            onChange={() => handleToggleTarea(tarea.id, completada)}
                            style={{ marginTop: "4px", width: "18px", height: "18px", cursor: "pointer" }}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                              <div>
                                <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)", textDecoration: completada ? "line-through" : "none" }}>
                                  {tarea.titulo}
                                </strong>
                                <p className="small text-muted" style={{ margin: "4px 0 0 0" }}>{tarea.descripcion}</p>
                              </div>
                              
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {["1.1", "1.2", "1.3", "1.5", "4.1", "5.5", "7.1"].includes(tarea.id) && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost small"
                                    style={{ fontSize: "0.8rem", padding: "6px 12px", height: "auto", borderRadius: "22px", color: "var(--primary)", border: "1px solid rgba(26,115,232,0.15)" }}
                                    onClick={() => setTareaExpandida(tareaExpandida === tarea.id ? null : tarea.id)}
                                  >
                                    {tareaExpandida === tarea.id ? "Ocultar Ficha Técnica" : "📂 Abrir Apéndice Técnico"}
                                  </button>
                                )}

                                {/* Si la tarea requiere generar un acta oficial */}
                                {tarea.requiereActa && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary small"
                                    style={{ fontSize: "0.8rem", padding: "6px 12px", height: "auto", borderRadius: "22px", display: "flex", alignItems: "center", gap: "6px" }}
                                    onClick={() => handleOpenActaEditor(tarea.requiereActa)}
                                  >
                                    <MdFileDownload /> {completada ? "Ver / Editar Acta" : "Generar y Firmar Acta"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Apéndice 1.1 (Inspección física y del depósito) */}
                            {tarea.id === "1.1" && tareaExpandida === "1.1" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 📐 Apéndice A: Medición del Depósito y Estimación de Metros Lineales</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Largo del depósito (m)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaLargo} onChange={e => setMedidaLargo(e.target.value)} placeholder="0.0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Ancho del depósito (m)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaAncho} onChange={e => setMedidaAncho(e.target.value)} placeholder="0.0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Alto del depósito (m)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaAlto} onChange={e => setMedidaAlto(e.target.value)} placeholder="0.0" />
                                  </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Número de Estanterías</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaEstanterias} onChange={e => setMedidaEstanterias(e.target.value)} placeholder="0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Entrepaños por Estantería</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaEntrepanios} onChange={e => setMedidaEntrepanios(e.target.value)} placeholder="0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Longitud de Entrepaño (m)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={medidaLongitud} onChange={e => setMedidaLongitud(e.target.value)} placeholder="0.0" />
                                  </div>
                                </div>
                                {medidaEstanterias && medidaEntrepanios && medidaLongitud && (
                                  <div style={{ background: "#e8f0fe", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="small">
                                    <strong>Volumen Total Estimado:</strong>
                                    <span style={{ fontWeight: "bold", color: "var(--primary)", fontSize: "1rem" }}>
                                      {(Number(medidaEstanterias) * Number(medidaEntrepanios) * Number(medidaLongitud)).toFixed(2)} Metros Lineales (ML)
                                    </span>
                                  </div>
                                )}
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto" }}
                                  onClick={() => guardarDatosApendice("1.1", "apendice_1_1", {
                                    largo: medidaLargo,
                                    ancho: medidaAncho,
                                    alto: medidaAlto,
                                    estanterias: medidaEstanterias,
                                    entrepanios: medidaEntrepanios,
                                    longitudEntrepanio: medidaLongitud,
                                    metrosLinealesCalculados: (Number(medidaEstanterias) * Number(medidaEntrepanios) * Number(medidaLongitud)).toFixed(2)
                                  })}
                                >
                                  💾 Guardar e Inspeccionar
                                </button>
                              </div>
                            )}

                            {/* Apéndice 1.2 (Evaluación ambiental y estructural) */}
                            {tarea.id === "1.2" && tareaExpandida === "1.2" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 🌡️ Apéndice B: Ficha de Monitoreo Ambiental (ISO 11799)</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Temperatura (°C)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={tempAmb} onChange={e => setTempAmb(e.target.value)} placeholder="0.0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Humedad Relativa (%)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={humAmb} onChange={e => setHumAmb(e.target.value)} placeholder="0.0" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Iluminación (Lux)</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={luxAmb} onChange={e => setLuxAmb(e.target.value)} placeholder="0" />
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8f9fa", padding: "12px", borderRadius: "6px" }} className="small">
                                  {tempAmb && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>Temperatura (16-20°C ideal):</span>
                                      <span style={{ 
                                        fontWeight: "bold", 
                                        color: Number(tempAmb) >= 16 && Number(tempAmb) <= 20 ? "#137333" : Number(tempAmb) <= 24 ? "#b06000" : "#c5221f" 
                                      }}>
                                        {Number(tempAmb) >= 16 && Number(tempAmb) <= 20 ? "🟢 ÓPTIMA" : Number(tempAmb) <= 24 ? "🟡 ALERTA - FUERA DE RANGO" : "🔴 CRÍTICA - ALTO RIESGO"}
                                      </span>
                                    </div>
                                  )}
                                  {humAmb && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>Humedad Relativa (40-55% ideal):</span>
                                      <span style={{ 
                                        fontWeight: "bold", 
                                        color: Number(humAmb) >= 40 && Number(humAmb) <= 55 ? "#137333" : Number(humAmb) <= 65 && Number(humAmb) >= 30 ? "#b06000" : "#c5221f" 
                                      }}>
                                        {Number(humAmb) >= 40 && Number(humAmb) <= 55 ? "🟢 ÓPTIMA" : (Number(humAmb) <= 65 && Number(humAmb) >= 30) ? "🟡 ALERTA - FUERA DE RANGO" : "🔴 CRÍTICA - ALTO RIESGO"}
                                      </span>
                                    </div>
                                  )}
                                  {luxAmb && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>Iluminación (máx 50 lux ideal):</span>
                                      <span style={{ 
                                        fontWeight: "bold", 
                                        color: Number(luxAmb) <= 50 ? "#137333" : Number(luxAmb) <= 150 ? "#b06000" : "#c5221f" 
                                      }}>
                                        {Number(luxAmb) <= 50 ? "🟢 ÓPTIMA" : Number(luxAmb) <= 150 ? "🟡 ALERTA - FUERA DE RANGO" : "🔴 CRÍTICA - ALTO RIESGO"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto" }}
                                  onClick={() => guardarDatosApendice("1.2", "apendice_1_2", {
                                    temperatura: tempAmb,
                                    humedad: humAmb,
                                    iluminacion: luxAmb
                                  })}
                                >
                                  💾 Guardar Mediciones
                                </button>
                              </div>
                            )}

                            {/* Apéndice 1.3 (Cuestionario institucional) */}
                            {tarea.id === "1.3" && tareaExpandida === "1.3" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 💬 Apéndice C: Ficha de Reconstrucción Histórica del Fondo</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>1. ¿En qué año se estiman las primeras transferencias o acumulaciones en el depósito?</label>
                                    <input type="text" className="edit-input" style={{ width: "100%", marginTop: "4px" }} value={pregunta1} onChange={e => setPregunta1(e.target.value)} placeholder="Ej: Hacia 1998 con la creación de la sede" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>2. ¿Ha sufrido la organización reestructuraciones orgánicas, fusiones o cierres de departamentos?</label>
                                    <input type="text" className="edit-input" style={{ width: "100%", marginTop: "4px" }} value={pregunta2} onChange={e => setPregunta2(e.target.value)} placeholder="Ej: Fusión con la Sigla XYZ en 2012" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>3. ¿Existen listados, bases de datos o inventarios preliminares de este archivo?</label>
                                    <input type="text" className="edit-input" style={{ width: "100%", marginTop: "4px" }} value={pregunta3} onChange={e => setPregunta3(e.target.value)} placeholder="Ej: Un archivo de Excel antiguo del 2018" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>4. ¿Se ha asignado algún funcionario o responsable formal de la custodia y administración del depósito?</label>
                                    <input type="text" className="edit-input" style={{ width: "100%", marginTop: "4px" }} value={pregunta4} onChange={e => setPregunta4(e.target.value)} placeholder="Ej: El auxiliar de contabilidad a tiempo parcial" />
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto" }}
                                  onClick={() => guardarDatosApendice("1.3", "apendice_1_3", {
                                    pregunta1,
                                    pregunta2,
                                    pregunta3,
                                    pregunta4
                                  })}
                                >
                                  💾 Guardar Cuestionario
                                </button>
                              </div>
                            )}

                            {/* Apéndice 1.5 (Selector de escenario inicial) */}
                            {tarea.id === "1.5" && tareaExpandida === "1.5" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 🛤️ Ficha de Definición del Escenario Metodológico Inicial</h4>
                                <p className="small text-muted" style={{ margin: 0 }}>De acuerdo con la inspección y el inventario preliminar, seleccione el escenario de procedencia en el que se encuentra su organización:</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "5px" }}>
                                  <label style={{ display: "flex", alignItems: "start", gap: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" }} className="small">
                                    <input type="radio" name="escenario_radio" checked={escenario === "A"} onChange={() => setEscenario("A")} style={{ marginTop: "2px" }} />
                                    <div>
                                      <strong>Escenario A: Sin Tabla de Retención Documental (TRD)</strong>
                                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>Se parte de cero absoluto en gestión documental. Se debe estructurar la Tabla de Valoración Documental (TVD) para todos los fondos acumulados históricos.</div>
                                    </div>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "start", gap: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" }} className="small">
                                    <input type="radio" name="escenario_radio" checked={escenario === "B"} onChange={() => setEscenario("B")} style={{ marginTop: "2px" }} />
                                    <div>
                                      <strong>Escenario B: Con TRD Parciales / Históricas</strong>
                                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>Existen versiones pasadas de TRD, pero no cubren la totalidad de los años acumulados ni el organigrama actual. Se requiere empalme.</div>
                                    </div>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "start", gap: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" }} className="small">
                                    <input type="radio" name="escenario_radio" checked={escenario === "C"} onChange={() => setEscenario("C")} style={{ marginTop: "2px" }} />
                                    <div>
                                      <strong>Escenario C: SGD con TRD desactualizadas</strong>
                                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>La empresa cuenta con instrumentos de retención pero no se aplican por desfase administrativo y cambios estructurales frecuentes.</div>
                                    </div>
                                  </label>
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto", marginTop: "5px" }}
                                  onClick={() => guardarDatosApendice("1.5", "apendice_1_5", { escenario })}
                                  disabled={!escenario}
                                >
                                  💾 Definir Escenario
                                </button>
                              </div>
                            )}

                            {/* Apéndice 3.1 (Reconstrucción del organigrama histórico) */}
                            {tarea.id === "3.1" && tareaExpandida === "3.1" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 🏛️ Registro de Dependencias del Organigrama Histórico</h4>
                                <p className="small text-muted" style={{ margin: 0 }}>Registre cada sección, junta o departamento que haya existido durante la historia institucional de la empresa para poder clasificar sus fondos documentales.</p>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
                                  <div>
                                    <label className="small font-semibold">Código Dependencia *</label>
                                    <input 
                                      type="text" 
                                      className="edit-input" 
                                      style={{ width: "100%", marginTop: "4px" }} 
                                      value={nuevaDepCodigo} 
                                      onChange={e => setNuevaDepCodigo(e.target.value)} 
                                      placeholder="Ej: GER-01" 
                                    />
                                  </div>
                                  <div>
                                    <label className="small font-semibold">Nombre Dependencia *</label>
                                    <input 
                                      type="text" 
                                      className="edit-input" 
                                      style={{ width: "100%", marginTop: "4px" }} 
                                      value={nuevaDepNombre} 
                                      onChange={e => setNuevaDepNombre(e.target.value)} 
                                      placeholder="Ej: Gerencia Administrativa" 
                                    />
                                  </div>
                                  <div>
                                    <label className="small font-semibold">Dependencia Padre (Opcional)</label>
                                    <select
                                      className="edit-input"
                                      style={{ width: "100%", marginTop: "4px" }}
                                      value={nuevaDepPadreId}
                                      onChange={e => setNuevaDepPadreId(e.target.value)}
                                    >
                                      <option value="">Ninguna</option>
                                      {dependenciasDisponibles.map(d => (
                                        <option key={d._id} value={d._id}>{d.nombreDependencia} ({d.codigoDependencia})</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-primary small"
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto", marginTop: "10px" }}
                                  onClick={handleCrearDependenciaHistorica}
                                  disabled={!nuevaDepCodigo || !nuevaDepNombre}
                                >
                                  💾 Guardar y Registrar en el Organigrama
                                </button>

                                <div style={{ marginTop: "15px", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "10px" }}>
                                  <h5 className="small font-semibold" style={{ margin: "0 0 10px 0" }}>Dependencias Históricas Registradas</h5>
                                  {dependenciasDisponibles.length === 0 ? (
                                    <p className="small text-muted" style={{ margin: 0 }}>No hay dependencias registradas aún en el sistema.</p>
                                  ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                      {dependenciasDisponibles.map(d => (
                                        <span key={d._id} className="tag tag-blue" style={{ background: "#ebf5ff", color: "#1e40af", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", border: "1px solid #bfdbfe" }}>
                                          {d.nombreDependencia} ({d.codigoDependencia})
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Apéndice 4.1 (Dotación de EPP) */}
                            {tarea.id === "4.1" && tareaExpandida === "4.1" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 🛡️ Lista de Chequeo de Insumos Bioseguros (NTC 5713)</h4>
                                <p className="small text-muted" style={{ margin: 0 }}>Por normas de salud ocupacional (SST) y directrices del AGN para la conservación preventiva, confirme la adquisición y entrega de los siguientes EPP antes de manipular papel con polvo o moho:</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "5px" }} className="small">
                                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={epp1} onChange={e => setEpp1(e.target.checked)} />
                                    <span>Mascarillas con filtro HEPA / N95 (Evitar inhalación de esporas de hongos)</span>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={epp2} onChange={e => setEpp2(e.target.checked)} />
                                    <span>Batas de algodón 100% de manga larga (Protección de la piel y ropa)</span>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={epp3} onChange={e => setEpp3(e.target.checked)} />
                                    <span>Guantes de nitrilo o neopreno (Evitar contacto dérmico directo con microorganismos)</span>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={epp4} onChange={e => setEpp4(e.target.checked)} />
                                    <span>Gafas de seguridad de policarbonato (Protección ocular contra partículas suspendidas)</span>
                                  </label>
                                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={epp5} onChange={e => setEpp5(e.target.checked)} />
                                    <span>Aspiradora con filtro HEPA o brochas de cerda suave (Material de remoción física)</span>
                                  </label>
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto", marginTop: "5px" }}
                                  onClick={() => guardarDatosApendice("4.1", "apendice_4_1", { epp1, epp2, epp3, epp4, epp5 })}
                                  disabled={!(epp1 && epp2 && epp3 && epp4 && epp5)}
                                >
                                  💾 Confirmar Dotación EPP
                                </button>
                              </div>
                            )}

                            {/* Apéndice 5.5 (Generador e Impresor de Rótulos) */}
                            {tarea.id === "5.5" && tareaExpandida === "5.5" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 🏷️ Generador de Rótulos de Cajas y Carpetas (Norma AGN)</h4>
                                <p className="small text-muted" style={{ margin: 0 }}>Rellena los campos y haz clic en "Generar Rótulo" para abrir la carátula oficial en formato para imprimir.</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Código de Caja</label>
                                    <input type="text" className="edit-input" style={{ width: "100%" }} value={rotuloCaja} onChange={e => setRotuloCaja(e.target.value)} placeholder="Ej: C-001" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Código de Carpeta</label>
                                    <input type="text" className="edit-input" style={{ width: "100%" }} value={rotuloCarpeta} onChange={e => setRotuloCarpeta(e.target.value)} placeholder="Ej: Carp-012" />
                                  </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Sección / Dependencia</label>
                                    <input type="text" className="edit-input" style={{ width: "100%" }} value={rotuloDependencia} onChange={e => setRotuloDependencia(e.target.value)} placeholder="Ej: Gerencia General" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Asunto / Serie Documental</label>
                                    <input type="text" className="edit-input" style={{ width: "100%" }} value={rotuloSerie} onChange={e => setRotuloSerie(e.target.value)} placeholder="Ej: Actas de Junta Directiva" />
                                  </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Fechas Extremas (Rango)</label>
                                    <input type="text" className="edit-input" style={{ width: "100%" }} value={rotuloFechas} onChange={e => setRotuloFechas(e.target.value)} placeholder="Ej: 2015-2018" />
                                  </div>
                                  <div>
                                    <label className="small" style={{ fontWeight: 500 }}>Número de Folios</label>
                                    <input type="number" className="edit-input" style={{ width: "100%" }} value={rotuloFolios} onChange={e => setRotuloFolios(e.target.value)} placeholder="150" />
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "5px" }}>
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary small" 
                                    style={{ padding: "6px 12px", height: "auto" }}
                                    disabled={!rotuloCaja || !rotuloCarpeta || !rotuloDependencia || !rotuloSerie}
                                    onClick={() => {
                                      const printWindow = window.open("", "_blank");
                                      if (printWindow) {
                                        printWindow.document.write(`
                                          <html>
                                            <head>
                                              <title>RÓTULO OFICIAL DE ARCHIVO</title>
                                              <style>
                                                body { font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                                                .rotulo-container { border: 4px double black; width: 14cm; height: 9cm; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
                                                .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 8px; font-weight: bold; font-size: 1.1rem; }
                                                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; font-size: 0.9rem; }
                                                .footer { text-align: center; font-size: 0.75rem; border-top: 1px solid black; padding-top: 8px; margin-top: 10px; text-transform: uppercase; }
                                              </style>
                                            </head>
                                            <body>
                                              <div class="rotulo-container">
                                                <div class="header">
                                                  \${selectedEmpresa?.razonSocial || 'EMPRESA REGISTRADA'}<br/>
                                                  SISTEMA DE GESTIÓN DOCUMENTAL
                                                </div>
                                                <div class="content-grid">
                                                  <div><strong>DEP. PRODUCTORA:</strong> \${rotuloDependencia}</div>
                                                  <div><strong>N° CAJA:</strong> \${rotuloCaja}</div>
                                                  <div><strong>SERIE DOCUMENTAL:</strong> \${rotuloSerie}</div>
                                                  <div><strong>N° CARPETA:</strong> \${rotuloCarpeta}</div>
                                                  <div><strong>FECHAS EXTREMAS:</strong> \${rotuloFechas}</div>
                                                  <div><strong>CANT. FOLIOS:</strong> \${rotuloFolios}</div>
                                                </div>
                                                <div class="footer">
                                                  Ley 594 de 2000 — Control y Custodia de Archivos Centrales
                                                </div>
                                              </div>
                                              <script>window.print();</script>
                                            </body>
                                          </html>
                                        `);
                                        printWindow.document.close();
                                      }
                                    }}
                                  >
                                    🖨️ Generar y Descargar Rótulo
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-primary small" 
                                    style={{ padding: "6px 16px", height: "auto" }}
                                    onClick={() => guardarDatosApendice("5.5", "apendice_5_5", {
                                      caja: rotuloCaja,
                                      carpeta: rotuloCarpeta,
                                      dependencia: rotuloDependencia,
                                      serie: rotuloSerie,
                                      fechas: rotuloFechas,
                                      folios: rotuloFolios
                                    })}
                                  >
                                    💾 Guardar Tarea
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Apéndice 7.1 (KPIs de Cierre) */}
                            {tarea.id === "7.1" && tareaExpandida === "7.1" && (
                              <div style={{ marginTop: "15px", background: "white", padding: "20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}><MdInfo style={{ color: "var(--primary)" }} /> 📊 Apéndice Técnico: KPIs Consolidados y Cierre Técnico del Proyecto</h4>
                                <p className="small text-muted" style={{ margin: 0 }}>Indicadores de desempeño derivados de los registros cargados en el FUID del tenant:</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "5px" }} className="small">
                                  <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.04)" }}>
                                    <strong>Volumen Físico Consolidado:</strong>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary)", marginTop: "4px" }}>
                                      {fondos.reduce((acc, curr) => acc + (curr.volumen?.cajas || 0), 0)} Cajas Organizadas
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                                      {(fondos.reduce((acc, curr) => acc + (curr.volumen?.cajas || 0), 0) * 0.2).toFixed(2)} Metros Lineales Totales
                                    </div>
                                  </div>
                                  <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.04)" }}>
                                    <strong>Estado de Custodia:</strong>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#137333", marginTop: "4px" }}>
                                      100% Rotulado
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                                      Foliación sistemática a lápiz aplicada.
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-primary small" 
                                  style={{ alignSelf: "flex-end", padding: "6px 16px", height: "auto", marginTop: "5px" }}
                                  onClick={() => guardarDatosApendice("7.1", "apendice_7_1", {
                                    cajasOrganizadas: fondos.reduce((acc, curr) => acc + (curr.volumen?.cajas || 0), 0),
                                    metrosLineales: (fondos.reduce((acc, curr) => acc + (curr.volumen?.cajas || 0), 0) * 0.2).toFixed(2)
                                  })}
                                >
                                  💾 Guardar e Iniciar Cierre de Fondo
                                </button>
                              </div>
                            )}

                            {/* Rama de Contingencia de Plagas (Fase 4, Tarea 4.3) */}
                            {tarea.id === "4.3" && (
                              <div style={{ marginTop: "14px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                                <p style={{ fontWeight: 500, fontSize: "0.9rem", margin: "0 0 8px 0" }}>⚠️ Contingencia: ¿Se detectaron plagas, hongos o humedad activa en el archivo?</p>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <button 
                                    type="button" 
                                    className={`btn small ${intervencion?.contingencias?.contingenciaPlagas?.detectada === true ? "btn-danger" : "btn-ghost"}`}
                                    style={{ height: "auto", padding: "6px 16px", fontSize: "0.8rem", borderRadius: "22px" }}
                                    onClick={() => handleContingencia("contingenciaPlagas", { detectada: true, resuelto: false, fechaReporte: new Date() })}
                                  >
                                    Sí, se requiere desinfección y aislamiento
                                  </button>
                                  <button 
                                    type="button" 
                                    className={`btn small ${intervencion?.contingencias?.contingenciaPlagas?.detectada === false ? "btn-secondary" : "btn-ghost"}`}
                                    style={{ height: "auto", padding: "6px 16px", fontSize: "0.8rem", borderRadius: "22px" }}
                                    onClick={() => {
                                      handleContingencia("contingenciaPlagas", { detectada: false, resuelto: true });
                                      if (!completada) handleToggleTarea("4.3", false);
                                    }}
                                  >
                                    No, el papel está seco y libre de plagas
                                  </button>
                                </div>

                                {intervencion?.contingencias?.contingenciaPlagas?.detectada === true && (
                                  <div className="alert alert-danger" style={{ marginTop: "12px", background: "rgba(217,48,37,0.04)", borderLeft: "4px solid var(--danger)", padding: "12px 16px", borderRadius: "8px" }}>
                                    <strong>Directriz AGN (Aislamiento y Cuarentena):</strong>
                                    <p className="small" style={{ margin: "4px 0 10px 0" }}>
                                      Aisle el lote contaminado de inmediato. No use brochas para limpiar si hay moho/hongos (evite dispersar esporas). Proceda a generar el Acta de Cuarentena y Desinfección una vez aplicado el químico.
                                    </p>
                                    <button
                                      type="button"
                                      className="btn btn-danger small"
                                      style={{ fontSize: "0.75rem", padding: "6px 12px", height: "auto", borderRadius: "22px" }}
                                      onClick={() => handleOpenActaEditor("ACTA_CUARENTENA_PLAGAS")}
                                    >
                                      Generar Acta de Cuarentena y Desinfección
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar de Recomendaciones de Cargos y Manuales */}
        <div className="card" style={{ padding: "20px", background: "#f8f9fa", border: "1px solid rgba(60,64,67,0.12)" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <MdInfo style={{ color: "var(--primary)" }} /> Recomendaciones de Cargos y Actualización de Procesos
          </h3>
          <p className="small text-muted" style={{ marginTop: "8px", lineHeight: 1.4 }}>
            <strong>Principio de Procedencia:</strong> Asegura que cada dependencia custodie de manera separada únicamente los expedientes que genera en ejercicio de sus funciones.
          </p>
          <p className="small text-muted" style={{ marginTop: "6px", lineHeight: 1.4 }}>
            <strong>Evitar Re-acumulación:</strong> Te aconsejamos incorporar al manual de procesos y procedimientos de la empresa una regla estricta que ordene a cada área cerrar y foliar sus expedientes a más tardar 15 días después de finalizado un trámite.
          </p>
        </div>
      </div>
    )
  )}

      </div>

      {/* Modal del Editor Tiptap para actas de intervención */}
      {showEditorModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(5px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "20px",
          boxSizing: "border-box"
        }}>
          <div className="card" style={{
            width: "95%",
            maxWidth: "1100px",
            height: "90%",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,0,0,0.1)"
          }}>
            {/* Cabecera del Modal */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              background: "var(--surface)"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                  {tipoActaActiva === "ACTA_CONSTITUCION_COMITE" && "Generación de Acta de Constitución del Comité de Archivo"}
                  {tipoActaActiva === "ACTA_CUARENTENA_PLAGAS" && "Generación de Acta de Cuarentena y Desinfección de Lotes"}
                  {tipoActaActiva === "ACTA_ELIMINACION_ACUMULADOS" && "Generación de Acta Oficial de Eliminación Documental"}
                </h3>
                <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
                  Ingresa los datos para rellenar el borrador y pulsa "Oficializar y Firmar" para generar el PDF/A.
                </p>
              </div>
              <button 
                type="button"
                className="btn btn-ghost" 
                style={{ padding: "8px", minWidth: "auto", borderRadius: "50%" }}
                onClick={() => {
                  setShowEditorModal(false);
                  setTipoActaActiva(null);
                }}
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Split layout: Formulario a la izquierda, Editor a la derecha */}
            <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", flex: 1, overflow: "hidden" }}>
              
              {/* Formulario de Campos del Acta */}
              <div style={{
                padding: "24px",
                borderRight: "1px solid rgba(0,0,0,0.08)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "#f8f9fa"
              }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", textTransform: "uppercase", color: "var(--muted)" }}>Campos Requeridos</h4>
                
                {tipoActaActiva === "ACTA_CONSTITUCION_COMITE" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Presidente del Comité</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.presidente || ""}
                        placeholder="Nombre del Presidente"
                        onChange={e => setDatosActa({...datosActa, presidente: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Secretario del Comité</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.secretario || ""}
                        placeholder="Nombre del Secretario"
                        onChange={e => setDatosActa({...datosActa, secretario: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Responsable de Archivo</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.responsableArchivo || ""}
                        placeholder="Líder de Archivo"
                        onChange={e => setDatosActa({...datosActa, responsableArchivo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Asesor Jurídico / Delegado</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.asesorJuridico || ""}
                        placeholder="Abogado o Delegado"
                        onChange={e => setDatosActa({...datosActa, asesorJuridico: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Funciones del Comité</label>
                      <textarea 
                        className="edit-input" 
                        style={{ width: "100%", height: "100px", resize: "none" }}
                        value={datosActa.funciones || ""}
                        placeholder="Las establecidas en la norma..."
                        onChange={e => setDatosActa({...datosActa, funciones: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {tipoActaActiva === "ACTA_CUARENTENA_PLAGAS" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Descripción del Lote Afectado</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.descripcionLote || ""}
                        placeholder="Ej. Cajas de Contabilidad 2010"
                        onChange={e => setDatosActa({...datosActa, descripcionLote: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Ubicación de Origen</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.ubicacionOrigen || ""}
                        placeholder="Ej. Depósito sótano ala sur"
                        onChange={e => setDatosActa({...datosActa, ubicacionOrigen: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Tipo de Plaga / Contaminación</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.tipoPlaga || ""}
                        onChange={e => setDatosActa({...datosActa, tipoPlaga: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Responsable del Procedimiento</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.operario || ""}
                        placeholder="Ej. Juan Pérez (Archivista)"
                        onChange={e => setDatosActa({...datosActa, operario: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {tipoActaActiva === "ACTA_ELIMINACION_ACUMULADOS" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Detalle de Documentación a Eliminar</label>
                      <textarea 
                        className="edit-input" 
                        style={{ width: "100%", height: "100px", resize: "none" }}
                        value={datosActa.detalleEliminacion || ""}
                        placeholder="Ej. Facturas de compra prescritas de 1995..."
                        onChange={e => setDatosActa({...datosActa, detalleEliminacion: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Metros Lineales Aprox.</label>
                      <input 
                        type="number" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.metrosLineales || 0}
                        onChange={e => setDatosActa({...datosActa, metrosLineales: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Cantidad de Unidades (Cajas/Carpetas)</label>
                      <input 
                        type="number" 
                        className="edit-input" 
                        style={{ width: "100%" }}
                        value={datosActa.cantidadUnidades || 0}
                        onChange={e => setDatosActa({...datosActa, cantidadUnidades: Number(e.target.value)})}
                      />
                    </div>
                  </>
                )}

                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    let htmlBorrador = "";
                    const fechaActual = new Date().toLocaleDateString('es-CO');
                    
                    if (tipoActaActiva === "ACTA_CONSTITUCION_COMITE") {
                      htmlBorrador = `
                        <h1 style="text-align: center;">ACTA DE CONSTITUCIÓN DEL COMITÉ DE ARCHIVO</h1>
                        <p>En la ciudad de ${selectedEmpresa?.ciudad || 'Bogotá'}, siendo el día ${fechaActual}, se reunieron los directivos y representantes de la organización <strong>${selectedEmpresa?.razonSocial}</strong> para conformar legalmente el Comité de Archivo, órgano regulador del proceso de organización física e intervención de sus fondos acumulados de acuerdo con la Ley 594 de 2000 y el Decreto 1080 de 2015.</p>
                        <h3>1. Miembros e Integrantes del Comité:</h3>
                        <ul>
                          <li><strong>Presidente (Gerente o Delegado):</strong> ${datosActa.presidente || 'No asignado'}</li>
                          <li><strong>Secretario del Comité:</strong> ${datosActa.secretario || 'No asignado'}</li>
                          <li><strong>Responsable de Archivo (Secretaría Técnica):</strong> ${datosActa.responsableArchivo || 'No asignado'}</li>
                          <li><strong>Asesor Jurídico / Delegado:</strong> ${datosActa.asesorJuridico || 'No asignado'}</li>
                        </ul>
                        <h3>2. Funciones y Responsabilidades:</h3>
                        <p>${datosActa.funciones || 'Aprobar los instrumentos archivísticos (CCD, TVD), autorizar la eliminación de documentos valorados que hayan cumplido su ciclo de retención, y supervisar la implementación del sistema de gestión documental de la empresa.'}</p>
                        <h3>3. Compromiso de Gestión:</h3>
                        <p>Los miembros se comprometen a sesionar periódicamente de forma ordinaria para validar los avances del proceso de organización del archivo histórico de la empresa y expedir las respectivas actas que salvaguarden legalmente cada decisión.</p>
                      `;
                    } else if (tipoActaActiva === "ACTA_CUARENTENA_PLAGAS") {
                      htmlBorrador = `
                        <h1 style="text-align: center;">ACTA DE INGRESO A CUARENTENA Y DESINFECCIÓN DE ARCHIVOS</h1>
                        <p>En las instalaciones de <strong>${selectedEmpresa?.razonSocial}</strong>, en el área de archivo central/acumulados, se hace constar el reporte de una contingencia de contaminación biológica detectada durante el procesamiento del archivo histórico.</p>
                        <h3>1. Detalles del Lote Afectado:</h3>
                        <ul>
                          <li><strong>Descripción del Lote:</strong> ${datosActa.descripcionLote || 'No definida'}</li>
                          <li><strong>Ubicación de Origen:</strong> ${datosActa.ubicacionOrigen || 'No definida'}</li>
                          <li><strong>Tipo de Contaminación Detectada:</strong> ${datosActa.tipoPlaga || 'Humedad activa / Hongos'}</li>
                        </ul>
                        <h3>2. Medidas de Contingencia Adoptadas (Directrices del AGN):</h3>
                        <p>Se ha procedido con el aislamiento preventivo del lote en zona ventilada de cuarentena para evitar la proliferación de esporas al archivo sano. Se autoriza y ejecuta el procedimiento de desinfección en seco y limpieza física controlada.</p>
                        <h3>3. Responsables del Procedimiento:</h3>
                        <p><strong>Ejecutor / Archivista:</strong> ${datosActa.operario || 'Técnico de Archivo'}</p>
                      `;
                    } else if (tipoActaActiva === "ACTA_ELIMINACION_ACUMULADOS") {
                      htmlBorrador = `
                        <h1 style="text-align: center;">ACTA OFICIAL DE ELIMINACIÓN DOCUMENTAL</h1>
                        <p>Por la cual se autoriza la baja documental y destrucción física controlada de series documentales pertenecientes a los fondos acumulados de la organización <strong>${selectedEmpresa?.razonSocial}</strong>, habiendo cumplido sus tiempos de retención y careciendo de valores históricos secundarios según las Tablas de Valoración Documental (TVD) vigentes y aprobadas por el Comité de Archivo.</p>
                        <h3>1. Detalle de Documentación Objeto de Eliminación:</h3>
                        <p>${datosActa.detalleEliminacion || 'Facturas de compra de periodos contables ya prescritos, duplicados de correspondencia y documentos de apoyo sin valor probatorio.'}</p>
                        <h3>2. Volumen e Impacto de la Eliminación:</h3>
                        <ul>
                          <li><strong>Metros Lineales Aprox:</strong> ${datosActa.metrosLineales || '0'} m.l.</li>
                          <li><strong>Número de Cajas/Carpetas:</strong> ${datosActa.cantidadUnidades || '0'} unidades.</li>
                        </ul>
                        <h3>3. Certificación de Destrucción:</h3>
                        <p>El Comité de Archivo autoriza la destrucción física por método de trituración ecológica certificada, asegurando la confidencialidad de la información y la preservación del medio ambiente.</p>
                      `;
                    }
                    editor?.commands.setContent(htmlBorrador);
                  }}
                >
                  📝 Refrescar Borrador
                </button>
              </div>

              {/* Editor Tiptap y A4 */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", overflow: "hidden" }}>
                {cargandoActa ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", flexDirection: "column", gap: "10px" }}>
                    <div style={{ border: "3px solid rgba(0,0,0,0.1)", borderTop: "3px solid var(--primary)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite" }} />
                    <span>Preparando plantilla del acta...</span>
                  </div>
                ) : (
                  <>
                    {/* Barra de herramientas */}
                    <div className="editor-toolbar" style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      padding: "12px 24px",
                      background: "#f8f9fa",
                      borderBottom: "1px solid rgba(0,0,0,0.08)"
                    }}>
                      <button type="button" className="icon-btn" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Deshacer"><MdUndo /></button>
                      <button type="button" className="icon-btn" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Rehacer"><MdRedo /></button>
                      <span className="separator">|</span>
                      <button type="button" className={`icon-btn ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                      <button type="button" className={`icon-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                      <button type="button" className={`icon-btn ${editor?.isActive('paragraph') ? 'active' : ''}`} onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
                      <span className="separator">|</span>
                      <button type="button" className={`icon-btn ${editor?.isActive('bold') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBold().run()}><MdFormatBold /></button>
                      <button type="button" className={`icon-btn ${editor?.isActive('italic') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleItalic().run()}><MdFormatItalic /></button>
                      <button type="button" className={`icon-btn ${editor?.isActive('highlight') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHighlight().run()}><MdHighlighter /></button>
                      <span className="separator">|</span>
                      <button type="button" className={`icon-btn ${editor?.isActive('bulletList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBulletList().run()}><MdFormatListBulleted /></button>
                      <button type="button" className={`icon-btn ${editor?.isActive('orderedList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><MdFormatListNumbered /></button>
                    </div>

                    {/* Editor A4 */}
                    <div style={{
                      flex: 1,
                      overflowY: "auto",
                      background: "#f0f0f0",
                      padding: "20px",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                      <div className="tiptap-paper" style={{
                        width: "100%",
                        maxWidth: "750px",
                        minHeight: "29.7cm",
                        background: "white",
                        padding: "40px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        outline: "none",
                        boxSizing: "border-box"
                      }}>
                        <EditorContent editor={editor} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pie de Modal */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              padding: "16px 24px",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              background: "var(--surface)"
            }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ borderRadius: "22px" }}
                onClick={() => {
                  setShowEditorModal(false);
                  setTipoActaActiva(null);
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ borderRadius: "22px", display: "flex", alignItems: "center", gap: "8px" }}
                onClick={handleOficializarActa}
                disabled={submitting}
              >
                <MdCheckCircle /> Oficializar y Firmar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .icon-btn {
          background: transparent;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 4px;
          padding: 6px 10px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          transition: background-color 150ms;
        }
        .icon-btn:hover {
          background: rgba(0,0,0,0.04);
        }
        .icon-btn.active {
          background: var(--primary) !important;
          color: white !important;
          border-color: var(--primary);
        }
        .separator {
          color: rgba(0,0,0,0.2);
          align-self: center;
          margin: 0 4px;
        }
        .tiptap-paper *:focus {
          outline: none;
        }
        .tiptap-paper table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .tiptap-paper td, .tiptap-paper th {
          min-width: 1em;
          border: 1px solid #ced4da;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
      `}</style>
    </PortalLayout>
  );
}

const FASES_METODOLOGIA = [
  {
    numero: 1,
    titulo: "Fase 1: Diagnóstico e Inspección Técnica Preliminar",
    tareas: [
      { id: "1.1", titulo: "Inspección visual y física del depósito", descripcion: "Evaluar el espacio físico y estimar metros lineales preliminares." },
      { id: "1.2", titulo: "Evaluación ambiental y estructural", descripcion: "Medir humedad, iluminación, ventilación y descartar plagas." },
      { id: "1.3", titulo: "Cuestionario de línea base institucional", descripcion: "Entrevistar empleados para reconstruir la historia del archivo." },
      { id: "1.4", titulo: "Inventario de herramientas preexistentes", descripcion: "Revisar organigramas históricos, reglamentos o manuales previos." },
      { id: "1.5", titulo: "Clasificación del escenario inicial", descripcion: "Determinar si la empresa parte de cero o cuenta con bases." },
      { id: "1.6", titulo: "Elaboración y radicación del Informe Técnico", descripcion: "Generar el informe de diagnóstico para la junta/gerencia." }
    ]
  },
  {
    numero: 2,
    titulo: "Fase 2: Gobernanza y Creación de Comité de Archivo",
    tareas: [
      { id: "2.1", titulo: "Definición de integrantes del Comité de Archivo", descripcion: "Asignar Gerencia, Contabilidad, Área Jurídica y Archivo." },
      { id: "2.2", titulo: "Elaboración del Acta de Constitución", descripcion: "Generar y firmar el Acta N° 01 del comité.", requiereActa: "ACTA_CONSTITUCION_COMITE" },
      { id: "2.3", titulo: "Sesión inaugural del Comité de Archivo", descripcion: "Aprobar cronograma formal y reglamento interno de reuniones." },
      { id: "2.4", titulo: "Resolución de cargos y funciones cruzadas", descripcion: "Asignar responsabilidades de custodia a cada dependencia." }
    ]
  },
  {
    numero: 3,
    titulo: "Fase 3: Instrumentos Archivísticos Preliminares (CCD / TVD)",
    tareas: [
      { id: "3.1", titulo: "Reconstrucción de la historia institucional", descripcion: "Mapear la evolución del organigrama histórico." },
      { id: "3.2", titulo: "Estructuración del Cuadro de Clasificación Documental (CCD)", descripcion: "Estructurar series y subseries del fondo histórico." },
      { id: "3.3", titulo: "Elaboración de las Tablas de Valoración Documental (TVD)", descripcion: "Asignar tiempos de retención y disposición final de series." },
      { id: "3.4", titulo: "Aprobación y oficialización de las TVD", descripcion: "Someter las TVD a aprobación oficial del Comité de Archivo." }
    ]
  },
  {
    numero: 4,
    titulo: "Fase 4: Adecuación Logística, Limpieza y Estabilización",
    tareas: [
      { id: "4.1", titulo: "Dotación de Elementos de Protección Personal (EPP)", descripcion: "Mascarillas N95, batas, guantes de nitrilo y gafas." },
      { id: "4.2", titulo: "Adquisición de insumos de conservación (Normas NTC)", descripcion: "Cajas desacidificadas X200, carpetas y ganchos plásticos." },
      { id: "4.3", titulo: "Ingreso a cuarentena e higienización", descripcion: "Separar lotes contaminados y aplicar desinfección.", requiereActa: "ACTA_CUARENTENA_PLAGAS" },
      { id: "4.4", titulo: "Limpieza en seco y remoción de suciedad", descripcion: "Eliminar polvo con aspiradoras HEPA o brochas suaves." },
      { id: "4.5", titulo: "Estabilización y remoción de material oxidante", descripcion: "Retirar grapas metálicas, clips y cintas pegantes dañinas." }
    ]
  },
  {
    numero: 5,
    titulo: "Fase 5: Clasificación, Ordenación, Foliación e Inventario",
    tareas: [
      { id: "5.1", titulo: "Clasificación por series y subseries", descripcion: "Agrupar carpetas siguiendo el CCD e instrumentos." },
      { id: "5.2", titulo: "Ordenación interna y cronológica", descripcion: "Ordenar del más antiguo (arriba) al más reciente (abajo)." },
      { id: "5.3", titulo: "Foliación sistemática a lápiz", descripcion: "Numerar folios en la esquina superior derecha (máx 200 folios)." },
      { id: "5.4", titulo: "Registro en el Inventario Único (FUID)", descripcion: "Registrar cajas, carpetas, folios y soporte en la plataforma." },
      { id: "5.5", titulo: "Rotulación definitiva de cajas y carpetas", descripcion: "Pegar rótulos normalizados con códigos y ubicaciones." }
    ]
  },
  {
    numero: 6,
    titulo: "Fase 6: Valoración, Disposición Final y Transferencia",
    tareas: [
      { id: "6.1", titulo: "Identificación de expedientes para depuración", descripcion: "Filtrar del inventario las series que prescriben según la TVD." },
      { id: "6.2", titulo: "Elaboración del Acta de Eliminación Documental", descripcion: "Redactar el acta de baja documental de acumulados.", requiereActa: "ACTA_ELIMINACION_ACUMULADOS" },
      { id: "6.3", titulo: "Sesión del comité para aprobación de eliminación", descripcion: "Firmar acta y legalizar la eliminación física de documentos." },
      { id: "6.4", titulo: "Destrucción física certificada y ecológica", descripcion: "Trituración ecológica certificada de los folios depurados." },
      { id: "6.5", titulo: "Transferencia al Archivo Central", descripcion: "Trasladar las cajas organizadas y actualizar la topografía." }
    ]
  },
  {
    numero: 7,
    titulo: "Fase 7: Informe Final de Gestión y Cierre del Fondo",
    tareas: [
      { id: "7.1", titulo: "Redacción del Informe Final de Intervención", descripcion: "Resumen de m.l. procesados, indicadores y resultados." },
      { id: "7.2", titulo: "Ajuste preventivo en el Manual de Procedimientos", descripcion: "Actualizar guías internas para evitar nuevos acumulados." },
      { id: "7.3", titulo: "Capacitación al equipo de la organización", descripcion: "Inducción técnica sobre transferencias y custodia." },
      { id: "7.4", titulo: "Acta de Entrega formal del archivo organizado", descripcion: "Firma del acta de finalización de organización de acumulados." }
    ]
  }
];

