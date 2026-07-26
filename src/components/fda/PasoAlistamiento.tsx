import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { InsumosCalculados, DiagnosticoDIAData } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdCalculate = (IconsMd as any).MdCalculate || (IconsMd as any).MdFunctions;
const MdSanitizer = (IconsMd as any).MdSanitizer || (IconsMd as any).MdHealthAndSafety;
const MdInventory = (IconsMd as any).MdInventory;
const MdWarning = (IconsMd as any).MdWarning;
const MdSave = (IconsMd as any).MdSave;

export default function PasoAlistamiento() {
  const auth = useAuth();
  const [metrosLineales, setMetrosLineales] = useState<number>(50);
  const [diasEstimados, setDiasEstimados] = useState<number>(30);
  const [auxiliares, setAuxiliares] = useState<number>(4);
  const [insumos, setInsumos] = useState<InsumosCalculados | null>(null);
  const [calculando, setCalculando] = useState(false);

  // Matriz de Riesgos
  const [riesgoGoteras, setRiesgoGoteras] = useState(false);
  const [riesgoHongos, setRiesgoHongos] = useState(false);
  const [riesgoPlagas, setRiesgoPlagas] = useState(false);
  const [riesgoSaturacion, setRiesgoSaturacion] = useState(false);

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const fetchDiagnostico = async () => {
    try {
      const res = await auth.request<{ diagnostico: DiagnosticoDIAData }>("/fondos-acumulados/diagnostico-dia");
      if (res && res.diagnostico && res.diagnostico.lecturasAmbientales) {
        setRiesgoPlagas(res.diagnostico.lecturasAmbientales.presenciaPlagasActivas || false);
        // Supongamos que se guardaron antes otros datos en un campo genérico si existieran
      }
    } catch (err) {
      console.error("Error al cargar diagnostico para matriz de riesgos", err);
    }
  };

  const handleCalcular = async () => {
    setCalculando(true);
    try {
      const res = await auth.request<{ insumos: InsumosCalculados }>("/fondos-acumulados/calculo-insumos", {
        method: "POST",
        body: JSON.stringify({ metrosLineales, diasEstimados, auxiliares })
      });
      if (res && res.insumos) {
        setInsumos(res.insumos);
      }
    } catch (err) {
      console.error("Error al calcular insumos", err);
    } finally {
      setCalculando(false);
    }
  };

  const handleGuardarRiesgos = async () => {
    try {
      // Usaremos lecturasAmbientales.presenciaPlagasActivas para plagas
      await auth.request("/fondos-acumulados/diagnostico-dia", {
        method: "PUT",
        body: JSON.stringify({
          lecturasAmbientales: {
             presenciaPlagasActivas: riesgoPlagas
             // En un modelo completo se agregarían los demás riesgos
          }
        })
      });
      alert("Inspección de riesgos guardada.");
    } catch (err) {
      console.error("Error al guardar riesgos", err);
    }
  };

  return (
    <div className="paso-alistamiento" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdCalculate /> Paso 0: Alistamiento y Proyección de Insumos (m.l. & EPP)
        </h3>
        <p className="small text-muted">
          Ingrese los metros lineales estimados y el equipo de trabajo en campo para proyectar automáticamente las cajas Ref. X-200, carpetas neutras y el equipo de protección personal (Tapabocas N95 y Guantes de Nitrilo).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Metros Lineales Estimados (m.l.):
            </label>
            <input type="number" className="edit-input" value={metrosLineales} onChange={(e) => setMetrosLineales(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Duración Estimada (Días):
            </label>
            <input type="number" className="edit-input" value={diasEstimados} onChange={(e) => setDiasEstimados(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Auxiliares Archivísticos:
            </label>
            <input type="number" className="edit-input" value={auxiliares} onChange={(e) => setAuxiliares(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleCalcular} disabled={calculando} style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <MdCalculate /> {calculando ? "Calculando..." : "Proyectar Insumos y EPP"}
        </button>
      </div>

      {insumos && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Tarjeta de Almacenamiento */}
          <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdInventory /> Materiales de Almacenamiento y Conservación
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Cajas Ref. X-200 (Cartón Neutro):</span>
                <strong>{insumos.almacenamiento.cajasX200} unidades</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Carpetas Propalcote 4 Aletas (320g):</span>
                <strong>{insumos.almacenamiento.carpetas4Aletas} unidades</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                <span>Cinta de Algodón (Rollos x 100m):</span>
                <strong>{insumos.almacenamiento.rollosCintaAlgodon} rollos</strong>
              </li>
            </ul>
          </div>

          {/* Tarjeta de Bioseguridad EPP */}
          <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdSanitizer /> Bioseguridad y Equipos de Protección (EPP)
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Mascarillas / Tapabocas N95 (NIOSH):</span>
                <strong style={{ color: "var(--danger)" }}>{insumos.bioseguridadEPP.tapabocasN95Unidades} unidades</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Guantes de Nitrilo (Cajas x 100):</span>
                <strong>{insumos.bioseguridadEPP.cajasGuantesNitrilo100} cajas</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Batas Tyvek Desechables:</span>
                <strong>{insumos.bioseguridadEPP.batasTyvek} unidades</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                <span>Lápices HB (Foliación Técnica):</span>
                <strong>{insumos.bioseguridadEPP.lapicesHB} unidades</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Matriz de Riesgos Iniciales */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdWarning color="orange" /> Matriz de Inspección de Riesgos Iniciales
        </h4>
        <p className="small text-muted">Marque las contingencias físicas detectadas en el depósito de custodia:</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoGoteras} onChange={(e) => setRiesgoGoteras(e.target.checked)} />
            Goteras o Filtaciones de Agua
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoHongos} onChange={(e) => setRiesgoHongos(e.target.checked)} />
            Presencia de Hongos Visibles
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoPlagas} onChange={(e) => setRiesgoPlagas(e.target.checked)} />
            Plagas (Termitas / Roedores)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoSaturacion} onChange={(e) => setRiesgoSaturacion(e.target.checked)} />
            Saturación Extrema de Espacio
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleGuardarRiesgos} style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
           <MdSave /> Guardar Inspección de Riesgos
        </button>
      </div>
    </div>
  );
}
