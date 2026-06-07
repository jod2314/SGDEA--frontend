import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { OnboardingWizard, ApiResponse } from "../types/types";

// Importar subcomponentes
import WizardProgressHeader from "../components/onboarding/WizardProgressHeader";
import WizardStepNavigation from "../components/onboarding/WizardStepNavigation";
import WizardTaskChecklist from "../components/onboarding/WizardTaskChecklist";
import WizardTiptapEditorModal from "../components/onboarding/WizardTiptapEditorModal";
import PasoEvaluacionInicial from "../components/onboarding/PasoEvaluacionInicial";
import PasoFondosAcumulados from "../components/onboarding/PasoFondosAcumulados";
import PasoProcesamientoFondos from "../components/onboarding/PasoProcesamientoFondos";
import PasoComiteArchivo from "../components/onboarding/PasoComiteArchivo";
import PasoInstrumentosArchivisticos from "../components/onboarding/PasoInstrumentosArchivisticos";
import PasoManualesFormatos from "../components/onboarding/PasoManualesFormatos";
import PasoProyeccionDocumentos from "../components/onboarding/PasoProyeccionDocumentos";
import PasoCicloVida from "../components/onboarding/PasoCicloVida";
import PasoCompletado from "../components/onboarding/PasoCompletado";

const MdWarning = (IconsMd as any).MdWarning;
const MdInfo = (IconsMd as any).MdInfo;

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

