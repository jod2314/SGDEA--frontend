import { useState } from "react";
import * as IconsMd from "react-icons/md";

const MdQrCode = (IconsMd as any).MdQrCode || (IconsMd as any).MdQrCode2;
const MdCleaningServices = (IconsMd as any).MdCleaningServices || (IconsMd as any).MdBroom;

export default function PasoOrganizacionFUID() {
  const [limpieza, setLimpieza] = useState(true);
  const [deslegajado, setDeslegajado] = useState(true);
  const [foliacion, setFoliacion] = useState(true);
  const [encarpetado, setEncarpetado] = useState(true);

  // Datos para etiqueta QR de Caja X-200
  const [cajaCodigo, setCajaCodigo] = useState("CX-2026-001");
  const [deposito, setDeposito] = useState("Depósito Principal Central");
  const [estante, setEstante] = useState("E-04");
  const [entrepano, setEntrepano] = useState("EN-02");
  const [qrGenerado, setQrGenerado] = useState(false);

  const handleGenerarQR = () => {
    setQrGenerado(true);
  };

  return (
    <div className="paso-organizacion-fuid" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Checklist de Operaciones Físicas */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdCleaningServices /> Paso 3: Organización Documental e Inventario FUID Físico
        </h3>
        <p className="small text-muted">
          Marque las operaciones físicas de conservación realizadas sobre las unidades documentales antes de su rotulación e inventariado:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={limpieza} onChange={(e) => setLimpieza(e.target.checked)} />
            Limpieza en Seco Completada
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={deslegajado} onChange={(e) => setDeslegajado(e.target.checked)} />
            Retiro de Ganchos Metal / Clips Oxidados
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={foliacion} onChange={(e) => setFoliacion(e.target.checked)} />
            Foliación Técnica a Lápiz HB (Esquina Sup. Der.)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={encarpetado} onChange={(e) => setEncarpetado(e.target.checked)} />
            Encarpetado Neutro Propalcote 4 Aletas
          </label>
        </div>
      </div>

      {/* Control Topográfico e Impresión de Etiquetas QR */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdQrCode /> Control Topográfico y Generación de Código QR (Cajas Ref. X-200)
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Código de Caja X-200:
            </label>
            <input
              type="text"
              className="edit-input"
              value={cajaCodigo}
              onChange={(e) => setCajaCodigo(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Depósito de Custodia:
            </label>
            <input
              type="text"
              className="edit-input"
              value={deposito}
              onChange={(e) => setDeposito(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Estante N°:
            </label>
            <input
              type="text"
              className="edit-input"
              value={estante}
              onChange={(e) => setEstante(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Entrepaño N°:
            </label>
            <input
              type="text"
              className="edit-input"
              value={entrepano}
              onChange={(e) => setEntrepano(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerarQR}
          style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          <MdQrCode /> Generar Etiqueta QR Topográfica
        </button>

        {qrGenerado && (
          <div style={{ marginTop: "15px", padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px dashed var(--primary)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "80px", height: "80px", background: "var(--text-primary)", color: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.7rem", textAlign: "center", borderRadius: "4px" }}>
              [QR CODES]
            </div>
            <div>
              <h5 style={{ margin: "0 0 5px 0", color: "var(--primary)" }}>Etiqueta Topográfica X-200</h5>
              <p className="small text-muted" style={{ margin: 0 }}>
                Caja: <strong>{cajaCodigo}</strong> | {deposito} | Estante: {estante} | Entrepaño: {entrepano}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
