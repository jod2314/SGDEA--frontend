import { useState } from "react";
import * as IconsMd from "react-icons/md";
import { MuestraDIACalculada } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdAssessment = (IconsMd as any).MdAssessment || (IconsMd as any).MdAnalytics;
const MdFunctions = (IconsMd as any).MdFunctions || (IconsMd as any).MdCalculate;
const MdThermostat = (IconsMd as any).MdThermostat || (IconsMd as any).MdDeviceThermostat;

export default function PasoDiagnosticoDIA() {
  const auth = useAuth();
  const [poblacionCarpetas, setPoblacionCarpetas] = useState<number>(2000);
  const [margenError, setMargenError] = useState<number>(0.08); // 8%
  const [muestra, setMuestra] = useState<MuestraDIACalculada | null>(null);
  const [calculando, setCalculando] = useState(false);

  // Ficha H-14 Lecturas Ambientales
  const [temp, setTemp] = useState<number>(21.5);
  const [humedad, setHumedad] = useState<number>(55.0);
  const [luxes, setLuxes] = useState<number>(120);

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

  return (
    <div className="paso-diagnostico-dia" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAssessment /> Paso 2: Diagnóstico Integral de Archivos (DIA - Fichas H-1 a H-14)
        </h3>
        <p className="small text-muted">
          Alique la metodología de muestreo aleatorio representativo ($n$) para la inspección física (Ficha H-12) y el registro ambiental del depósito (Ficha H-14).
        </p>

        {/* Calculadora Muestral Ficha H-12 */}
        <div style={{ padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--glass-border)", marginTop: "15px" }}>
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

      {/* Ficha H-14 Lecturas Ambientales */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdThermostat /> Ficha H-14: Registro de Condiciones Ambientales e Iluminación
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Temperatura Promedio (°C):
            </label>
            <input
              type="number"
              className="edit-input"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Humedad Relativa (%):
            </label>
            <input
              type="number"
              className="edit-input"
              value={humedad}
              onChange={(e) => setHumedad(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Iluminación (Luxes):
            </label>
            <input
              type="number"
              className="edit-input"
              value={luxes}
              onChange={(e) => setLuxes(parseInt(e.target.value) || 0)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
