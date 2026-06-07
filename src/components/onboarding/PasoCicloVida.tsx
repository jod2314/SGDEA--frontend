import * as IconsMd from "react-icons/md";

const MdDeleteSweep = (IconsMd as any).MdDeleteSweep;

interface PasoCicloVidaProps {
  submitting: boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoCicloVida({ submitting, onGuardar }: PasoCicloVidaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdDeleteSweep style={{ color: "var(--primary)" }} /> Paso 7: Ciclo de Vida y Disposición Final
      </h2>
      <p className="text-muted">
        Establece el método principal mediante el cual legalizarás la disposición final de los expedientes al cumplir su retención (gestión y central).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ metodoDisposicion: "eliminacion_acta" })}
          disabled={submitting}
        >
          <div>
            <strong>Eliminación Autorizada con Acta Inmutable</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              El sistema generará borradores de actas y requerirá aprobación digital de los jefes de dependencias.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ metodoDisposicion: "digitalizacion_destruccion" })}
          disabled={submitting}
        >
          <div>
            <strong>Digitalización y posterior destrucción física</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Preservación digital a largo plazo con SHA-256 e inhabilitación controlada de soportes físicos.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ metodoDisposicion: "conservacion_total" })}
          disabled={submitting}
        >
          <div>
            <strong>Conservación Total Permanente</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Todos los expedientes del ciclo vital serán guardados indefinidamente sin eliminación.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
