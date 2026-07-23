import { useState } from "react";
import * as IconsMd from "react-icons/md";

const MdAssignmentTurnedIn = (IconsMd as any).MdAssignmentTurnedIn || (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdPrint = (IconsMd as any).MdPrint;
const MdFactCheck = (IconsMd as any).MdFactCheck || (IconsMd as any).MdVerified;

export default function PasoCierreInforme() {
  const [descargando, setDescargando] = useState(false);
  const [actaGenerada, setActaGenerada] = useState(false);

  const handleExportarFUIDCsv = async () => {
    setDescargando(true);
    try {
      window.open("/api/fondos-acumulados/exportar-fuid", "_blank");
    } catch (err) {
      console.error("Error al exportar FUID", err);
    } finally {
      setDescargando(false);
    }
  };

  const handleGenerarActaCierre = () => {
    setActaGenerada(true);
  };

  return (
    <div className="paso-cierre-informe" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Autollenado FUID Oficial AGN */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAssignmentTurnedIn /> Paso 5: Autollenado del Inventario FUID Definitivo y Acta de Cierre
        </h3>
        <p className="small text-muted">
          El sistema consolida automáticamente la totalidad de unidades documentales organizadas, foliadas e identificadas con sus códigos QR en el Formato Único de Inventario Documental (FUID) oficial del Archivo General de la Nación.
        </p>

        <div style={{ marginTop: "15px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={handleExportarFUIDCsv}
            disabled={descargando}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <MdFileDownload /> {descargando ? "Exportando..." : "Exportar FUID Oficial (CSV / Excel)"}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleGenerarActaCierre}
            style={{ background: "var(--primary)", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <MdFactCheck /> Generar Informe Final de Cierre FDA y Acta
          </button>
        </div>
      </div>

      {/* Vista Previa del Acta de Cierre de Intervención FDA */}
      {actaGenerada && (
        <div className="card" style={{ padding: "25px", background: "var(--surface)", border: "2px solid var(--primary)", borderRadius: "var(--radius)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px" }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "var(--primary)" }}>ACTA DE ENTREGA Y CIERRE TÉCNICO DE FONDO ACUMULADO (FDA)</h4>
              <p className="small text-muted" style={{ margin: 0 }}>Cumplimiento Norma NTC 3393 / Acuerdo 002 del AGN de Colombia</p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
            >
              <MdPrint /> Imprimir Acta
            </button>
          </div>

          <div style={{ marginTop: "20px", fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-primary)" }}>
            <p>
              En la ciudad de Bogotá D.C., se hace entrega formal del <strong>Fondo Documental Acumulado (FDA)</strong> intervenido técnicamente en sus 6 etapas metodológicas: Alistamiento de insumos y EPP (Tapabocas N95/Nitrilo), Investigación de Historia Institucional (CEOF), Diagnóstico DIA con muestreo representativo (Fichas H1 a H14), Organización e Inventariado FUID con códigos QR, y elaboración de las Tablas de Valoración Documental (TVD).
            </p>

            <div style={{ marginTop: "15px", padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
              <h5 style={{ margin: "0 0 10px 0", color: "var(--primary)" }}>Resumen Ejecutivo de Intervención:</h5>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Metros Lineales Intervenidos: <strong>50 m.l.</strong></li>
                <li>Cajas Ref. X-200 Ensambladas e Identificadas con QR: <strong>200 cajas</strong></li>
                <li>Carpetas Neutras Propalcote 4 Aletas (320g): <strong>1.200 expedientes</strong></li>
                <li>Total Folios Limpiados, Deslegajados y Foliados a Lápiz: <strong>240.000 folios</strong></li>
                <li>Series y Subseries Valoradas en la TVD: <strong>12 series documentales</strong></li>
              </ul>
            </div>

            <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--text-primary)", paddingTop: "10px" }}>
                <strong>FIRMA ARCHIVISTA LÍDER DE PROYECTO</strong>
                <p className="small text-muted" style={{ margin: 0 }}>Tarjeta Profesional AGN N° 45892</p>
              </div>
              <div style={{ borderTop: "1px solid var(--text-primary)", paddingTop: "10px" }}>
                <strong>FIRMA REPRESENTANTE LEGAL ENTIDAD</strong>
                <p className="small text-muted" style={{ margin: 0 }}>Comité Interno de Archivo (CIGD)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
