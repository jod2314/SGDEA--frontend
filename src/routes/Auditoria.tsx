import { useEffect, useState } from "react";
import PortalLayout from "../layout/PortalLayout";
import { useAuth } from "../auth/AuthProvider";
import * as IconsMd from "react-icons/md";

const MdHistory = (IconsMd as any).MdHistory;
const MdSearch = (IconsMd as any).MdSearch;
const MdVerifiedUser = (IconsMd as any).MdVerifiedUser;
const MdInfo = (IconsMd as any).MdInfo;
const MdTimeline = (IconsMd as any).MdTimeline;
const MdFilterList = (IconsMd as any).MdFilterList;

interface AuditLog {
  _id: string;
  accion: string;
  tipoRecurso?: string;
  recursoId?: string;
  usuario: {
    name: string;
    username: string;
  };
  detalles: any;
  ip?: string;
  userAgent?: string;
  fecha: string;
}

interface Stats {
  totalEventos: number;
  ultimas24h: number;
  accionesTop: Array<{ _id: string; count: number }>;
}

export default function Auditoria() {
  const auth = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Filtros
  const [tipoRecurso, setTipoRecurso] = useState("");
  const [accionFiltro, setAccionFiltro] = useState("");

  // Timeline Modal
  const [showTimeline, setShowTimeline] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [tipoRecurso, accionFiltro]);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = "?";
      if (tipoRecurso) query += `tipoRecurso=${tipoRecurso}&`;
      if (accionFiltro) query += `accion=${accionFiltro}&`;
      
      const json = await auth.request<any>(`/audit${query}`);
      setLogs(json.body.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const json = await auth.request<any>("/audit/stats");
      setStats(json.body.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function handleVerify(docId: string) {
    try {
      const json = await auth.request<any>(`/audit/verificar/${docId}`);
      alert(`✅ Verificación exitosa!\nHash Registrado: ${json.body.hashRegistrado}\nFecha: ${new Date(json.body.fechaEmision).toLocaleString()}`);
    } catch (error: any) {
      alert("❌ Fallo de integridad: " + (error.message || "Error al verificar"));
    }
  }

  async function handleViewTimeline(tipo: string, id: string) {
    setLoadingTimeline(true);
    setShowTimeline(true);
    try {
      const json = await auth.request<any>(`/audit/timeline/${tipo}/${id}`);
      setCurrentTimeline(json.body.timeline);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTimeline(false);
    }
  }

  return (
    <PortalLayout>
      <div className="auditoria-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1><MdHistory /> Auditoría Forense y Trazabilidad</h1>
            <p className="text-muted">Supervisión técnica de integridad, accesos y reconstrucción histórica del sistema.</p>
          </div>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.8rem', color: '#888' }}>Total Eventos</h3>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalEventos}</p>
            </div>
            <div className="card" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #2ecc71' }}>
              <h3 style={{ fontSize: '0.8rem', color: '#888' }}>Últimas 24h</h3>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>{stats.ultimas24h}</p>
            </div>
            <div className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>Acciones Frecuentes</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {stats.accionesTop.map(a => (
                  <span key={a._id} className="badge" style={{ background: '#f0f4f8', color: '#2b5fcc' }}>{a._id}: {a.count}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <section className="card" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label><MdFilterList /> Tipo de Recurso</label>
            <select value={tipoRecurso} onChange={e => setTipoRecurso(e.target.value)} className="edit-input" style={{ width: '100%' }}>
              <option value="">Todos los recursos</option>
              <option value="PLANTILLA">Plantillas</option>
              <option value="DOCUMENTO">Documentos / Radicados</option>
              <option value="DATO_MAESTRO">Datos Maestros</option>
              <option value="EXPEDIENTE">Expedientes</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Acción Específica</label>
            <input 
              type="text" 
              placeholder="Ej: PROYECTAR_DOCUMENTO" 
              value={accionFiltro} 
              onChange={e => setAccionFiltro(e.target.value)}
              className="edit-input" 
              style={{ width: '100%' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => fetchLogs()}><MdSearch /> Refrescar</button>
        </section>

        {/* Logs Table */}
        <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fecha y Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Acción</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Recurso</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>IP / Origen</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Forense</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Cargando datos de auditoría...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No se encontraron registros con los filtros aplicados.</td></tr>
                ) : logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{new Date(log.fecha).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <strong>{log.usuario?.name || 'Sistema'}</strong>
                      <div className="small text-muted">{log.usuario?.username}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge" style={{ background: '#e1f5fe', color: '#01579b' }}>{log.accion}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.tipoRecurso && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="text-muted">{log.tipoRecurso}:</span>
                          <span style={{ fontFamily: 'monospace' }}>{log.recursoId?.substring(0, 8)}...</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.75rem' }}>{log.ip}</div>
                      <div className="small text-muted" title={log.userAgent} style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.userAgent}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {log.accion === 'PROYECTAR_DOCUMENTO' && log.recursoId && (
                          <button className="btn btn-icon" title="Verificar Integridad" onClick={() => handleVerify(log.recursoId!)}>
                            <MdVerifiedUser color="#27ae60" />
                          </button>
                        )}
                        {log.recursoId && (
                          <button className="btn btn-icon" title="Ver Línea de Tiempo" onClick={() => handleViewTimeline(log.tipoRecurso!, log.recursoId!)}>
                            <MdTimeline color="#2b5fcc" />
                          </button>
                        )}
                        <button className="btn btn-icon" title="Detalles Técnicos" onClick={() => alert(JSON.stringify(log.detalles, null, 2))}>
                          <MdInfo color="#666" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Timeline Modal */}
        {showTimeline && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}><MdTimeline /> Reconstrucción de Línea de Tiempo</h3>
                <button className="btn btn-icon" onClick={() => setShowTimeline(false)}><IconsMd.MdClose /></button>
              </div>
              
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {loadingTimeline ? <p>Cargando historia...</p> : currentTimeline.length === 0 ? <p className="text-muted text-center">No hay historia disponible para este recurso.</p> : (
                  <div className="timeline-list" style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
                    {currentTimeline.map((item, index) => (
                      <div key={index} style={{ marginBottom: '25px', position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', left: '-27px', top: '0', width: '12px', height: '12px', 
                          borderRadius: '50%', background: item.tipo === 'VERSION' ? 'var(--primary-color)' : '#999',
                          border: '2px solid white'
                        }} />
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(item.fecha).toLocaleString()}</div>
                        <div style={{ fontWeight: 'bold' }}>{item.accion || `Versión ${item.numero || ''}`}</div>
                        <div className="small">Por: <strong>{item.usuario}</strong> {item.ip && `desde ${item.ip}`}</div>
                        {item.comentario && <div style={{ background: '#f9f9f9', padding: '5px 10px', marginTop: '5px', borderRadius: '4px', fontSize: '0.85rem', borderLeft: '3px solid #ddd' }}>
                          "{item.comentario}"
                        </div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
        .text-muted { color: #888; font-size: 0.85rem; }
      `}</style>
    </PortalLayout>
  );
}
