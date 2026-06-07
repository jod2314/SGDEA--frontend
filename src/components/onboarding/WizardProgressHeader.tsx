import * as IconsMd from "react-icons/md";

const MdAutoAwesome = (IconsMd as any).MdAutoAwesome;

interface WizardProgressHeaderProps {
  progreso: number;
}

export default function WizardProgressHeader({ progreso }: WizardProgressHeaderProps) {
  return (
    <div className="card" style={{ padding: "24px", background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <MdAutoAwesome size={32} style={{ color: "var(--primary)" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>Plan de Trabajo Guiado (Asistente de Implementación)</h1>
          <p className="text-muted" style={{ margin: "4px 0 0 0" }}>
            Establece el Sistema de Gestión Documental (SGD) de tu empresa paso a paso cumpliendo la Ley 594 de 2000.
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>
          <span>Madurez Archivística Organizacional</span>
          <span>{progreso}%</span>
        </div>
        <div style={{ background: "#f1f3f4", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
          <div 
            style={{ 
              width: `${progreso}%`, 
              background: progreso === 100 ? "#34a853" : "var(--primary)", 
              height: "100%", 
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
