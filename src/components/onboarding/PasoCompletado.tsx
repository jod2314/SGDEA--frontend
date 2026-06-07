import * as IconsMd from "react-icons/md";

const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;

interface PasoCompletadoProps {
  onDownloadDoc: (tipo: string) => void;
}

export default function PasoCompletado({ onDownloadDoc }: PasoCompletadoProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px 0", textAlign: "center" }}>
      <MdCheckCircle size={64} style={{ color: "#34a853" }} />
      <h2 style={{ margin: 0, fontSize: "1.6rem", color: "var(--text-primary)" }}>¡Plan de Implementación Completado!</h2>
      <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto" }}>
        Has finalizado el diagnóstico y la configuración base del SGD para esta organización. Tu porcentaje de madurez archivística se ha actualizado.
      </p>
      
      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ borderRadius: "22px", display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => onDownloadDoc("ACTA_COMITE")}
        >
          <MdFileDownload /> Acta de Comité
        </button>
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ borderRadius: "22px", display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => onDownloadDoc("POLITICA")}
        >
          <MdFileDownload /> Política SGD
        </button>
        <button 
          type="button"
          className="btn btn-primary" 
          style={{ borderRadius: "22px", display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => { window.location.href = "/dashboard"; }}
        >
          Ir al Dashboard Operativo
        </button>
      </div>
    </div>
  );
}