export default function AsistenteOnboarding() {
  const auth = useAuth();
  const [wizard, setWizard] = useState<OnboardingWizard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [respuestasPaso, setRespuestasPaso] = useState<Record<string, any>>({});

  // Estados del editor modal
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [tipoManualActivo, setTipoManualActivo] = useState<"manual-gestion" | "pgd" | null>(null);
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);
  const [plantillaHtml, setPlantillaHtml] = useState("");

  const selectedEmpresa = auth.getSelectedEmpresa();

  const isTareaCompletada = (titulo: string): boolean => {
    if (!wizard || !wizard.tareasChecklist) return false;
    return wizard.tareasChecklist.some(
      (tarea) => tarea.titulo === titulo && tarea.completada
    );
  };

  const fetchWizardState = async () => {
    try {
      const response = await auth.request<ApiResponse<{ wizard: OnboardingWizard }>>("/onboarding/assistant/state");
      if (response.statusCode === 200) {
        const w = response.body.wizard;
        setWizard(w);
        setRespuestasPaso(w.respuestas[String(w.pasoActual)] || {});
      }
    } catch (error) {
      console.error("Error al cargar estado del asistente:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchWizardState();
    }
  }, [auth.isAuthenticated, selectedEmpresa?.id]);

  const guardarRespuesta = async (payload: Record<string, any>) => {
    if (!wizard) return;
    setSubmitting(true);
    setErrorText("");
    try {
      const response = await auth.request<ApiResponse<{ wizard: OnboardingWizard }>>("/onboarding/assistant/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paso: wizard.pasoActual, respuestas: payload })
      });
      if (response.statusCode === 200) {
        const w = response.body.wizard;
        setWizard(w);
        setRespuestasPaso(w.respuestas[String(w.pasoActual)] || {});
      } else {
        setErrorText(response.body.error || "Error al registrar la respuesta.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadDoc = async (tipo: string) => {
    try {
      const blob = await auth.request<Blob>(`/onboarding/generar/${tipo}`, {
        method: "POST",
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SISTEMA_${tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error: any) {
      alert(error.message || "Error al descargar el documento");
    }
  };

  const handleOpenEditor = async (tipo: "manual-gestion" | "pgd") => {
    setCargandoPlantilla(true);
    setErrorText("");
    try {
      const response = await auth.request<ApiResponse<{ html?: string; error?: string }>>(`/onboarding/plantilla-manual/${tipo}`);
      if (response.statusCode === 200) {
        setTipoManualActivo(tipo);
        setPlantillaHtml(response.body.html || "");
        setShowEditorModal(true);
      } else {
        setErrorText(response.body.error || "Error al cargar la plantilla del manual.");
      }
    } catch (err: any) {
      setErrorText(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargandoPlantilla(false);
    }
  };

  const handleOficializarManual = async (htmlContent: string) => {
    if (!tipoManualActivo) return;
    setSubmitting(true);
    setErrorText("");
    try {
      const response = await auth.request<ApiResponse<{ wizard: OnboardingWizard; error?: string }>>("/onboarding/oficializar-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: tipoManualActivo, htmlContent })
      });
      if (response.statusCode === 200) {
        const w = response.body.wizard;
        setWizard(w);
        setRespuestasPaso(w.respuestas["5"] || {});
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
  };

  if (loading) {
    return (
      <PortalLayout>
        <div style={{ padding: "40px", textAlign: "center" }} className="text-muted">
          Cargando Plan de Trabajo Guiado...
        </div>
      </PortalLayout>
    );
  }

  const pasoActual = wizard?.pasoActual ?? 0;
  const checklist = wizard?.tareasChecklist || [];
  const progreso = wizard?.progreso ?? 0;

  return (
    <PortalLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <WizardProgressHeader progreso={progreso} />

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" }}>
          
          <WizardStepNavigation pasoActual={pasoActual} wizard={wizard} nombresPasos={NOMBRES_PASOS} />

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {errorText && (
              <div className="card" style={{ padding: "16px", background: "rgba(217,48,37,0.06)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MdWarning size={20} />
                <span>{errorText}</span>
              </div>
            )}

            <div className="card" style={{ padding: "32px", background: "var(--surface)" }}>
              {pasoActual === 0 && <PasoEvaluacionInicial submitting={submitting} onGuardar={guardarRespuesta} />}
              {pasoActual === 1 && <PasoFondosAcumulados submitting={submitting} onGuardar={guardarRespuesta} />}
              {pasoActual === 2 && (
                <PasoProcesamientoFondos 
                  respuestasPaso={respuestasPaso} 
                  submitting={submitting} 
                  isTareaCompletada={isTareaCompletada} 
                  onGuardar={guardarRespuesta} 
                />
              )}
              {pasoActual === 3 && (
                <PasoComiteArchivo 
                  respuestasPaso={respuestasPaso} 
                  submitting={submitting} 
                  isTareaCompletada={isTareaCompletada} 
                  onGuardar={guardarRespuesta} 
                  onDownloadDoc={handleDownloadDoc} 
                />
              )}
              {pasoActual === 4 && (
                <PasoInstrumentosArchivisticos 
                  respuestasPaso={respuestasPaso} 
                  submitting={submitting} 
                  isTareaCompletada={isTareaCompletada} 
                  onGuardar={guardarRespuesta} 
                />
              )}
              {pasoActual === 5 && (
                <PasoManualesFormatos 
                  respuestasPaso={respuestasPaso} 
                  submitting={submitting} 
                  cargandoPlantilla={cargandoPlantilla} 
                  tipoManualActivo={tipoManualActivo} 
                  onGuardar={guardarRespuesta} 
                  onOpenEditor={handleOpenEditor} 
                  onDownloadDoc={handleDownloadDoc} 
                />
              )}
              {pasoActual === 6 && <PasoProyeccionDocumentos submitting={submitting} onGuardar={guardarRespuesta} />}
              {pasoActual === 7 && <PasoCicloVida submitting={submitting} onGuardar={guardarRespuesta} />}
              {pasoActual > 7 && <PasoCompletado onDownloadDoc={handleDownloadDoc} />}
            </div>

            <WizardTaskChecklist checklist={checklist} />

            <div className="card" style={{ padding: "20px", background: "#f8f9fa", border: "1px solid rgba(60,64,67,0.12)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <MdInfo style={{ color: "var(--primary)" }} /> Nota Normativa (Ley 594 de 2000)
              </h3>
              <p className="small text-muted" style={{ marginTop: "8px", lineHeight: 1.4 }}>
                Este plan de trabajo está estructurado bajo las directrices del Archivo General de la Nación (AGN). La regularización de comités y tablas de retención garantiza la inmutabilidad y valor probatorio de tus documentos.
              </p>
            </div>

          </div>
        </div>
      </div>

      <WizardTiptapEditorModal 
        show={showEditorModal} 
        tipo={tipoManualActivo} 
        htmlContent={plantillaHtml} 
        submitting={submitting} 
        onClose={() => { setShowEditorModal(false); setTipoManualActivo(null); }} 
        onOficializar={handleOficializarManual} 
      />

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
