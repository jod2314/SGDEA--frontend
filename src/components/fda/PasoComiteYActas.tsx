import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { useAuth } from "../../auth/AuthProvider";

const MdGroup = (IconsMd as any).MdGroup || (IconsMd as any).MdPeople;
const MdPictureAsPdf = (IconsMd as any).MdPictureAsPdf;
const MdUpload = (IconsMd as any).MdUpload || (IconsMd as any).MdFileUpload;
const MdAdd = (IconsMd as any).MdAdd;

interface MiembroComite {
  nombre: string;
  cargo: string;
  cedula: string;
}

export default function PasoComiteYActas() {
  const auth = useAuth();
  const [miembros, setMiembros] = useState<MiembroComite[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [nuevaCedula, setNuevaCedula] = useState("");

  const [tipoActa, setTipoActa] = useState("CONFORMACION_COMITE");
  
  useEffect(() => {
    fetchComite();
  }, []);

  const fetchComite = async () => {
    try {
      const res = await auth.request<{ miembros?: MiembroComite[] }>("/comite");
      if (res && res.miembros) {
        setMiembros(res.miembros);
      }
    } catch (err) {
      console.error("Error fetching comite", err);
    }
  };

  const handleAddMiembro = async () => {
    if (!nuevoNombre || !nuevoCargo || !nuevaCedula) return;
    try {
      await auth.request("/comite", {
        method: "POST",
        body: JSON.stringify({
          nombre: nuevoNombre,
          cargo: nuevoCargo,
          cedula: nuevaCedula
        })
      });
      alert("Miembro agregado al comité");
      setNuevoNombre("");
      setNuevoCargo("");
      setNuevaCedula("");
      fetchComite();
    } catch (err) {
      console.error("Error adding miembro", err);
    }
  };

  const handleGenerarActa = async () => {
    try {
      const res = await auth.request<{ base64: string }>("/actas/generar", {
        method: "POST",
        body: JSON.stringify({ tipoActa })
      });
      if (res && res.base64) {
        // trigger download
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${res.base64}`;
        link.download = `Acta_${tipoActa}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error("Error generando acta", err);
      alert("Error al generar acta");
    }
  };

  const handleSubirActa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.pdf')) {
      // Mock subida y obtener url. En realidad se subiría al servidor.
      // Aquí simulamos que se subió y enviamos la URL al backend.
      const urlPdf = URL.createObjectURL(file); // url simulada
      try {
        await auth.request("/actas/subir", {
          method: "POST",
          body: JSON.stringify({ tipoActa, urlPdf })
        });
        alert(`Acta ${tipoActa} firmada subida correctamente.`);
      } catch (err) {
        console.error("Error al subir acta", err);
      }
    } else if (file) {
      alert("Por favor seleccione un archivo PDF");
    }
  };

  return (
    <div className="paso-comite-actas" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdGroup /> Conformación del Comité de Archivo
        </h3>
        <p className="small text-muted">
          Agregue los miembros del comité (nombre, cargo, cédula).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
          <input type="text" placeholder="Nombre completo" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Cargo" value={nuevoCargo} onChange={e => setNuevoCargo(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Cédula" value={nuevaCedula} onChange={e => setNuevaCedula(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <button className="btn btn-primary" onClick={handleAddMiembro} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
            <MdAdd /> Agregar
          </button>
        </div>

        {miembros.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginTop: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--glass-border)", textAlign: "left", background: "var(--bg-app)" }}>
                <th style={{ padding: "8px" }}>Nombre</th>
                <th style={{ padding: "8px" }}>Cargo</th>
                <th style={{ padding: "8px" }}>Cédula</th>
              </tr>
            </thead>
            <tbody>
              {miembros.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                  <td style={{ padding: "8px" }}>{m.nombre}</td>
                  <td style={{ padding: "8px" }}>{m.cargo}</td>
                  <td style={{ padding: "8px" }}>{m.cedula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdPictureAsPdf /> Gestión de Actas (Generación y Carga)
        </h3>
        <p className="small text-muted">
          Seleccione el tipo de acta, genérela para firma y luego suba el PDF firmado.
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
          <select value={tipoActa} onChange={(e) => setTipoActa(e.target.value)} className="edit-input" style={{ padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}>
            <option value="CONFORMACION_COMITE">Acta de Conformación de Comité</option>
            <option value="APROBACION_TVD">Acta de Aprobación de TVD</option>
          </select>
          <button className="btn btn-primary" onClick={handleGenerarActa} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <MdPictureAsPdf /> Generar Acta (PDF)
          </button>
        </div>

        <div style={{ padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px dashed var(--glass-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <MdUpload /> Subir Acta Firmada
          </h4>
          <input type="file" accept=".pdf" onChange={handleSubirActa} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
        </div>
      </div>
    </div>
  );
}
