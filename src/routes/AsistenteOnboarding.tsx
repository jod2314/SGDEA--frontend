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


// Iconos siguiendo el patrón del proyecto
const MdAutoAwesome = (IconsMd as any).MdAutoAwesome;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;
const MdInfo = (IconsMd as any).MdInfo;
const MdWarning = (IconsMd as any).MdWarning;
const MdAssignment = (IconsMd as any).MdAssignment;
const MdBusiness = (IconsMd as any).MdBusiness;
const MdPeople = (IconsMd as any).MdPeople;
const MdDescription = (IconsMd as any).MdDescription;
const MdTrendingUp = (IconsMd as any).MdTrendingUp;
const MdDeleteSweep = (IconsMd as any).MdDeleteSweep;
const MdHistory = (IconsMd as any).MdHistory;
const MdUndo = (IconsMd as any).MdUndo;
const MdRedo = (IconsMd as any).MdRedo;
const MdFormatBold = (IconsMd as any).MdFormatBold;
const MdFormatItalic = (IconsMd as any).MdFormatItalic;
const MdHighlighter = (IconsMd as any).MdHighlighter || (IconsMd as any).MdFormatColorFill;
const MdFormatListBulleted = (IconsMd as any).MdFormatListBulleted;
const MdFormatListNumbered = (IconsMd as any).MdFormatListNumbered;
const MdClose = (IconsMd as any).MdClose;


