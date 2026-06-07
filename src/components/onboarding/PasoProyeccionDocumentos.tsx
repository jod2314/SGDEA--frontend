import * as IconsMd from "react-icons/md";

const MdTrendingUp = (IconsMd as any).MdTrendingUp;

interface PasoProyeccionDocumentosProps {
  submitting: boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoProyeccionDocumentos({ submitting, onGuardar }: PasoProyeccionDocumentosProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdTrendingUp style={{ color: "var(--primary)" }} /> Paso 6: Proyección de Documentos y Expedientes Activos
      </h2>
      <p className="text-muted">
        ¿Vas a gestionar o producir documentos nuevos de forma actual en la plataforma (ej. correspondencia, contratos, actas) además de los fondos acumulados?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ gestionarNuevos: "si", crearExpedientesAuto: "si" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, desde ahora (Creación de expedientes automática)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              El sistema creará y estructurará de forma automática expedientes vacíos en estado abierto según las series de tu TRD.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ gestionarNuevos: "si", crearExpedientesAuto: "no" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, desde ahora (Creación de expedientes manual)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Configuraremos la TRD, pero el responsable de cada área abrirá los expedientes manualmente cuando sea necesario.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ gestionarNuevos: "no" })}
          disabled={submitting}
        >
          <div>
            <strong>No, solo procesaremos fondos acumulados históricos</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              La organización se enfocará en el inventariado y digitalización del archivo inactivo acumulado.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
