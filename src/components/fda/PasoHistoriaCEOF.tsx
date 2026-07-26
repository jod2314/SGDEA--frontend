import { useState, useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { CEOFData } from "../../types/fda";
import { useAuth } from "../../auth/AuthProvider";

const MdAccountTree = (IconsMd as any).MdAccountTree || (IconsMd as any).MdAccountBalance;
const MdHistoryEdu = (IconsMd as any).MdHistoryEdu || (IconsMd as any).MdMenuBook;
const MdSave = (IconsMd as any).MdSave;
const MdAdd = (IconsMd as any).MdAdd;

export default function PasoHistoriaCEOF() {
  const auth = useAuth();
  const [ceof, setCeof] = useState<CEOFData | null>(null);

  // Campos de Formulario Cuestionario
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [actoCreacion, setActoCreacion] = useState("");
  const [cambiosEstructurales, setCambiosEstructurales] = useState("");

  // Nuevo Periodo Histórico
  const [nuevoPeriodoNombre, setNuevoPeriodoNombre] = useState("");
  const [nuevoPeriodoInicio, setNuevoPeriodoInicio] = useState("");
  const [nuevoPeriodoFin, setNuevoPeriodoFin] = useState("");
  const [nuevaDepCodigo, setNuevaDepCodigo] = useState("");
  const [nuevaDepNombre, setNuevaDepNombre] = useState("");
  const [nuevaDepProductora, setNuevaDepProductora] = useState(true);

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
          if (res.ceof.cuestionarioHistoria.fechaCreacionEntidad) {
             setFechaCreacion(res.ceof.cuestionarioHistoria.fechaCreacionEntidad.split('T')[0]);
          }
          setCambiosEstructurales(res.ceof.cuestionarioHistoria.cambiosEstructuralesHistoricos || "");
        }
      }
    } catch (err) {
      console.error("Error al cargar CEOF", err);
    }
  };

  const handleGuardarHistoria = async () => {
    try {
      await auth.request("/fondos-acumulados/ceof", {
        method: "PUT",
        body: JSON.stringify({
          cuestionarioHistoria: {
            actoAdministrativoCreacion: actoCreacion,
            fechaCreacionEntidad: fechaCreacion || undefined,
            cambiosEstructuralesHistoricos: cambiosEstructurales,
          }
        })
      });
      alert("Historia institucional guardada correctamente.");
    } catch (err) {
      console.error("Error al guardar historia", err);
    }
  };

  const handleAgregarPeriodo = async () => {
    try {
      const payload = {
        nombre: nuevoPeriodoNombre,
        fechaInicio: nuevoPeriodoInicio,
        fechaFin: nuevoPeriodoFin,
        dependencias: [{
           codigo: nuevaDepCodigo,
           nombre: nuevaDepNombre,
           esOficinaProductora: nuevaDepProductora
        }]
      };
      await auth.request("/fondos-acumulados/ceof", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      alert("Período histórico agregado.");
      fetchCEOF();
      setNuevoPeriodoNombre("");
      setNuevoPeriodoInicio("");
      setNuevoPeriodoFin("");
      setNuevaDepCodigo("");
      setNuevaDepNombre("");
      setNuevaDepProductora(true);
    } catch (err) {
      console.error("Error al agregar período", err);
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
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)", marginBottom: "15px" }}
          />
          <button 
            className="btn btn-primary"
            onClick={handleGuardarHistoria}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <MdSave /> Guardar Historia Institucional
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAdd /> Agregar Nuevo Período Histórico
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <input type="text" placeholder="Nombre (Ej: Entidad Fundacional)" value={nuevoPeriodoNombre} onChange={e => setNuevoPeriodoNombre(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="date" placeholder="Fecha Inicio" value={nuevoPeriodoInicio} onChange={e => setNuevoPeriodoInicio(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="date" placeholder="Fecha Fin" value={nuevoPeriodoFin} onChange={e => setNuevoPeriodoFin(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
          <input type="text" placeholder="Código Dependencia (Ej: 100)" value={nuevaDepCodigo} onChange={e => setNuevaDepCodigo(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <input type="text" placeholder="Nombre Dependencia" value={nuevaDepNombre} onChange={e => setNuevaDepNombre(e.target.value)} className="edit-input" style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }} />
          <label style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-secondary)" }}>
            <input type="checkbox" checked={nuevaDepProductora} onChange={e => setNuevaDepProductora(e.target.checked)} />
            Es Productora
          </label>
        </div>
        <button className="btn btn-secondary" onClick={handleAgregarPeriodo} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
           <MdAdd /> Agregar Período y Dependencia
        </button>
      </div>

      <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAccountTree /> Cuadro Evolutivo Orgánico-Funcional (CEOF) por Períodos
        </h4>

        {(!ceof || !ceof.periodosHistoricos || ceof.periodosHistoricos.length === 0) ? (
          <p className="text-muted">No hay períodos registrados.</p>
        ) : (
          ceof.periodosHistoricos.map((periodo, pIdx) => (
            <div key={pIdx} style={{ padding: "15px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--glass-border)", marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <strong>{periodo.nombrePeriodo} ({periodo.fechaInicial ? periodo.fechaInicial.split('T')[0] : ''} - {periodo.fechaFinal ? periodo.fechaFinal.split('T')[0] : 'Presente'})</strong>
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
                  {periodo.dependenciasHistoricas.map((dep: any, dIdx: number) => (
                    <tr key={dIdx} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                      <td style={{ padding: "8px" }}>{dep.codigo}</td>
                      <td style={{ padding: "8px" }}>{dep.nombre}</td>
                      <td style={{ padding: "8px" }}>{dep.oficinaProductora ? "SÍ" : "NO"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
