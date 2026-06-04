import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

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

export default function AsistenteOnboarding() {
  const auth = useAuth();
  const [wizard, setWizard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  // Estado local para capturar el valor de las preguntas del paso actual
  const [respuestasPaso, setRespuestasPaso] = useState<any>({});

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
                      });
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.manualGestion || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, manualGestion: e.target.checked})}
                      />
                      <div>
                        <strong>Manual de Gestión Documental</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>Directrices operativas para producción, radicación y archivo.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.guiaOrganizacion || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, guiaOrganizacion: e.target.checked})}
                      />
                      <div>
                        <strong>Guía para la Organización de Archivos de Gestión</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>Instrucciones prácticas de foliación, rotulación de carpetas y ordenación.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.tablaControlAcceso || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, tablaControlAcceso: e.target.checked})}
                      />
                      <div>
                        <strong>Tabla de Control de Acceso y Seguridad</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>Roles y permisos para la consulta y custodia de expedientes sensibles.</div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={respuestasPaso.politicaConservacion || false}
                        onChange={e => setRespuestasPaso({...respuestasPaso, politicaConservacion: e.target.checked})}
                      />
                      <div>
                        <strong>Política de Conservación y Disposición Final</strong>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>Lineamientos de preservación a largo plazo y actas de eliminación.</div>
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
                        <MdFileDownload /> Generar Borrador de Política SGD
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
    </PortalLayout>
  );
}
