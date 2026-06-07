import React, { useState } from "react";
import * as IconsMd from "react-icons/md";

const MdAssignment = (IconsMd as any).MdAssignment;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;

interface PasoManualesFormatosProps {
  respuestasPaso: Record<string, any>;
  submitting: boolean;
  cargandoPlantilla: boolean;
  tipoManualActivo: "manual-gestion" | "pgd" | null;
  onGuardar: (payload: Record<string, any>) => void;
  onOpenEditor: (tipo: "manual-gestion" | "pgd") => void;
  onDownloadDoc: (tipo: string) => void;
}

export default function PasoManualesFormatos({
  respuestasPaso,
  submitting,
  cargandoPlantilla,
  tipoManualActivo,
  onGuardar,
  onOpenEditor,
  onDownloadDoc,
}: PasoManualesFormatosProps) {
  const [manualGestion, setManualGestion] = useState<boolean>(respuestasPaso.manualGestion || false);
  const [pgd, setPgd] = useState<boolean>(respuestasPaso.pgd || false);
  const [guiaOrganizacion, setGuiaOrganizacion] = useState<boolean>(respuestasPaso.guiaOrganizacion || false);
  const [tablaControlAcceso, setTablaControlAcceso] = useState<boolean>(respuestasPaso.tablaControlAcceso || false);
  const [politicaConservacion, setPoliticaConservacion] = useState<boolean>(respuestasPaso.politicaConservacion || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      manualGestion,
      guiaOrganizacion,
      tablaControlAcceso,
      politicaConservacion,
      pgd,
    });
  };

  const handleDescargarPolitica = async () => {
    await onGuardar({
      manualGestion,
      guiaOrganizacion,
      tablaControlAcceso,
      politicaConservacion,
      pgd,
    });
    onDownloadDoc("POLITICA");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdAssignment style={{ color: "var(--primary)" }} /> Paso 5: Manuales, Guías y Formatos del SGD
      </h2>
      <p className="text-muted">
        Selecciona los documentos normativos e instrumentos internos con los que cuenta actualmente tu organización. El sistema generará tareas para aquellos que no tengas conformados.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        {/* Manual de Gestión Documental */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8f9fa", borderRadius: "12px", gap: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flex: 1, margin: 0 }}>
            <input 
              type="checkbox" 
              checked={manualGestion}
              onChange={(e) => setManualGestion(e.target.checked)}
            />
            <div>
              <strong>Manual de Gestión Documental</strong>
              <div className="small text-muted" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                Directrices operativas para producción, radicación y archivo.
              </div>
            </div>
          </label>
          <button 
            type="button" 
            className="btn btn-secondary small" 
            style={{ fontSize: "0.8rem", padding: "6px 12px", height: "auto", borderRadius: "22px" }}
            onClick={() => onOpenEditor("manual-gestion")}
            disabled={cargandoPlantilla || submitting}
          >
            {cargandoPlantilla && tipoManualActivo === "manual-gestion" 
              ? "Cargando..." 
              : (manualGestion ? "Editar Oficializado" : "Generar Borrador")}
          </button>
        </div>

        {/* Programa de Gestión Documental (PGD) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8f9fa", borderRadius: "12px", gap: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flex: 1, margin: 0 }}>
            <input 
              type="checkbox" 
              checked={pgd}
              onChange={(e) => setPgd(e.target.checked)}
            />
            <div>
              <strong>Programa de Gestión Documental (PGD)</strong>
              <div className="small text-muted" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
                Planificación estratégica de procesos de archivo a mediano/largo plazo.
              </div>
            </div>
          </label>
          <button 
            type="button" 
            className="btn btn-secondary small" 
            style={{ fontSize: "0.8rem", padding: "6px 12px", height: "auto", borderRadius: "22px" }}
            onClick={() => onOpenEditor("pgd")}
            disabled={cargandoPlantilla || submitting}
          >
            {cargandoPlantilla && tipoManualActivo === "pgd" 
              ? "Cargando..." 
              : (pgd ? "Editar Oficializado" : "Generar Borrador")}
          </button>
        </div>

        {/* Guía de Organización */}
        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#f8f9fa", borderRadius: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={guiaOrganizacion}
            onChange={(e) => setGuiaOrganizacion(e.target.checked)}
          />
          <div>
            <strong>Guía para la Organización de Archivos de Gestión</strong>
            <div className="small text-muted" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
              Instrucciones prácticas de foliación, rotulación de carpetas y ordenación.
            </div>
          </div>
        </label>

        {/* Tabla de Control de Acceso */}
        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#f8f9fa", borderRadius: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={tablaControlAcceso}
            onChange={(e) => setTablaControlAcceso(e.target.checked)}
          />
          <div>
            <strong>Tabla de Control de Acceso y Seguridad</strong>
            <div className="small text-muted" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
              Roles y permisos para la consulta y custodia de expedientes sensibles.
            </div>
          </div>
        </label>

        {/* Política de Conservación */}
        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#f8f9fa", borderRadius: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={politicaConservacion}
            onChange={(e) => setPoliticaConservacion(e.target.checked)}
          />
          <div>
            <strong>Política de Conservación y Disposición Final</strong>
            <div className="small text-muted" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>
              Lineamientos de preservación a largo plazo y actas de eliminación.
            </div>
          </div>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ borderRadius: "22px" }}
            onClick={handleDescargarPolitica}
          >
            <MdFileDownload /> Generar Política Documental
          </button>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: "22px" }} disabled={submitting}>
            Continuar <MdNavigateNext />
          </button>
        </div>
      </form>
    </div>
  );
}
