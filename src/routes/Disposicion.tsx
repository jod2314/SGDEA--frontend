import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Expediente, ActaEliminacion } from "../types/types";

const MdDeleteSweep = (IconsMd as any).MdDeleteSweep;
const MdAssignmentLate = (IconsMd as any).MdAssignmentLate;
const MdHistoryEdu = (IconsMd as any).MdHistoryEdu;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdGavel = (IconsMd as any).MdGavel;
const MdInfo = (IconsMd as any).MdInfo;

export default function Disposicion() {
  const auth = useAuth();
  const [listosDisposicion, setListosDisposicion] = useState<Expediente[]>([]);
  const [actas, setActas] = useState<ActaEliminacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [numeroActa, setNumeroActa] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchData();
    }
  }, [auth.isAuthenticated]);

  async function fetchData() {
    setLoading(true);
    try {
      const [listosRes, actasRes] = await Promise.all([
        auth.request<any>("/disposicion/listos"),
        auth.request<any>("/disposicion/actas") // Necesitaremos este endpoint en backend
      ]).catch(() => [ {body: {expedientes: []}}, {body: {actas: []}} ]);
      
      setListosDisposicion(listosRes.body.expedientes || []);
      // Si el endpoint de actas no existiera, manejamos el error silenciosamente
      setActas(actasRes?.body?.actas || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  async function handleCreateActa(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) return alert("Selecciona expedientes para eliminar.");
    
    try {
      await auth.request<any>("/disposicion/eliminar", {
        method: "POST",
        body: JSON.stringify({
          numeroActa,
          expedientesIds: selectedIds,
          justificacion
        })
      });
      alert("Borrador de Acta de Eliminación generado.");
      setSelectedIds([]);
      setNumeroActa("");
      setJustificacion("");
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Error al crear acta");
    }
  }

  async function handleAprobarEliminacion(id: string) {
    if (!confirm("⚠️ ADVERTENCIA: Esta acción ejecutará la eliminación lógica y física (si aplica) de los expedientes vinculados. Esta operación es IRREVERSIBLE. ¿Deseas continuar?")) return;
    try {
      await auth.request<any>(`/disposicion/eliminar/${id}/aprobar`, { method: "POST" });
      alert("Eliminación ejecutada con éxito.");
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <PortalLayout>
      <div className="disposicion-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1><MdGavel /> Disposición Final y Baja Documental</h1>
            <p className="text-muted">Cierre definitivo del ciclo vital: Eliminación o Conservación Permanente.</p>
          </div>
        </header>

        <div className="disposicion-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          
          {/* Expedientes listos para Disposición */}
          <section className="column-left">
            <div className="card" style={{ padding: '20px', borderTop: '4px solid #e74c3c' }}>
              <h2><MdAssignmentLate color="#e74c3c" /> Alertas de Disposición Final</h2>
              <p className="small text-muted">Expedientes en Archivo Central cuyo tiempo de retención total ha expirado.</p>
              
              <div style={{ marginTop: '20px' }}>
                {loading ? <p>Consultando tiempos de retención...</p> : listosDisposicion.length === 0 ? (
                  <p className="text-center text-muted" style={{ padding: '40px' }}>No hay expedientes con retención vencida en este momento.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee', color: '#666' }}>
                        <th style={{ padding: '10px' }}>Sel.</th>
                        <th style={{ padding: '10px' }}>Expediente</th>
                        <th style={{ padding: '10px' }}>TRD</th>
                        <th style={{ padding: '10px' }}>Disposición</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listosDisposicion.map(exp => (
                        <tr key={exp.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{ padding: '10px' }}>
                            <input type="checkbox" checked={selectedIds.includes(exp.id)} onChange={() => toggleSelection(exp.id)} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <strong>{exp.nombreExpediente}</strong>
                            <div className="small text-muted">Cerrado: {new Date(exp.fechaCierre!).toLocaleDateString()}</div>
                          </td>
                          <td style={{ padding: '10px' }}>{exp.codigoTRD}</td>
                          <td style={{ padding: '10px' }}>
                            <span className="badge" style={{ background: '#f8d7da', color: '#721c24' }}>ELIMINACIÓN</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedIds.length > 0 && !showForm && (
                  <button className="btn btn-danger" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowForm(true)}>
                    Iniciar Proceso de Eliminación ({selectedIds.length})
                  </button>
                )}

                {showForm && (
                  <form onSubmit={handleCreateActa} style={{ marginTop: '20px', padding: '20px', background: '#fff0f0', border: '1px solid #fab1a0', borderRadius: '8px' }}>
                    <h3 style={{ color: '#d63031' }}>Acta de Eliminación Documental</h3>
                    <div style={{ marginTop: '15px' }}>
                      <label>Número de Acta</label>
                      <input 
                        type="text" 
                        value={numeroActa} 
                        onChange={e => setNumeroActa(e.target.value)} 
                        required 
                        className="edit-input" 
                        placeholder="Ej: AE-2026-001"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                      <label>Justificación Legal / Técnica</label>
                      <textarea 
                        value={justificacion} 
                        onChange={e => setJustificacion(e.target.value)} 
                        required 
                        className="edit-input" 
                        style={{ width: '100%', minHeight: '100px' }}
                        placeholder="Cite el fundamento legal de la TRD y el motivo de la baja..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Generar Borrador de Acta</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* Historial de Actas y Archivo Histórico */}
          <section className="column-right">
            <div className="card" style={{ padding: '20px', marginBottom: '25px' }}>
              <h2><MdHistoryEdu /> Registro de Actas de Baja</h2>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {actas.length === 0 ? <p className="text-muted small">No hay actas registradas.</p> : actas.map(acta => (
                  <div key={acta.id} className="card" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{acta.numeroActa}</strong>
                      <span className={`badge ${acta.estado === 'APROBADA' ? 'success' : 'warning'}`}>{acta.estado}</span>
                    </div>
                    <p className="small text-muted">{acta.expedientesEliminados.length} expedientes afectados</p>
                    {acta.estado === 'BORRADOR' && (
                      <button className="btn btn-danger btn-sm" style={{ width: '100%', marginTop: '10px' }} onClick={() => handleAprobarEliminacion(acta.id)}>
                        Aprobar y Ejecutar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: '#fcfcfc', borderLeft: '4px solid #3498db' }}>
              <h3><MdInfo color="#3498db" /> Conservación Total</h3>
              <p className="small text-muted" style={{ marginTop: '10px' }}>
                Los expedientes con disposición de Conservación Total deben ser trasladados al módulo de <strong>Archivo Histórico</strong> una vez finalizada su retención en Central.
              </p>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '15px' }}>
                Ver Archivo Histórico
              </button>
            </div>
          </section>

        </div>
      </div>
      <style>{`
        .badge.success { background: #e6f4ea; color: #1e8e3e; }
        .badge.warning { background: #fff4e5; color: #663c00; }
      `}</style>
    </PortalLayout>
  );
}
