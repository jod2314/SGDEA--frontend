import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { CEOFData } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdAccountTree = (IconsMd as any).MdAccountTree || (IconsMd as any).MdAccountBalance;
const MdHistoryEdu = (IconsMd as any).MdHistoryEdu || (IconsMd as any).MdMenuBook;

export default function PasoHistoriaCEOF() {
  const auth = useAuth();
  const [ceof, setCeof] = useState<CEOFData | null>(null);

  // Campos de Formulario Cuestionario
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [actoCreacion, setActoCreacion] = useState("");
  const [cambiosEstructurales, setCambiosEstructurales] = useState("");

  useEffect(() => {
    fetchCEOF();
  }, []);

  const fetchCEOF = async () => {
    try {
      const res = await auth.request<{ ceof: CEOFData }>("/fondos-acumulados/ceof");
      if (res && res.ceof) {
        setCeof(res.ceof);
        if (res.ceof.cuestionarioHistoria) {
          setActoCreacion(res.ceof.cuestionarioHistoria.actoAdministrativoCreacion || "");
          setCambiosEstructurales(res.ceof.cuestionarioHistoria.cambiosEstructuralesHistoricos || "");
        }
      }
    } catch (err) {
      console.error("Error al cargar CEOF", err);
    }
  };

  return (
    <div className="paso-historia-ceof" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdHistoryEdu /> Paso 1: Investigación Archivística y Cuadro Evolutivo (CEOF)
        </h3>
        <p className="small text-muted">
          Diligencie la reconstrucción histórica de la entidad y adjunte el acto administrativo de creación para estructurar el Cuadro Evolutivo Orgánico-Funcional (CEOF).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Acto Administrativo de Creación (Decreto / Ley / Ordenanza):
            </label>
            <input
              type="text"
              className="edit-input"
              value={actoCreacion}
              placeholder="Ej: Decreto 045 de 1985"
              onChange={(e) => setActoCreacion(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Fecha Aproximada de Creación:
            </label>
            <input
              type="date"
              className="edit-input"
              value={fechaCreacion}
              onChange={(e) => setFechaCreacion(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
            Resumen de Cambios Estructurales y Transformaciones Históricas:
          </label>
          <textarea
            className="edit-input"
            rows={3}
            value={cambiosEstructurales}
            placeholder="Describa la reestructuración de dependencias a lo largo de los periodos..."
            onChange={(e) => setCambiosEstructurales(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
          />
        </div>
      </div>

      {/* Árbol del Cuadro Evolutivo Orgánico-Funcional (CEOF) */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAccountTree /> Cuadro Evolutivo Orgánico-Funcional (CEOF) por Períodos
        </h4>

        <div style={{ padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <strong>Período Histórico 1 (1985 - 2000): Entidad Fundacional {ceof ? "- " + ceof.estado : ""}</strong>
            <span className="badge" style={{ background: "var(--primary-light-2)", color: "var(--primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem" }}>
              Activo para Clasificación
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginTop: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                <th style={{ padding: "8px" }}>Código</th>
                <th style={{ padding: "8px" }}>Dependencia Histórica</th>
                <th style={{ padding: "8px" }}>Oficina Productora</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                <td style={{ padding: "8px" }}>100</td>
                <td style={{ padding: "8px" }}>Despacho del Director General</td>
                <td style={{ padding: "8px" }}>SÍ</td>
              </tr>
              <tr style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                <td style={{ padding: "8px" }}>200</td>
                <td style={{ padding: "8px" }}>Secretaría Administrativa y Financiera</td>
                <td style={{ padding: "8px" }}>SÍ</td>
              </tr>
              <tr>
                <td style={{ padding: "8px" }}>300</td>
                <td style={{ padding: "8px" }}>Oficina de Control Interno</td>
                <td style={{ padding: "8px" }}>SÍ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
