import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { useAuth } from "../../auth/AuthProvider";

const MdGavel = (IconsMd as any).MdGavel;
const MdTableChart = (IconsMd as any).MdTableChart || (IconsMd as any).MdGridOn;
const MdAdd = (IconsMd as any).MdAdd;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;

interface TVDBackend {
  id: string;
  version: string;
  nombre: string;
  descripcion?: string;
  estado: 'borrador' | 'en_revision' | 'aprobada' | 'obsoleta';
  actaAprobacionId?: string;
  series: Array<{
    codigo: string;
    nombre: string;
    retencionCentral: number;
    disposicionFinal: 'CT' | 'E' | 'M' | 'S';
    procedimiento: string;
    dependenciaId?: string;
    historicoDDHH?: boolean;
  }>;
  convalidacion?: {
    estadoConvalidacion: string;
    numeroRadicadoAGN?: string;
    fechaRadicacion?: string;
    conceptoTecnico?: string;
    fechaConvalidacion?: string;
    codigoRUSD?: string;
    fechaRegistroRUSD?: string;
  };
}

export default function PasoValoracionTVD() {
  const auth = useAuth();
  const [tvd, setTvd] = useState<TVDBackend | null>(null);

  // Formulario FVD
  const [codigoSerie, setCodigoSerie] = useState("");
  const [nombreSerie, setNombreSerie] = useState("");
  const [retencion, setRetencion] = useState<number>(5);
  const [disposicion, setDisposicion] = useState<"CT" | "E" | "S" | "M">("CT");
  const [procedimiento, setProcedimiento] = useState("");
  const [ddhh, setDdhh] = useState(false);

  // Formularios AGN
  const [radicado, setRadicado] = useState("");
  const [fechaRadicado, setFechaRadicado] = useState("");
  const [concepto, setConcepto] = useState("");
  const [fechaConcepto, setFechaConcepto] = useState("");
  const [codigoRusd, setCodigoRusd] = useState("");
  const [fechaRusd, setFechaRusd] = useState("");

  useEffect(() => {
    fetchTVD();
  }, []);

  const fetchTVD = async () => {
    try {
      const res = await auth.request<{ tvds: TVDBackend[] }>("/api/tvd");
      if (res && res.tvds && res.tvds.length > 0) {
        setTvd(res.tvds[0]);
      }
    } catch (err) {
      console.error("Error al cargar TVD", err);
    }
  };

  const handleDdhhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setDdhh(isChecked);
    if (isChecked) {
      setDisposicion("CT");
    }
  };

  const handleAgregarFVD = async () => {
    if (!codigoSerie || !nombreSerie || !procedimiento) return;
    
    const nuevaSerie = {
      codigo: codigoSerie,
      nombre: nombreSerie,
      retencionCentral: retencion,
      disposicionFinal: disposicion,
      procedimiento: procedimiento,
      historicoDDHH: ddhh
    };

    try {
      if (!tvd) {
        await auth.request("/api/tvd", {
          method: "POST",
          body: JSON.stringify({ version: '1.0', nombre: 'TVD FDA', series: [nuevaSerie] })
        });
      } else {
        const series = [...tvd.series, nuevaSerie];
        await auth.request(`/api/tvd/${tvd.id}`, {
          method: "PUT",
          body: JSON.stringify({ series })
        });
      }
      alert("Serie agregada a la TVD");
      fetchTVD();
      setCodigoSerie(""); setNombreSerie(""); setProcedimiento(""); setDdhh(false); setDisposicion("CT");
    } catch (err) {
      console.error("Error guardando TVD", err);
    }
  };

  const handleRadicarAGN = async () => {
    if (!tvd) return;
    try {
      await auth.request(`/api/tvd/${tvd.id}/radicar-agn`, {
         method: "PUT",
         body: JSON.stringify({ numeroRadicado: radicado, fechaRadicacion: fechaRadicado })
      });
      alert("Radicado AGN registrado");
      fetchTVD();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvalidar = async () => {
    if (!tvd) return;
    try {
      await auth.request(`/api/tvd/${tvd.id}/convalidar`, {
         method: "PUT",
         body: JSON.stringify({ conceptoTecnico: concepto, fechaConvalidacion: fechaConcepto })
      });
      alert("Convalidación registrada");
      fetchTVD();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegistrarRUSD = async () => {
    if (!tvd) return;
    try {
      await auth.request(`/api/tvd/${tvd.id}/registrar-rusd`, {
         method: "PUT",
         body: JSON.stringify({ codigoRUSD: codigoRusd, fechaRegistroRUSD: fechaRusd })
      });
      alert("RUSD registrado");
      fetchTVD();
    } catch (err) {
      console.error(err);
    }
  };

  const estadoConvalidacion = tvd?.convalidacion?.estadoConvalidacion || "PENDIENTE";

  return (
    <div className="paso-valoracion-tvd" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Formulario Ficha de Valoración Documental (FVD) */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdGavel /> Paso 4: Fichas de Valoración Documental (FVD) y Matriz TVD
        </h3>
        <p className="small text-muted">
          Registre los valores primarios (administrativo, jurídico, contable, fiscal) y secundarios (histórico, DDHH) para determinar el tiempo de retención en Central y la Disposición Final de las series.
        </p>

        <div style={{ marginTop: "15px", padding: "12px", background: "var(--primary-light-2)", borderRadius: "8px", border: "1px solid var(--primary)", fontSize: "0.85rem", color: "var(--text-primary)" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdGavel /> 💡 Guía para Valoración (Acuerdo 004 de 2013 AGN):</strong>
          <ul style={{ margin: "8px 0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            <li><strong>Valores Primarios:</strong> Aplican mientras el documento sirva a la institución (Administrativo, Legal/Jurídico, Fiscal, Contable, Técnico). Definen los años de <em>Retención en el Archivo Central</em>.</li>
            <li><strong>Valores Secundarios:</strong> Aplican cuando la serie pierde utilidad administrativa pero adquiere valor para la sociedad (Histórico, Científico, Cultural, DDHH). Definen si la <em>Disposición Final</em> es Conservación Total (CT).</li>
          </ul>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Código Serie:</label>
            <input type="text" className="edit-input" value={codigoSerie} onChange={(e) => setCodigoSerie(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Nombre Serie:</label>
            <input type="text" className="edit-input" value={nombreSerie} onChange={(e) => setNombreSerie(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Retención Central (Años):</label>
            <input type="number" className="edit-input" value={retencion} onChange={(e) => setRetencion(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Disposición Final (AGN):</label>
            <select className="edit-input" value={disposicion} onChange={(e) => setDisposicion(e.target.value as any)} disabled={ddhh} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)", opacity: ddhh ? 0.6 : 1 }}>
              <option value="CT">CT - Conservación Total</option>
              <option value="E">E - Eliminación Documentada</option>
              <option value="S">S - Selección Muestral</option>
              <option value="M">M - Microfilmación / Digitalización</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Procedimiento:</label>
          <textarea className="edit-input" rows={2} value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
        </div>

        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: ddhh ? "var(--danger)" : "inherit" }}>
            <input type="checkbox" checked={ddhh} onChange={handleDdhhChange} />
            Posee Valor Patrimonial / Derechos Humanos (DDHH)
          </label>
          <button className="btn btn-primary" onClick={handleAgregarFVD} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <MdAdd /> Agregar Ficha FVD a la TVD
          </button>
        </div>
        {ddhh && (
          <div style={{ marginTop: "10px", padding: "8px", background: "var(--danger)", color: "white", borderRadius: "4px", fontSize: "0.85rem" }}>
             Los expedientes de DDHH/DIH tienen Conservación Total obligatoria (Ley 594/2000, Art. 57). Esta disposición no puede modificarse.
          </div>
        )}
      </div>

      {/* Matriz TVD Oficial */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdTableChart /> Matriz Oficial de Tabla de Valoración Documental (TVD)
        </h4>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--glass-border)", textAlign: "left", background: "var(--bg-app)" }}>
              <th style={{ padding: "10px" }}>Código</th>
              <th style={{ padding: "10px" }}>Serie Documental</th>
              <th style={{ padding: "10px" }}>Retención</th>
              <th style={{ padding: "10px" }}>DF</th>
              <th style={{ padding: "10px" }}>Procedimiento</th>
            </tr>
          </thead>
          <tbody>
            {(tvd?.series || []).map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>{item.codigo}</td>
                <td style={{ padding: "10px" }}>
                  {item.nombre}
                  {item.historicoDDHH && (
                    <span className="badge" style={{ marginLeft: "8px", background: "var(--danger)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>
                      DDHH
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px" }}>{item.retencionCentral} años</td>
                <td style={{ padding: "10px" }}>
                  <strong style={{ color: item.disposicionFinal === "CT" ? "var(--primary)" : "var(--danger)" }}>
                    {item.disposicionFinal}
                  </strong>
                </td>
                <td style={{ padding: "10px" }}>{item.procedimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estado Convalidacion */}
      {tvd && (
        <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MdCheckCircle /> Estado de Convalidación AGN
          </h4>
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
             <span className="badge" style={{ padding: "6px 12px", borderRadius: "4px", background: estadoConvalidacion === "PENDIENTE" ? "orange" : "var(--primary-light-2)", color: estadoConvalidacion === "PENDIENTE" ? "white" : "var(--primary)" }}>PENDIENTE</span>
             <span className="badge" style={{ padding: "6px 12px", borderRadius: "4px", background: estadoConvalidacion === "EN_EVALUACION_AGN" ? "orange" : "var(--primary-light-2)", color: estadoConvalidacion === "EN_EVALUACION_AGN" ? "white" : "var(--primary)" }}>EN EVALUACIÓN AGN</span>
             <span className="badge" style={{ padding: "6px 12px", borderRadius: "4px", background: estadoConvalidacion === "CONVALIDADA_AGN" ? "green" : "var(--primary-light-2)", color: estadoConvalidacion === "CONVALIDADA_AGN" ? "white" : "var(--primary)" }}>CONVALIDADA</span>
             <span className="badge" style={{ padding: "6px 12px", borderRadius: "4px", background: estadoConvalidacion === "RUSD" ? "green" : "var(--primary-light-2)", color: estadoConvalidacion === "RUSD" ? "white" : "var(--primary)" }}>RUSD</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
             <div style={{ background: "var(--bg-app)", padding: "15px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Registrar Radicado AGN</h5>
                <input type="text" placeholder="No. Radicado" value={radicado} onChange={e=>setRadicado(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "5px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <input type="date" value={fechaRadicado} onChange={e=>setFechaRadicado(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "10px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <button className="btn btn-secondary" onClick={handleRadicarAGN} style={{ width: "100%", padding: "5px" }}>Registrar Radicado</button>
             </div>
             <div style={{ background: "var(--bg-app)", padding: "15px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Registrar Convalidación</h5>
                <input type="text" placeholder="Concepto Técnico" value={concepto} onChange={e=>setConcepto(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "5px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <input type="date" value={fechaConcepto} onChange={e=>setFechaConcepto(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "10px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <button className="btn btn-secondary" onClick={handleConvalidar} style={{ width: "100%", padding: "5px" }}>Registrar Convalidación</button>
             </div>
             <div style={{ background: "var(--bg-app)", padding: "15px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Registrar RUSD</h5>
                <input type="text" placeholder="Código RUSD" value={codigoRusd} onChange={e=>setCodigoRusd(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "5px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <input type="date" value={fechaRusd} onChange={e=>setFechaRusd(e.target.value)} className="edit-input" style={{ width: "100%", marginBottom: "10px", padding: "5px", borderRadius: "4px", border: "1px solid var(--glass-border)" }} />
                <button className="btn btn-secondary" onClick={handleRegistrarRUSD} style={{ width: "100%", padding: "5px" }}>Registrar RUSD</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
