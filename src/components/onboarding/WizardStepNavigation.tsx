import * as IconsMd from "react-icons/md";
import { OnboardingWizard } from "../../types/types";

const MdCheckCircle = (IconsMd as any).MdCheckCircle;

interface WizardStepNavigationProps {
  pasoActual: number;
  wizard: OnboardingWizard | null;
  nombresPasos: string[];
}

export default function WizardStepNavigation({
  pasoActual,
  wizard,
  nombresPasos,
}: WizardStepNavigationProps) {
  // Verificar si posee fondos según respuestas del paso 1
  const poseeFondosRes = wizard?.respuestas ? wizard.respuestas["1"] : null;
  const noTieneFondos = poseeFondosRes && (poseeFondosRes.poseeFondos === "no" || poseeFondosRes.tieneFondos === "no");

  return (
    <div className="card" style={{ padding: "16px", background: "var(--surface)" }}>
      <h4 style={{ margin: "0 0 16px 0", fontSize: "0.9rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px" }}>
        Pasos del Plan
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {nombresPasos.map((nombre, idx) => {
          // Saltar visualmente el paso 2 si no aplica
          if (idx === 2 && noTieneFondos) return null;

          const esActivo = pasoActual === idx;
          const esCompletado = pasoActual > idx;
          
          return (
            <div 
              key={idx} 
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: esActivo ? "bold" : "normal",
                background: esActivo ? "rgba(26,115,232,0.08)" : "transparent",
                color: esActivo ? "var(--primary)" : esCompletado ? "#34a853" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderLeft: esActivo ? "3px solid var(--primary)" : "3px solid transparent"
              }}
            >
              {esCompletado ? (
                <MdCheckCircle size={18} style={{ color: "#34a853" }} />
              ) : (
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: esActivo ? "2px solid var(--primary)" : "2px solid var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold"
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
  );
}