export default function AsistenteOnboarding() {
  const auth = useAuth();
  const [wizard, setWizard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  // Estado local para capturar el valor de las preguntas del paso actual
  const [respuestasPaso, setRespuestasPaso] = useState<any>({});

  // Estados locales para el modal y editor de Tiptap
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [tipoManualActivo, setTipoManualActivo] = useState<"manual-gestion" | "pgd" | null>(null);
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);

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


  // Cargar estado inicial del wizard
  async function fetchWizardState() {
    try {
      const response = await auth.request<any>("/onboarding/assistant/state");
      if (response.statusCode === 200) {
        setWizard(response.body.wizard);
        // Cargar respuestas preexistentes en la base de datos si las hay
        const pasoActual = response.body.wizard.pasoActual || 0;
        const mapaRespuestas = response.body.wizard.respuestas || {};
        // Dado que respuestas es un Map serializado como Objeto, accedemos directo
        setRespuestasPaso(mapaRespuestas[String(pasoActual)] || {});
      }
    } catch (error) {
      console.error("Error al cargar estado del asistente:", error);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmpresa = auth.getSelectedEmpresa();

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchWizardState();
    }
  }, [auth.isAuthenticated, selectedEmpresa?.id]);

  // Guardar respuestas del paso activo y avanzar
  async function guardarRespuesta(payload: any) {
    if (!wizard) return;
    setSubmitting(true);
    setErrorText("");

    try {
      const response = await auth.request<any>("/onboarding/assistant/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paso: wizard.pasoActual,
          respuestas: payload
        })
      });

      if (response.statusCode === 200) {
        setWizard(response.body.wizard);
        const nuevoPaso = response.body.wizard.pasoActual;
        const mapaRespuestas = response.body.wizard.respuestas || {};
        setRespuestasPaso(mapaRespuestas[String(nuevoPaso)] || {});
      } else {
        setErrorText(response.body.error || "Error al registrar la respuesta.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  // Descarga del Acta de Comité o de la Política en PDF/A
  async function handleDownloadDoc(tipo: string) {
    try {
      const blob = await auth.request<Blob>(`/onboarding/generar/${tipo}`, {
        method: "POST",
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SISTEMA_${tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error: any) {
      alert(error.message || "Error al descargar el documento");
    }
  }

  // Carga el borrador del manual y abre el editor Tiptap en un modal
  async function handleOpenEditor(tipo: "manual-gestion" | "pgd") {
    setCargandoPlantilla(true);
    setErrorText("");
    try {
      const response = await auth.request<any>(`/onboarding/plantilla-manual/${tipo}`);
      if (response.statusCode === 200) {
        setTipoManualActivo(tipo);
        editor?.commands.setContent(response.body.html || "");
        setShowEditorModal(true);
      } else {
        setErrorText(response.body.error || "Error al cargar la plantilla del manual.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Error al conectar con el servidor para obtener la plantilla.");
    } finally {
      setCargandoPlantilla(false);
    }
  }

  // Envía el HTML editado en Tiptap para su oficialización e inmutabilidad
  async function handleOficializarManual() {
    if (!tipoManualActivo || !editor) return;
    setSubmitting(true);
    setErrorText("");
    try {
      const response = await auth.request<any>("/onboarding/oficializar-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoManualActivo,
          htmlContent: editor.getHTML()
        })
      });

      if (response.statusCode === 200) {
        setWizard(response.body.wizard);
        // Actualizar respuestas del paso 5 locales
        const mapaRespuestas = response.body.wizard.respuestas || {};
        const paso5Respuestas = mapaRespuestas["5"] || {};
        setRespuestasPaso(paso5Respuestas);
        setShowEditorModal(false);
        setTipoManualActivo(null);
      } else {
        setErrorText(response.body.error || "Error al oficializar el manual.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Error al oficializar el manual.");
    } finally {
      setSubmitting(false);
    }
  }


  if (loading) {
    return (
      <PortalLayout>
        <div style={{ padding: '40px', textAlign: 'center' }} className="text-muted">
          Cargando Plan de Trabajo Guiado...
        </div>
      </PortalLayout>
    );
  }

  const pasoActual = wizard?.pasoActual ?? 0;
  const checklist = wizard?.tareasChecklist || [];
  const progreso = wizard?.progreso ?? 0;

  // Lista de nombres estáticos para cada uno de los pasos
  const NOMBRES_PASOS = [
    "0. Evaluación Inicial",
    "1. Fondos Acumulados",
    "2. Procesamiento de Fondos",
    "3. Comité de Archivo",
    "4. TRD y TVR",
    "5. Manuales y Guías",
    "6. Proyección de Documentos",
    "7. Disposición y Cierre"
  ];

  return (
    <PortalLayout>
      <div className="wizard-layout-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Cabecera y Barra de Progreso */}
        <div className="card" style={{ padding: '24px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdAutoAwesome size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Plan de Trabajo Guiado (Asistente de Implementación)</h1>
              <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
                Establece el Sistema de Gestión Documental (SGD) de tu empresa paso a paso cumpliendo la Ley 594 de 2000.
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
              <span>Madurez Archivística Organizacional</span>
              <span>{progreso}%</span>
            </div>
            <div style={{ background: '#f1f3f4', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${progreso}%`, 
                  background: progreso === 100 ? '#34a853' : 'var(--primary)', 
                  height: '100%', 
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Cuerpo del layout en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Navegador Lateral de Pasos */}
          <div className="card" style={{ padding: '16px', background: 'var(--surface)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
              Pasos del Plan
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {NOMBRES_PASOS.map((nombre, idx) => {
                // Saltar visualmente el paso 2 si no aplica (fondos acumulados es 'no')
                const poseeFondosRes = wizard?.respuestas && (wizard.respuestas['1'] || wizard.respuestas.get?.('1'));
                const noTieneFondos = poseeFondosRes && (poseeFondosRes.poseeFondos === 'no' || poseeFondosRes.tieneFondos === 'no');
                if (idx === 2 && noTieneFondos) return null;

                const esActivo = pasoActual === idx;
                const esCompletado = pasoActual > idx;
                
                return (
                  <div 
                    key={idx} 
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: esActivo ? 'bold' : 'normal',
                      background: esActivo ? 'rgba(26,115,232,0.08)' : 'transparent',
                      color: esActivo ? 'var(--primary)' : esCompletado ? '#34a853' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderLeft: esActivo ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                  >
                    {esCompletado ? (
                      <MdCheckCircle size={18} style={{ color: '#34a853' }} />
                    ) : (
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: esActivo ? '2px solid var(--primary)' : '2px solid var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {idx}
                      </div>
                    )}
                    <span>{nombre}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área Central de Cuestionario y Acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Mensajes de error del formulario */}
            {errorText && (
              <div className="card" style={{ padding: '16px', background: 'rgba(217,48,37,0.06)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdWarning size={20} />
                <span>{errorText}</span>
              </div>
            )}

            {/* Cuestionario por pasos */}
            <div className="card" style={{ padding: '32px', background: 'var(--surface)' }}>
              
              {/* PASO 0: Evaluacion Inicial */}
              {pasoActual === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdBusiness style={{ color: 'var(--primary)' }} /> Paso 0: Evaluación Inicial y Diagnóstico Rápido
                  </h2>
                  <p className="text-muted">
                    Para comenzar a estructurar tu Sistema de Gestión Documental (SGD), cuéntanos si la organización ya posee experiencia previa en archivo.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ cuentaConSGD: 'no' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>No, nunca se ha implementado nada</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Empezaremos desde cero con las mejores prácticas de la norma colombiana.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ cuentaConSGD: 'parcial' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, pero es informal o parcial</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Contamos con carpetas físicas y un orden básico, pero sin actas de comités ni TRD oficiales.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ cuentaConSGD: 'completo' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, tenemos uno completo pero queremos migrarlo</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Deseamos traer nuestros manuales, dependencias e instrumentos archivísticos preexistentes.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 1: Fondos Acumulados */}
              {pasoActual === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdHistory style={{ color: 'var(--primary)' }} /> Paso 1: Fondos Acumulados (Archivo Histórico)
                  </h2>
                  <p className="text-muted">
                    ¿La empresa posee documentos físicos o electrónicos acumulados producidos con anterioridad al inicio de este sistema?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ poseeFondos: 'si', estado: 'desordenados' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, y están desordenados</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Tenemos cajas o depósitos con archivos históricos acumulados pendientes de clasificar.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ poseeFondos: 'si', estado: 'clasificados' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, pero ya están clasificados o valorados parcialmente</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Contamos con un listado básico, fechas extremas o inventario general.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ poseeFondos: 'no' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>No, empezamos completamente desde cero</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>No hay archivos históricos acumulados de administraciones o años anteriores.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: Procesamiento de Fondos Acumulados */}
              {pasoActual === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdHistory style={{ color: 'var(--primary)' }} /> Paso 2: Procesamiento de Fondos Acumulados
                  </h2>
                  <p className="text-muted">
                    Define la metodología que utilizarás para organizar, valorar y legalizar tus documentos históricos acumulados.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoProcesamiento: 'valoracion_rapida' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Valoración Rápida Asistida (Recomendado)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Te formularemos preguntas concretas sobre el lote para decidir qué conservar, digitalizar o eliminar.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoProcesamiento: 'tvd' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Tabla de Valoración Documental (TVD)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Construiremos la TVD formal para el fondo acumulado conforme a la normativa.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoProcesamiento: 'ingreso_manual' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Ingreso Manual (Carga masiva FUID)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Carga el inventario FUID directamente a la plataforma mediante archivo Excel/CSV.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: Comité de Archivo */}
              {pasoActual === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdPeople style={{ color: 'var(--primary)' }} /> Paso 3: Comité de Archivo (Gobernanza)
                  </h2>
                  <p className="text-muted">
                    El Comité de Archivo es el órgano colegiado interno encargado de aprobar los manuales, TRD y la disposición documental en la empresa.
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      guardarRespuesta({
                        tieneComite: respuestasPaso.tieneComite || 'no',
                        presidente: respuestasPaso.presidente || '',
                        secretario: respuestasPaso.secretario || '',
                        responsableArchivo: respuestasPaso.responsableArchivo || '',
                        funciones: respuestasPaso.funciones || ''
                      });
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}
                  >
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.95rem' }}>¿Cuenta con un Comité de Archivo legalmente conformado?</label>
                      <select 
                        className="edit-input" 
                        style={{ width: '100%' }}
                        value={respuestasPaso.tieneComite || ''}
                        onChange={e => setRespuestasPaso({...respuestasPaso, tieneComite: e.target.value})}
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option value="si">Sí, tenemos acta de conformación vigente</option>
                        <option value="verbal">Existe de manera informal (verbal, sin acta)</option>
                        <option value="no">No existe</option>
                      </select>
                    </div>

                    {(respuestasPaso.tieneComite === 'no' || respuestasPaso.tieneComite === 'verbal') && (
                      <div className="alert alert-info" style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                        💡 <strong>Sugerencia Normativa:</strong> El sistema puede autogenerar el Acta de Constitución obligatoria para que sea firmada y declarada oficial. Ingresa los miembros a continuación:
                      </div>
                    )}

                    {respuestasPaso.tieneComite && respuestasPaso.tieneComite !== 'si' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid var(--primary)', paddingLeft: '16px', marginTop: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Presidente (Representante Legal o Delegado)</label>
                            <input 
                              type="text" 
                              className="edit-input" 
                              style={{ width: '100%' }}
                              value={respuestasPaso.presidente || ''}
                              placeholder="Nombre del cargo/miembro"
                              onChange={e => setRespuestasPaso({...respuestasPaso, presidente: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Secretario del Comité</label>
                            <input 
                              type="text" 
                              className="edit-input" 
                              style={{ width: '100%' }}
                              value={respuestasPaso.secretario || ''}
                              placeholder="Nombre del secretario"
                              onChange={e => setRespuestasPaso({...respuestasPaso, secretario: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Responsable de Archivo o Tecnología (Secretaría Técnica)</label>
                          <input 
                            type="text" 
                            className="edit-input" 
                            style={{ width: '100%' }}
                            value={respuestasPaso.responsableArchivo || ''}
                            placeholder="Nombre del líder de archivo"
                            onChange={e => setRespuestasPaso({...respuestasPaso, responsableArchivo: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                      {respuestasPaso.tieneComite && respuestasPaso.tieneComite !== 'si' && (
                        <button 
                          type="button" 
                          className="btn btn-ghost" 
                          style={{ borderRadius: '22px' }}
                          onClick={async () => {
                            if (!respuestasPaso.presidente || !respuestasPaso.secretario) {
                              alert("Ingresa los nombres de los miembros para generar el acta.");
                              return;
                            }
                            // Guardar primero
                            await guardarRespuesta(respuestasPaso);
                            // Descargar documento
                            handleDownloadDoc('ACTA_COMITE');
                          }}
                        >
                          <MdFileDownload /> Generar Acta de Conformación
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '22px' }} disabled={submitting}>
                        Continuar <MdNavigateNext />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 4: TRD / TVR */}
              {pasoActual === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdDescription style={{ color: 'var(--primary)' }} /> Paso 4: Instrumentos Archivísticos (TRD / TVD)
                  </h2>
                  <p className="text-muted">
                    Selecciona el instrumento archivístico que requiere tu organización. La **TRD** regula los documentos actuales y futuros; la **TVD** regula la disposición final de los fondos históricos.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ instrumento: 'trd' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>TRD (Tabla de Retención Documental)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Recomendado. Regula la producción de documentos actuales (Gestión, Central, Disposición Final).</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ instrumento: 'tvd' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>TVD (Tabla de Valoración Documental)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Requerido si solo se procesarán fondos acumulados históricos y no habrá producción documental actual.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ instrumento: 'ambos' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Ambos Instrumentos</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Implementación completa de TRD para la producción actual y TVD para el archivo histórico.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 5: Manuales, Guías y Formatos */}
              {pasoActual === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdAssignment style={{ color: 'var(--primary)' }} /> Paso 5: Manuales, Guías y Formatos del SGD
                  </h2>
                  <p className="text-muted">
                    Selecciona los documentos normativos e instrumentos internos con los que cuenta actualmente tu organización. El sistema generará tareas para aquellos que no tengas conformados.
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      guardarRespuesta({
                        manualGestion: respuestasPaso.manualGestion || false,
                        guiaOrganizacion: respuestasPaso.guiaOrganizacion || false,
                        tablaControlAcceso: respuestasPaso.tablaControlAcceso || false,
                        politicaConservacion: respuestasPaso.politicaConservacion || false,
                        pgd: respuestasPaso.pgd || false
                      });
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}
                  >
                    {/* Manual de Gestión Documental */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fa', borderRadius: '12px', gap: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={respuestasPaso.manualGestion || false}
                          onChange={e => setRespuestasPaso({...respuestasPaso, manualGestion: e.target.checked})}
                        />
                        <div>
                          <strong>Manual de Gestión Documental</strong>
                          <div className="small text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Directrices operativas para producción, radicación y archivo.</div>
                        </div>
                      </label>
                      <button 
                        type="button" 
                        className="btn btn-secondary small" 
                        style={{ fontSize: '0.8rem', padding: '6px 12px', height: 'auto', borderRadius: '22px' }}
                        onClick={() => handleOpenEditor('manual-gestion')}
                        disabled={cargandoPlantilla || submitting}
                      >
                        {cargandoPlantilla && tipoManualActivo === 'manual-gestion' ? "Cargando..." : (respuestasPaso.manualGestion ? "Editar Oficializado" : "Generar Borrador")}
                      </button>
                    </div>

                    {/* Programa de Gestión Documental (PGD) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fa', borderRadius: '12px', gap: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={respuestasPaso.pgd || false}
                          onChange={e => setRespuestasPaso({...respuestasPaso, pgd: e.target.checked})}
                        />
                        <div>
                          <strong>Programa de Gestión Documental (PGD)</strong>
                          <div className="small text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Planificación estratégica de procesos de archivo a mediano/largo plazo.</div>
                        </div>
                      </label>
                      <button 
                        type="button" 
                        className="btn btn-secondary small" 
                        style={{ fontSize: '0.8rem', padding: '6px 12px', height: 'auto', borderRadius: '22px' }}
                        onClick={() => handleOpenEditor('pgd')}
                        disabled={cargandoPlantilla || submitting}
                      >
                        {cargandoPlantilla && tipoManualActivo === 'pgd' ? "Cargando..." : (respuestasPaso.pgd ? "Editar Oficializado" : "Generar Borrador")}
                      </button>
                    </div>

                    {/* Guía de Organización */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.guiaOrganizacion || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, guiaOrganizacion: e.target.checked})}
                      />
                      <div>
                        <strong>Guía para la Organización de Archivos de Gestión</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Instrucciones prácticas de foliación, rotulación de carpetas y ordenación.</div>
                      </div>
                    </label>

                    {/* Tabla de Control de Acceso */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.tablaControlAcceso || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, tablaControlAcceso: e.target.checked})}
                      />
                      <div>
                        <strong>Tabla de Control de Acceso y Seguridad</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Roles y permisos para la consulta y custodia de expedientes sensibles.</div>
                      </div>
                    </label>

                    {/* Política de Conservación */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.politicaConservacion || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, politicaConservacion: e.target.checked})}
                      />
                      <div>
                        <strong>Política de Conservación y Disposición Final</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Lineamientos de preservación a largo plazo y actas de eliminación.</div>
                      </div>
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        style={{ borderRadius: '22px' }}
                        onClick={async () => {
                          // Guardar primero
                          await guardarRespuesta(respuestasPaso);
                          // Descargar documento
                          handleDownloadDoc('POLITICA');
                        }}
                      >
                        <MdFileDownload /> Generar Política Documental
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '22px' }} disabled={submitting}>
                        Continuar <MdNavigateNext />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 6: Proyección de Documentos */}
              {pasoActual === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdTrendingUp style={{ color: 'var(--primary)' }} /> Paso 6: Proyección de Documentos y Expedientes Activos
                  </h2>
                  <p className="text-muted">
                    ¿Vas a gestionar o producir documentos nuevos de forma actual en la plataforma (ej. correspondencia, contratos, actas) además de los fondos acumulados?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ gestionarNuevos: 'si', crearExpedientesAuto: 'si' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, desde ahora (Creación de expedientes automática)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>El sistema creará y estructurará de forma automática expedientes vacíos en estado abierto según las series de tu TRD.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ gestionarNuevos: 'si', crearExpedientesAuto: 'no' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Sí, desde ahora (Creación de expedientes manual)</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Configuraremos la TRD, pero el responsable de cada área abrirá los expedientes manualmente cuando sea necesario.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ gestionarNuevos: 'no' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>No, solo procesaremos fondos acumulados históricos</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>La organización se enfocará en el inventariado y digitalización del archivo inactivo acumulado.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 7: Ciclo de vida y Disposición */}
              {pasoActual === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdDeleteSweep style={{ color: 'var(--primary)' }} /> Paso 7: Ciclo de Vida y Disposición Final
                  </h2>
                  <p className="text-muted">
                    Establece el método principal mediante el cual legalizarás la disposición final de los expedientes al cumplir su retención (gestión y central).
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoDisposicion: 'eliminacion_acta' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Eliminación Autorizada con Acta Inmutable</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>El sistema generará borradores de actas y requerirá aprobación digital de los jefes de dependencias.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoDisposicion: 'digitalizacion_destruccion' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Digitalización y posterior destrucción física</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Preservación digital a largo plazo con SHA-256 e inhabilitación controlada de soportes físicos.</div>
                      </div>
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ justifyContent: 'flex-start', padding: '16px', height: 'auto', borderRadius: '12px', border: '1px solid rgba(60,64,67,0.12)' }}
                      onClick={() => guardarRespuesta({ metodoDisposicion: 'conservacion_total' })}
                      disabled={submitting}
                    >
                      <div>
                        <strong>Conservación Total Permanente</strong>
                        <div className="small text-muted" style={{ fontWeight: 'normal', marginTop: '4px' }}>Todos los expedientes del ciclo vital serán guardados indefinidamente sin eliminación.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ASISTENTE COMPLETADO (COMPLETO) */}
              {pasoActual > 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0', textAlign: 'center' }}>
                  <MdCheckCircle size={64} style={{ color: '#34a853' }} />
                  <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)' }}>¡Plan de Implementación Completado!</h2>
                  <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    Has finalizado el diagnóstico y la configuración base del SGD para esta organización. Tu porcentaje de madurez archivística se ha actualizado.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => handleDownloadDoc('ACTA_COMITE')}
                    >
                      <MdFileDownload /> Acta de Comité
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => handleDownloadDoc('POLITICA')}
                    >
                      <MdFileDownload /> Política SGD
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Ir al Dashboard Operativo
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Checklist de Tareas Generadas (Solo si hay tareas) */}
            {checklist.length > 0 && (
              <div className="card" style={{ padding: '24px', background: 'var(--surface)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdAssignment style={{ color: 'var(--primary)' }} /> Checklist y Plan de Trabajo Generado
                </h3>
                <p className="small text-muted" style={{ marginBottom: '16px' }}>
                  A continuación se listan las actividades requeridas para regularizar tu sistema de gestión documental. Haz clic en cada una para ir al módulo correspondiente:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checklist.map((tarea: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => { if (tarea.moduloDestino) window.location.href = tarea.moduloDestino; }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        cursor: tarea.moduloDestino ? 'pointer' : 'default',
                        borderLeft: tarea.completada ? '4px solid #34a853' : '4px solid #fbbc05',
                        transition: 'background-color 150ms'
                      }}
                      className="task-item-hover"
                    >
                      <input 
                        type="checkbox" 
                        checked={tarea.completada || false} 
                        readOnly 
                        style={{ cursor: 'pointer' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: tarea.completada ? 'line-through' : 'none' }}>
                          {tarea.titulo}
                        </span>
                        {tarea.moduloDestino && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px' }}>Ir al módulo correspondiente →</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar informativo */}
            <div className="card" style={{ padding: '20px', background: '#f8f9fa', border: '1px solid rgba(60,64,67,0.12)' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdInfo style={{ color: 'var(--primary)' }} /> Nota Normativa (Ley 594 de 2000)
              </h3>
              <p className="small text-muted" style={{ marginTop: '8px', lineHeight: 1.4 }}>
                Este plan de trabajo está estructurado bajo las directrices del Archivo General de la Nación (AGN). La regularización de comités y tablas de retención garantiza la inmutabilidad y valor probatorio de tus documentos.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Modal del Editor Tiptap para manuales y guías */}
      {showEditorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="card" style={{
            width: '95%',
            maxWidth: '1100px',
            height: '90%',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            {/* Cabecera del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              background: 'var(--surface)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  Borrador Oficial: {tipoManualActivo === 'manual-gestion' ? 'Manual de Gestión Documental' : 'Programa de Gestión Documental (PGD)'}
                </h3>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                  Edite las cláusulas y presione "Oficializar y Firmar" para generar el PDF/A inmutable.
                </p>
              </div>
              <button 
                type="button"
                className="btn btn-ghost" 
                style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }}
                onClick={() => {
                  setShowEditorModal(false);
                  setTipoManualActivo(null);
                }}
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Barra de herramientas de Tiptap */}
            <div className="editor-toolbar" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              padding: '12px 24px',
              background: '#f8f9fa',
              borderBottom: '1px solid rgba(0,0,0,0.08)'
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

            {/* Área editable (Simulando hoja A4) */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#f0f0f0',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div className="tiptap-paper" style={{
                width: '100%',
                maxWidth: '800px',
                minHeight: '29.7cm',
                background: 'white',
                padding: '40px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                outline: 'none',
                boxSizing: 'border-box'
              }}>
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Pie de Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              background: 'var(--surface)'
            }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ borderRadius: '22px' }}
                onClick={() => {
                  setShowEditorModal(false);
                  setTipoManualActivo(null);
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleOficializarManual}
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
