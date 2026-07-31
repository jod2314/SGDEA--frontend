import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { MuestraDIACalculada, DiagnosticoDIAData } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdAssessment = (IconsMd as any).MdAssessment || (IconsMd as any).MdAnalytics;
const MdFunctions = (IconsMd as any).MdFunctions || (IconsMd as any).MdCalculate;
const MdThermostat = (IconsMd as any).MdThermostat || (IconsMd as any).MdDeviceThermostat;
const MdSave = (IconsMd as any).MdSave;
const MdScience = (IconsMd as any).MdScience;
const MdWarning = (IconsMd as any).MdWarning;

export default function PasoDiagnosticoDIA() {
  const auth = useAuth();
  const [eppCompleto, setEppCompleto] = useState(false);
  const [poblacionCarpetas, setPoblacionCarpetas] = useState<number>(2000);
  const [margenError, setMargenError] = useState<number>(0.08); // 8%
  const [muestra, setMuestra] = useState<MuestraDIACalculada | null>(null);
  const [calculando, setCalculando] = useState(false);

  // Ficha H-14 Lecturas Ambientales
  const [temp, setTemp] = useState<number>(21.5);
  const [humedad, setHumedad] = useState<number>(55.0);
  const [luxes, setLuxes] = useState<number>(120);

  // Indicadores SIC
  const [oxiTintas, setOxiTintas] = useState<number>(0);
  const [biodeterioro, setBiodeterioro] = useState<number>(0);
  const [danoFisico, setDanoFisico] = useState<number>(0);

  // DOFA
  const [debilidades, setDebilidades] = useState("");
  const [oportunidades, setOportunidades] = useState("");
  const [fortalezas, setFortalezas] = useState("");
  const [amenazas, setAmenazas] = useState("");

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const fetchDiagnostico = async () => {
    try {
      const res = await auth.request<{ diagnostico: DiagnosticoDIAData }>("/fondos-acumulados/diagnostico-dia");
      if (res && res.diagnostico) {
        if (res.diagnostico.lecturasAmbientales) {
          setTemp(res.diagnostico.lecturasAmbientales.temperaturaPromedio || 21.5);
          setHumedad(res.diagnostico.lecturasAmbientales.humedadRelativaPromedio || 55.0);
          setLuxes(res.diagnostico.lecturasAmbientales.iluminacionLuxes || 120);
        }
        if (res.diagnostico.indicadoresSIC) {
          setOxiTintas(res.diagnostico.indicadoresSIC.porcentajeOxidacionTintas || 0);
          setBiodeterioro(res.diagnostico.indicadoresSIC.porcentajeDeterioroBiologico || 0);
          setDanoFisico(res.diagnostico.indicadoresSIC.porcentajeDeformacionFisica || 0);
        }
        if (res.diagnostico.dofa) {
          setDebilidades((res.diagnostico.dofa.debilidades || []).join('\n'));
          setOportunidades((res.diagnostico.dofa.oportunidades || []).join('\n'));
          setFortalezas((res.diagnostico.dofa.fortalezas || []).join('\n'));
          setAmenazas((res.diagnostico.dofa.amenazas || []).join('\n'));
        }
      }
    } catch (err) {
      console.error("Error al cargar diagnostico DIA", err);
    }
  };

  const handleCalcularMuestra = async () => {
    setCalculando(true);
    try {
      const res = await auth.request<{ muestraDIA: MuestraDIACalculada }>("/fondos-acumulados/calculo-muestra-dia", {
        method: "POST",
        body: JSON.stringify({ totalCarpetasPoblacion: poblacionCarpetas, margenError })
      });
      if (res && res.muestraDIA) {
        setMuestra(res.muestraDIA);
      }
    } catch (err) {
      console.error("Error al calcular muestra DIA", err);
    } finally {
      setCalculando(false);
    }
  };

  const handleGuardarDIA = async () => {
    try {
      await auth.request("/fondos-acumulados/diagnostico-dia", {
        method: "PUT",
        body: JSON.stringify({
          lecturasAmbientales: { temperaturaPromedio: temp, humedadRelativaPromedio: humedad, iluminacionLuxes: luxes },
          indicadoresSIC: { porcentajeOxidacionTintas: oxiTintas, porcentajeDeterioroBiologico: biodeterioro, porcentajeDeformacionFisica: danoFisico },
          dofa: {
            debilidades: debilidades.split('\n').filter(Boolean),
            oportunidades: oportunidades.split('\n').filter(Boolean),
            fortalezas: fortalezas.split('\n').filter(Boolean),
            amenazas: amenazas.split('\n').filter(Boolean)
          }
        })
      });
      alert("Diagnóstico DIA guardado correctamente.");
    } catch (err) {
      console.error("Error al guardar diagnostico DIA", err);
    }
  };

  return (
    <div className="paso-diagnostico-dia" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAssessment /> Paso 2: Diagnóstico Integral de Archivos (DIA - Fichas H-1 a H-14)
        </h3>
        <p className="small text-muted">
          Alique la metodología de muestreo aleatorio representativo ($n$) para la inspección física (Ficha H-12) y el registro ambiental del depósito (Ficha H-14).
        </p>

        {/* Barrera EPP Obligatorio */}
        <div style={{ padding: "15px", background: "rgba(231, 76, 60, 0.1)", borderRadius: "8px", border: "1px solid var(--danger)", marginTop: "15px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MdWarning /> Barrera de Seguridad (EPP Obligatorio)
          </h4>
          <p className="small text-muted" style={{ margin: "0 0 10px 0" }}>
            Debe confirmar el uso de Elementos de Protección Personal antes de iniciar la inspección física.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "bold" }}>
            <input type="checkbox" checked={eppCompleto} onChange={(e) => setEppCompleto(e.target.checked)} />
            Confirmo el uso de tapabocas N95, guantes de nitrilo, bata antifluido y gafas de seguridad.
          </label>
        </div>

        {/* Calculadora Muestral Ficha H-12 */}
        <div style={{ padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--glass-border)", marginTop: "15px", opacity: eppCompleto ? 1 : 0.5, pointerEvents: eppCompleto ? "auto" : "none" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MdFunctions /> Ficha H-12: Muestreo Estadístico Representativo (Confianza 95%)
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
                Población Total de Carpetas (N):
              </label>
              <input
                type="number"
                className="edit-input"
                value={poblacionCarpetas}
                onChange={(e) => setPoblacionCarpetas(parseInt(e.target.value) || 0)}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
                Margen de Error Aceptable (E):
              </label>
              <select
                className="edit-input"
                value={margenError}
                onChange={(e) => setMargenError(parseFloat(e.target.value))}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
              >
                <option value={0.05}>5% (Alta precisión)</option>
                <option value={0.08}>8% (Recomendado AGN)</option>
                <option value={0.10}>10% (Estándar rápido)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "15px", padding: "10px", background: "var(--primary-light-2)", borderRadius: "6px", border: "1px solid var(--primary)", fontSize: "0.85rem" }}>
            <strong>💡 Ayuda para Volumetría AZ:</strong> Para el cálculo de metros lineales en carpetas AZ, mida la estantería y <em>descuente el porcentaje de aire/vacío</em> interno de las carpetas (el espacio no ocupado por folios).
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCalcularMuestra}
            disabled={calculando}
            style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <MdFunctions /> {calculando ? "Calculando..." : "Calcular Muestra n (Fórmula Finita)"}
          </button>

          {muestra && (
            <div style={{ marginTop: "15px", padding: "10px", background: "var(--primary-light-2)", borderRadius: "6px", border: "1px solid var(--primary)" }}>
              <strong>Resultado de Muestreo:</strong> De una población de <strong>{muestra.poblacionTotalN} carpetas</strong>, la muestra obligatoria a inspeccionar hoja a hoja con la Ficha H-12 es de <strong>{muestra.muestraRequeridaCarpetasn} carpetas</strong>.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdThermostat /> Ficha H-14: Registro de Condiciones Ambientales e Iluminación
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Temperatura Promedio (°C):
            </label>
            <input type="number" className="edit-input" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Humedad Relativa (%):
            </label>
            <input type="number" className="edit-input" value={humedad} onChange={(e) => setHumedad(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Iluminación (Luxes):
            </label>
            <input type="number" className="edit-input" value={luxes} onChange={(e) => setLuxes(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdScience /> Indicadores Sistema Integrado de Conservación (SIC)
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Oxidación de Tintas (%):
            </label>
            <input type="number" className="edit-input" value={oxiTintas} onChange={(e) => setOxiTintas(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Biodeterioro (%):
            </label>
            <input type="number" className="edit-input" value={biodeterioro} onChange={(e) => setBiodeterioro(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Daño Físico/Deformación (%):
            </label>
            <input type="number" className="edit-input" value={danoFisico} onChange={(e) => setDanoFisico(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
            <div style={{ width: "120px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Oxidación</div>
            <div style={{ flex: 1, background: "var(--bg-app)", height: "15px", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(oxiTintas, 100)}%`, background: "var(--primary)", height: "100%" }}></div>
            </div>
            <div style={{ width: "40px", textAlign: "right", fontSize: "0.8rem" }}>{oxiTintas}%</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
            <div style={{ width: "120px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Biodeterioro</div>
            <div style={{ flex: 1, background: "var(--bg-app)", height: "15px", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(biodeterioro, 100)}%`, background: "var(--danger)", height: "100%" }}></div>
            </div>
            <div style={{ width: "40px", textAlign: "right", fontSize: "0.8rem" }}>{biodeterioro}%</div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "120px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Daño Físico</div>
            <div style={{ flex: 1, background: "var(--bg-app)", height: "15px", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(danoFisico, 100)}%`, background: "orange", height: "100%" }}></div>
            </div>
            <div style={{ width: "40px", textAlign: "right", fontSize: "0.8rem" }}>{danoFisico}%</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAssessment /> Matriz DOFA del Fondo Acumulado
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Debilidades:</label>
            <textarea className="edit-input" rows={3} value={debilidades} onChange={(e) => setDebilidades(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Oportunidades:</label>
            <textarea className="edit-input" rows={3} value={oportunidades} onChange={(e) => setOportunidades(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Fortalezas:</label>
            <textarea className="edit-input" rows={3} value={fortalezas} onChange={(e) => setFortalezas(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>Amenazas:</label>
            <textarea className="edit-input" rows={3} value={amenazas} onChange={(e) => setAmenazas(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleGuardarDIA}
          style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          <MdSave /> Guardar Diagnóstico DIA
        </button>
      </div>
    </div>
  );
}
