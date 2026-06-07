import * as IconsMd from "react-icons/md";
import { TareaChecklist } from "../../types/types";

const MdAssignment = (IconsMd as any).MdAssignment;

interface WizardTaskChecklistProps {
  checklist: TareaChecklist[];
}

export default function WizardTaskChecklist({ checklist }: WizardTaskChecklistProps) {
  if (checklist.length === 0) return null;

  return (
    <div className="card" style={{ padding: "24px", background: "var(--surface)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdAssignment style={{ color: "var(--primary)" }} /> Checklist y Plan de Trabajo Generado
      </h3>
      <p className="small text-muted" style={{ marginBottom: "16px" }}>
        A continuación se listan las actividades requeridas para regularizar tu sistema de gestión documental. Haz clic en cada una para ir al módulo correspondiente:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {checklist.map((tarea, idx) => (
          <div 
            key={idx}
            onClick={() => { if (tarea.moduloDestino) window.location.href = tarea.moduloDestino; }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px", 
              background: "#f8f9fa", 
              borderRadius: "8px",
              cursor: tarea.moduloDestino ? "pointer" : "default",
              borderLeft: tarea.completada ? "4px solid #34a853" : "4px solid #fbbc05",
              transition: "background-color 150ms"
            }}
            className="task-item-hover"
          >
            <input 
              type="checkbox" 
              checked={tarea.completada || false} 
              readOnly 
              style={{ cursor: "pointer" }}
            />
            <div style={{ flexGrow: 1 }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-primary)", textDecoration: tarea.completada ? "line-through" : "none" }}>
                {tarea.titulo}
              </span>
              {tarea.moduloDestino && (
                <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "2px" }}>Ir al módulo correspondiente →</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
