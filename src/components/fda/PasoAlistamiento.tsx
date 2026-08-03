import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { InsumosCalculados, DiagnosticoDIAData } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdCalculate = (IconsMd as any).MdCalculate || (IconsMd as any).MdFunctions;
const MdSanitizer = (IconsMd as any).MdSanitizer || (IconsMd as any).MdHealthAndSafety;
const MdInventory = (IconsMd as any).MdInventory;
const MdWarning = (IconsMd as any).MdWarning;
const MdSave = (IconsMd as any).MdSave;
const MdInfoOutline = (IconsMd as any).MdInfoOutline;
const MdChecklist = (IconsMd as any).MdChecklist;

export default function PasoAlistamiento() {
  const auth = useAuth();
  const [metrosLineales, setMetrosLineales] = useState<number>(50);
  const [diasEstimados, setDiasEstimados] = useState<number>(30);
  const [auxiliares, setAuxiliares] = useState<number>(4);
  const [insumos, setInsumos] = useState<InsumosCalculados | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [errorCalculo, setErrorCalculo] = useState<string | null>(null);
  
  // Matriz de Riesgos
  const [riesgoGoteras, setRiesgoGoteras] = useState(false);
  const [riesgoHongos, setRiesgoHongos] = useState(false);
  const [riesgoPlagas, setRiesgoPlagas] = useState(false);
  const [riesgoSaturacion, setRiesgoSaturacion] = useState(false);

  // Alistamiento Informativo (Mobiliario, Químicos, Herramientas)
  const [mesaTrabajo, setMesaTrabajo] = useState(false);
  const [quimicosPermitidos, setQuimicosPermitidos] = useState(false);
  const [herramientasLimpieza, setHerramientasLimpieza] = useState(false);

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const fetchDiagnostico = async () => {
    try {
      const res = await auth.request<any>("/fondos-acumulados/diagnostico-dia");
      const diag = res?.body?.diagnostico || res?.diagnostico;
      if (diag) {
        if (diag.lecturasAmbientales) {
          setRiesgoPlagas(diag.lecturasAmbientales.presenciaPlagasActivas || false);
          setRiesgoGoteras(diag.lecturasAmbientales.goteras || false);
          setRiesgoHongos(diag.lecturasAmbientales.hongos || false);
          setRiesgoSaturacion(diag.lecturasAmbientales.saturacion || false);
        }
        if (diag.alistamientoInformativo) {
          setMesaTrabajo(diag.alistamientoInformativo.mesaTrabajo || false);
          setQuimicosPermitidos(diag.alistamientoInformativo.quimicosPermitidos || false);
          setHerramientasLimpieza(diag.alistamientoInformativo.herramientasLimpieza || false);
        }
      }
    } catch (err) {
      console.error("Error al cargar diagnostico para matriz de riesgos", err);
    }
  };

  const handleCalcular = async () => {
    setCalculando(true);
    setErrorCalculo(null);
    try {
      const res = await auth.request<any>("/fondos-acumulados/calculo-insumos", {
        method: "POST",
        body: JSON.stringify({ metrosLineales, diasEstimados, auxiliares })
      });
      const calcInsumos = res?.body?.insumos || res?.insumos;
      if (calcInsumos) {
        setInsumos(calcInsumos);
      } else {
        setErrorCalculo("La respuesta del servidor no incluyó los insumos calculados.");
      }
    } catch (err: any) {
      console.error("Error al calcular insumos", err);
      setErrorCalculo(err.message || "Error desconocido de red o servidor.");
    } finally {
      setCalculando(false);
    }
  };

  const handleGuardarRiesgos = async () => {
    try {
      await auth.request("/fondos-acumulados/diagnostico-dia", {
        method: "PUT",
        body: JSON.stringify({
          lecturasAmbientales: {
             presenciaPlagasActivas: riesgoPlagas,
             goteras: riesgoGoteras,
             hongos: riesgoHongos,
             saturacion: riesgoSaturacion
          },
          alistamientoInformativo: {
             mesaTrabajo,
             quimicosPermitidos,
             herramientasLimpieza
          }
        })
      });
      alert("Alistamiento e Inspección guardados correctamente.");
    } catch (err) {
      console.error("Error al guardar riesgos", err);
      alert("Error al guardar. Revise su conexión.");
    }
  };

  return (
    <div className="paso-alistamiento" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Alistamiento Informativo (Normativa Física) */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdChecklist /> Preparación Física Locativa (Lista Informativa)
        </h4>
        <p className="small text-muted" style={{ marginBottom: "15px" }}>
          Según la normatividad, debe garantizar la disposición de estos elementos **antes** de intervenir los documentos:
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--bg-app)", padding: "15px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={mesaTrabajo} onChange={(e) => setMesaTrabajo(e.target.checked)} style={{ marginTop: "4px" }} />
            <div>
              <strong>Mesa de trabajo amplia</strong>
              <div className="small text-muted">Evita manipular o limpiar documentación directamente en el piso o rodillas.</div>
            </div>
          </label>
          
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={herramientasLimpieza} onChange={(e) => setHerramientasLimpieza(e.target.checked)} style={{ marginTop: "4px" }} />
            <div>
              <strong>Herramientas Físicas (Aspiradora HEPA, Brochas, Bisturí)</strong>
              <div className="small text-muted">Disponibilidad de aspiradoras de cerda suave y bisturíes/espátulas para retirar ganchos oxidados.</div>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={quimicosPermitidos} onChange={(e) => setQuimicosPermitidos(e.target.checked)} style={{ marginTop: "4px" }} />
            <div>
              <strong>Insumos Químicos Normados</strong>
              <div className="small" style={{ color: "var(--danger)", marginTop: "4px", padding: "8px", background: "rgba(255, 0, 0, 0.05)", borderRadius: "6px", border: "1px solid var(--danger)" }}>
                <MdWarning /> <strong>PROHIBIDO:</strong> Blanqueadores, Clorox, Decol, Varsol o Thinner (liberan gases que destruyen el papel).<br/>
                <MdChecklist /> <strong>PERMITIDO:</strong> Alcohol al 70% o isopropílico para estanterías. Amonios cuaternarios para pisos.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Proyección de Insumos (Calculadora) */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdCalculate /> Paso 0: Proyección de Insumos (m.l. & EPP)
        </h3>
        <p className="small text-muted">
          Ingrese los metros lineales estimados y el equipo de trabajo para proyectar Cajas Ref. X-200, carpetas y EPP (Tapabocas N95 / Guantes).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Metros Lineales Estimados:
              <div className="tooltip-container" style={{ position: "relative", display: "inline-block" }}>
                <MdInfoOutline color="var(--primary)" style={{ cursor: "help" }} title="Descuente material NO archivístico (libros, revistas) y el aire vacío dentro de cajas/carpetas." />
              </div>
            </label>
            <input type="number" className="edit-input" value={metrosLineales} onChange={(e) => setMetrosLineales(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
            <div className="small text-muted" style={{ marginTop: "4px", fontSize: "0.75rem" }}>Use cinta métrica. Excluya libros y vacíos.</div>
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

        {errorCalculo && (
          <div style={{ padding: "10px", marginTop: "15px", background: "rgba(255,0,0,0.1)", color: "var(--danger)", borderRadius: "6px", border: "1px solid var(--danger)" }}>
            {errorCalculo}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleCalcular} disabled={calculando} style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <MdCalculate /> {calculando ? "Calculando..." : "Proyectar Insumos y EPP"}
        </button>
      </div>

      {insumos && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdInventory /> Materiales de Almacenamiento
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Cajas Ref. X-200 (Cartón Neutro):</span>
                <strong>{insumos.almacenamiento.cajasX200} uds.</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Carpetas Propalcote 4 Aletas:</span>
                <strong>{insumos.almacenamiento.carpetas4Aletas} uds.</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                <span>Cinta de Algodón (Rollos x 100m):</span>
                <strong>{insumos.almacenamiento.rollosCintaAlgodon} rollos</strong>
              </li>
            </ul>
          </div>

          <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
              <MdSanitizer /> EPP y Bioseguridad
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Mascarillas N95 (NIOSH):</span>
                <strong style={{ color: "var(--danger)" }}>{insumos.bioseguridadEPP.tapabocasN95Unidades} uds.</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Guantes Nitrilo (Cajas x 100):</span>
                <strong>{insumos.bioseguridadEPP.cajasGuantesNitrilo100} cajas</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "5px" }}>
                <span>Batas Tyvek Desechables:</span>
                <strong>{insumos.bioseguridadEPP.batasTyvek} uds.</strong>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                <span>Lápices HB (Foliación Técnica):</span>
                <strong>{insumos.bioseguridadEPP.lapicesHB} uds.</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Matriz de Riesgos Iniciales */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdWarning color="orange" /> Matriz de Riesgos y Afectaciones Físicas
        </h4>
        <p className="small text-muted">Marque las contingencias estructurales o biológicas detectadas en el depósito:</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoGoteras} onChange={(e) => setRiesgoGoteras(e.target.checked)} />
            Goteras / Filtaciones
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoHongos} onChange={(e) => setRiesgoHongos(e.target.checked)} />
            Hongos Visibles (Biodeterioro)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoPlagas} onChange={(e) => setRiesgoPlagas(e.target.checked)} />
            Plagas (Roedores / Insectos)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={riesgoSaturacion} onChange={(e) => setRiesgoSaturacion(e.target.checked)} />
            Saturación / Pandeo de Estantes
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleGuardarRiesgos} style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
           <MdSave /> Guardar Inspección de Riesgos
        </button>
      </div>
    </div>
  );
}
