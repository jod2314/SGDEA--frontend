import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { useAuth } from "../../auth/AuthProvider";

const MdQrCode = (IconsMd as any).MdQrCode || (IconsMd as any).MdQrCode2;
const MdCleaningServices = (IconsMd as any).MdCleaningServices || (IconsMd as any).MdBroom;
const MdAdd = (IconsMd as any).MdAdd;
const MdSave = (IconsMd as any).MdSave;
const MdWarning = (IconsMd as any).MdWarning;

export default function PasoOrganizacionFUID() {
  const auth = useAuth();
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

  // Registros FUID
  const [registros, setRegistros] = useState<any[]>([]);
  const [fuidCodigo, setFuidCodigo] = useState("");
  const [fuidSerie, setFuidSerie] = useState("");
  const [fuidTitulo, setFuidTitulo] = useState("");
  const [fuidFechas, setFuidFechas] = useState("");
  const [fuidCaja, setFuidCaja] = useState("");
  const [fuidCarpeta, setFuidCarpeta] = useState("");
  const [fuidFolios, setFuidFolios] = useState("");
  const [fuidSoporte, setFuidSoporte] = useState("Papel");
  const [esDDHH, setEsDDHH] = useState(false);

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      const res = await auth.request<{ registros: any[] }>("/fondos-acumulados");
      if (res && res.registros) {
        setRegistros(res.registros);
      }
    } catch (err) {
      console.error("Error al cargar registros", err);
    }
  };

  const handleGenerarQR = () => {
    setQrGenerado(true);
  };

  const handleGuardarFUID = async () => {
    try {
      await auth.request("/fondos-acumulados", {
        method: "POST",
        body: JSON.stringify({
          codigo: fuidCodigo,
          serie: fuidSerie,
          tituloExpediente: fuidTitulo,
          fechasExtremas: fuidFechas,
          ubicacionTopografica: {
            caja: fuidCaja,
            carpeta: fuidCarpeta,
          },
          volumen: {
             folios: parseInt(fuidFolios) || 0
          },
          soporteFisico: fuidSoporte,
          esDDHH
        })
      });
      alert("Registro FUID agregado.");
      fetchRegistros();
      setFuidCodigo(""); setFuidSerie(""); setFuidTitulo(""); setFuidFechas("");
      setFuidCaja(""); setFuidCarpeta(""); setFuidFolios(""); setEsDDHH(false);
    } catch (err) {
      console.error("Error al guardar FUID", err);
    }
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
            <input type="text" className="edit-input" value={cajaCodigo} onChange={(e) => setCajaCodigo(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Depósito de Custodia:
            </label>
            <input type="text" className="edit-input" value={deposito} onChange={(e) => setDeposito(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Estante N°:
            </label>
            <input type="text" className="edit-input" value={estante} onChange={(e) => setEstante(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px", color: "var(--text-secondary)" }}>
              Entrepaño N°:
            </label>
            <input type="text" className="edit-input" value={entrepano} onChange={(e) => setEntrepano(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleGenerarQR} style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <MdQrCode /> Generar Etiqueta QR Topográfica
        </button>

        {qrGenerado && (
          <div style={{ marginTop: "15px", padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px dashed var(--primary)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "120px", height: "120px" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`SGDEA|CAJA:${cajaCodigo}|DEP:${deposito}|EST:${estante}|ENT:${entrepano}`)}`}
                alt="QR Topográfico"
                style={{ width: "120px", height: "120px" }}
              />
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

      {/* Registros FUID */}
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAdd /> Agregar Registro FUID Individual
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
          <input type="text" placeholder="Código" value={fuidCodigo} onChange={e => setFuidCodigo(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Serie" value={fuidSerie} onChange={e => setFuidSerie(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Título Expediente" value={fuidTitulo} onChange={e => setFuidTitulo(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Fechas Extremas" value={fuidFechas} onChange={e => setFuidFechas(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Caja" value={fuidCaja} onChange={e => setFuidCaja(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Carpeta" value={fuidCarpeta} onChange={e => setFuidCarpeta(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="number" placeholder="Folios" value={fuidFolios} onChange={e => setFuidFolios(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Soporte (ej. Papel)" value={fuidSoporte} onChange={e => setFuidSoporte(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--danger)", fontWeight: "bold" }}>
             <input type="checkbox" checked={esDDHH} onChange={(e) => setEsDDHH(e.target.checked)} />
             Es Expediente DDHH / DIH
           </label>
           <button className="btn btn-primary" onClick={handleGuardarFUID} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
             <MdSave /> Guardar Registro FUID
           </button>
        </div>

        {esDDHH && (
           <div style={{ marginTop: "15px", padding: "10px", background: "var(--danger)", color: "white", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
             <MdWarning /> ⚠️ Expediente de DDHH/DIH — Conservación Total obligatoria (Ley 594/2000)
           </div>
        )}

        <h4 style={{ margin: "20px 0 10px 0", color: "var(--primary)" }}>Listado FUID</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
             <tr style={{ borderBottom: "2px solid var(--glass-border)", textAlign: "left", background: "var(--bg-app)" }}>
                <th style={{ padding: "8px" }}>Código</th>
                <th style={{ padding: "8px" }}>Serie</th>
                <th style={{ padding: "8px" }}>Título</th>
                <th style={{ padding: "8px" }}>Caja/Carpeta</th>
                <th style={{ padding: "8px" }}>Folios</th>
             </tr>
          </thead>
          <tbody>
             {registros.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                   <td style={{ padding: "8px" }}>{r.codigo}</td>
                   <td style={{ padding: "8px" }}>{r.serie}</td>
                   <td style={{ padding: "8px" }}>
                      {r.tituloExpediente}
                      {r.esDDHH && <span className="badge" style={{ marginLeft: "8px", background: "var(--danger)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>DDHH</span>}
                   </td>
                   <td style={{ padding: "8px" }}>{r.ubicacionTopografica?.caja} / {r.ubicacionTopografica?.carpeta}</td>
                   <td style={{ padding: "8px" }}>{r.volumen?.folios}</td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
