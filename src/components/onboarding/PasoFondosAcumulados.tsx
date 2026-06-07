import * as IconsMd from "react-icons/md";

const MdHistory = (IconsMd as any).MdHistory;

interface PasoFondosAcumuladosProps {
  submitting: boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoFondosAcumulados({ submitting, onGuardar }: PasoFondosAcumuladosProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdHistory style={{ color: "var(--primary)" }} /> Paso 1: Fondos Acumulados (Archivo Histórico)
      </h2>
      <p className="text-muted">
        ¿La empresa posee documentos físicos o electrónicos acumulados producidos con anterioridad al inicio de este sistema?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ poseeFondos: "si", estado: "desordenados" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, y están desordenados</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Tenemos cajas o depósitos con archivos históricos acumulados pendientes de clasificar.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ poseeFondos: "si", estado: "clasificados" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, pero ya están clasificados o valorados parcialmente</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Contamos con un listado básico, fechas extremas o inventario general.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ poseeFondos: "no" })}
          disabled={submitting}
        >
          <div>
            <strong>No, empezamos completamente desde cero</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              No hay archivos históricos acumulados de administraciones o años anteriores.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
