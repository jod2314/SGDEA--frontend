import { useState } from "react";
import * as IconsMd from "react-icons/md";

const MdGavel = (IconsMd as any).MdGavel;
const MdTableChart = (IconsMd as any).MdTableChart || (IconsMd as any).MdGridOn;
const MdAdd = (IconsMd as any).MdAdd;

interface FVDItem {
  codigoSerie: string;
  nombreSerie: string;
  retencionCentralAnios: number;
  disposicionFinal: "CT" | "E" | "S" | "MD";
  procedimientoDisposicion: string;
  historicoDDHH: boolean;
}

export default function PasoValoracionTVD() {
  const [fvds, setFvds] = useState<FVDItem[]>([
    {
      codigoSerie: "100-01",
      nombreSerie: "ACTAS DE CONSEJO DIRECTIVO Y ASAMBLEA",
      retencionCentralAnios: 10,
      disposicionFinal: "CT",
      procedimientoDisposicion: "Conservación total por su valor histórico y jurídico patrimonial.",
      historicoDDHH: true
    },
    {
      codigoSerie: "200-15",
      nombreSerie: "COMPROBANTES DE EGRESO Y CONTABILIDAD",
      retencionCentralAnios: 5,
      disposicionFinal: "E",
      procedimientoDisposicion: "Eliminación tras cumplirse la prescripción fiscal de 5 años.",
      historicoDDHH: false
    }
  ]);

  // Formulario FVD
  const [codigoSerie, setCodigoSerie] = useState("");
  const [nombreSerie, setNombreSerie] = useState("");
  const [retencion, setRetencion] = useState<number>(5);
  const [disposicion, setDisposicion] = useState<"CT" | "E" | "S" | "MD">("CT");
  const [procedimiento, setProcedimiento] = useState("");
  const [ddhh, setDdhh] = useState(false);

  const handleAgregarFVD = () => {
    if (!codigoSerie || !nombreSerie || !procedimiento) return;
    setFvds([
      ...fvds,
      {
        codigoSerie,
        nombreSerie,
        retencionCentralAnios: retencion,
        disposicionFinal: disposicion,
        procedimientoDisposicion: procedimiento,
        historicoDDHH: ddhh
      }
    ]);
    setCodigoSerie("");
    setNombreSerie("");
    setProcedimiento("");
  };

  return (
    <div className="paso-valoracion-tvd" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Formulario Ficha de Valoración Documental (FVD) */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdGavel /> Paso 4: Fichas de Valoración Documental (FVD) y Matriz TVD
        </h3>
        <p className="small text-muted">
          Registre los valores primarios (administrativo, jurídico, contable, fiscal) y secundarios (historico, DDHH) para determinar el tiempo de retención en Central y la Disposición Final de las series.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Código de la Serie / Subserie:
            </label>
            <input
              type="text"
              className="edit-input"
              value={codigoSerie}
              placeholder="Ej: 100-02"
              onChange={(e) => setCodigoSerie(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Nombre de la Serie / Subserie:
            </label>
            <input
              type="text"
              className="edit-input"
              value={nombreSerie}
              placeholder="Ej: INFORMES DE GESTIÓN"
              onChange={(e) => setNombreSerie(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Retención Central (Años):
            </label>
            <input
              type="number"
              className="edit-input"
              value={retencion}
              onChange={(e) => setRetencion(parseInt(e.target.value) || 1)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Disposición Final (AGN):
            </label>
            <select
              className="edit-input"
              value={disposicion}
              onChange={(e) => setDisposicion(e.target.value as any)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            >
              <option value="CT">CT - Conservación Total</option>
              <option value="E">E - Eliminación Documentada</option>
              <option value="S">S - Selección Muestral</option>
              <option value="MD">MD - Microfilmación / Digitalización</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
            Procedimiento y Criterio de Conservación / Eliminación:
          </label>
          <textarea
            className="edit-input"
            rows={2}
            value={procedimiento}
            placeholder="Describa el sustento jurídico o histórico para la disposición final..."
            onChange={(e) => setProcedimiento(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
          />
        </div>

        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={ddhh} onChange={(e) => setDdhh(e.target.checked)} />
            Posee Valor Patrimonial / Derechos Humanos (DDHH)
          </label>

          <button
            className="btn btn-primary"
            onClick={handleAgregarFVD}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <MdAdd /> Agregar Ficha FVD a la TVD
          </button>
        </div>
      </div>

      {/* Matriz TVD Oficial Formato AGN */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdTableChart /> Matriz Oficial de Tabla de Valoración Documental (TVD - Formato AGN)
        </h4>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--glass-border)", textAlign: "left", background: "var(--bg-app)" }}>
              <th style={{ padding: "10px" }}>Código</th>
              <th style={{ padding: "10px" }}>Serie / Subserie Documental</th>
              <th style={{ padding: "10px" }}>Retención (Años)</th>
              <th style={{ padding: "10px" }}>Disposición Final</th>
              <th style={{ padding: "10px" }}>Procedimiento Aprobado</th>
            </tr>
          </thead>
          <tbody>
            {fvds.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>{item.codigoSerie}</td>
                <td style={{ padding: "10px" }}>
                  {item.nombreSerie}
                  {item.historicoDDHH && (
                    <span className="badge" style={{ marginLeft: "8px", background: "var(--danger)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>
                      DDHH / Patrimonio
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px" }}>{item.retencionCentralAnios} años</td>
                <td style={{ padding: "10px" }}>
                  <strong style={{ color: item.disposicionFinal === "CT" ? "var(--primary)" : "var(--danger)" }}>
                    {item.disposicionFinal}
                  </strong>
                </td>
                <td style={{ padding: "10px" }}>{item.procedimientoDisposicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
