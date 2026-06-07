import * as IconsMd from "react-icons/md";

const MdBusiness = (IconsMd as any).MdBusiness;

interface PasoEvaluacionInicialProps {
  submitting: boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoEvaluacionInicial({ submitting, onGuardar }: PasoEvaluacionInicialProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdBusiness style={{ color: "var(--primary)" }} /> Paso 0: Evaluación Inicial y Diagnóstico Rápido
      </h2>
      <p className="text-muted">
        Para comenzar a estructurar tu Sistema de Gestión Documental (SGD), cuéntanos si la organización ya posee experiencia previa en archivo.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ cuentaConSGD: "no" })}
          disabled={submitting}
        >
          <div>
            <strong>No, nunca se ha implementado nada</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Empezaremos desde cero con las mejores prácticas de la norma colombiana.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ cuentaConSGD: "parcial" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, pero es informal o parcial</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Contamos con carpetas físicas y un orden básico, pero sin actas de comités ni TRD oficiales.
            </div>
          </div>
        </button>
        <button 
          type="button"
          className="btn btn-ghost" 
          style={{ justifyContent: "flex-start", padding: "16px", height: "auto", borderRadius: "12px", border: "1px solid rgba(60,64,67,0.12)", textAlign: "left" }}
          onClick={() => onGuardar({ cuentaConSGD: "completo" })}
          disabled={submitting}
        >
          <div>
            <strong>Sí, tenemos uno completo pero queremos migrarlo</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Deseamos traer nuestros manuales, dependencias e instrumentos archivísticos preexistentes.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
