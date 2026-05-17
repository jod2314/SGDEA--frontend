import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdAdd = (IconsMd as any).MdAdd;
const MdEdit = (IconsMd as any).MdEdit;
const MdHistory = (IconsMd as any).MdHistory;
const MdNumbers = (IconsMd as any).MdNumbers;
const MdBlock = (IconsMd as any).MdBlock;
const MdClose = (IconsMd as any).MdClose;

interface ConsecutivoConfig {
  _id: string;
  codigo: string;
  nombre: string;
  mascara: string;
  reglaReinicio: string;
  ultimoValor: number;
  ultimaFechaEmision: string;
}

interface ConsecutivoLog {
  _id: string;
  numeroEmitido: string;
  documentoRefId?: string;
  usuarioId: { name: string; username: string };
  estado: string;
  createdAt: string;
}

export default function Consecutivos() {
  const auth = useAuth();
  const [configs, setConfigs] = useState<ConsecutivoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [mascara, setMascara] = useState("");
  const [reglaReinicio, setReglaReinicio] = useState("ANUAL");

  // Log Modal State
  const [showLogs, setShowLogs] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<ConsecutivoLog[]>([]);
  const [activeConfigName, setActiveConfigName] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchConfigs();
    }
  }, [auth.isAuthenticated]);

  async function fetchConfigs() {
    try {
      const json = await auth.request<any>("/consecutivos/config");
      setConfigs(json.body.consecutivos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endpoint = isEditing ? `/consecutivos/config/${currentId}` : "/consecutivos/config";
    const method = isEditing ? "PUT" : "POST";

    try {
      await auth.request<any>(endpoint, {
        method,
        body: JSON.stringify({ codigo, nombre, mascara, reglaReinicio })
      });
      fetchConfigs();
      resetForm();
    } catch (error: any) {
      alert(error.message || "Error al guardar la configuración");
    }
  }

  function handleEdit(config: ConsecutivoConfig) {
    setIsEditing(true);
    setCurrentId(config._id);
    setCodigo(config.codigo);
    setNombre(config.nombre);
    setMascara(config.mascara);
    setReglaReinicio(config.reglaReinicio);
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setIsEditing(false);
    setCurrentId("");
    setCodigo("");
    setNombre("");
    setMascara("");
    setReglaReinicio("ANUAL");
  }

  async function fetchLogs(configId: string, configName: string) {
    setActiveConfigName(configName);
    try {
      const json = await auth.request<any>(`/consecutivos/log/${configId}`);
      setCurrentLogs(json.body.logs);
      setShowLogs(true);
    } catch (error) {
      console.error(error);
      alert("Error al cargar el historial");
    }
  }

  async function handleAnular(logId: string) {
    if (!confirm("¿Está seguro de que desea anular este radicado? Esta acción es irreversible.")) return;
    try {
      await auth.request<any>(`/consecutivos/anular/${logId}`, { method: "POST" });
      // Refrescar los logs
      setCurrentLogs(currentLogs.map(l => l._id === logId ? { ...l, estado: 'ANULADO' } : l));
    } catch (error: any) {
      alert(error.message || "Error al anular");
    }
  }

  // Simular emisión para pruebas
  async function handleTestEmitir(codigoConf: string) {
    try {
      const json = await auth.request<any>(`/consecutivos/emitir/${codigoConf}`, {
        method: "POST",
        body: JSON.stringify({ documentoRefId: "TEST-UI-123" })
      });
      alert(`Radicado emitido con éxito: ${json.body.radicado}`);
      fetchConfigs(); // Actualizar el contador en la vista
    } catch (error: any) {
      alert(error.message || "Error al emitir");
    }
  }

  return (
    <PortalLayout>
      <div className="consecutivos-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Motor de Consecutivos y Radicados</h1>
            <p className="text-muted">Administra los contadores atómicos y las máscaras de formato para las comunicaciones y documentos oficiales.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={showForm}>
            <MdAdd /> Nueva Configuración
          </button>
        </header>

        {showForm && (
          <section className="card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '4px solid var(--primary-color)' }}>
            <h2>{isEditing ? "Editar Configuración" : "Nueva Configuración de Consecutivo"}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div>
                <label>Código Interno</label>
                <input 
                  type="text" 
                  value={codigo} 
                  onChange={e => setCodigo(e.target.value.toUpperCase())} 
                  required 
                  className="edit-input" 
                  placeholder="Ej: RAD_INT" 
                  disabled={isEditing} 
                  style={{ width: '100%', opacity: isEditing ? 0.7 : 1 }}
                />
                <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>Debe ser único por empresa y no contener espacios.</small>
              </div>
              
              <div>
                <label>Nombre Descriptivo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="edit-input" placeholder="Ej: Radicación de Comunicaciones Internas" style={{ width: '100%' }} />
              </div>

              <div>
                <label>Máscara de Formato</label>
                <input type="text" value={mascara} onChange={e => setMascara(e.target.value)} required className="edit-input" placeholder="Ej: RAD-{YYYY}-{SEQ:5}" style={{ width: '100%', fontFamily: 'monospace' }} />
                <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>Use {'{YYYY}'} para el año, {'{SEQ}'} para el número o {'{SEQ:4}'} para rellenar con ceros (ej. 0001).</small>
              </div>

              <div>
                <label>Regla de Reinicio Automático</label>
                <select value={reglaReinicio} onChange={e => setReglaReinicio(e.target.value)} className="edit-input" style={{ width: '100%' }}>
                  <option value="ANUAL">Anual (El 1 de enero vuelve a 1)</option>
                  <option value="CONTINUO">Continuo (Nunca se reinicia automáticamente)</option>
                  <option value="MANUAL">Manual (Requiere intervención humana)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Actualizar" : "Guardar"}</button>
              </div>
            </form>
          </section>
        )}

        <section className="card" style={{ padding: '20px' }}>
          {loading ? <p>Cargando configuraciones...</p> : configs.length === 0 ? <p className="text-muted text-center" style={{ padding: '30px' }}>No hay consecutivos configurados aún.</p> : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Máscara</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Reinicio</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Último Valor</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map(conf => (
                    <tr key={conf._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{conf.codigo}</td>
                      <td style={{ padding: '12px' }}>{conf.nombre}</td>
                      <td style={{ padding: '12px', color: '#0066cc', fontFamily: 'monospace' }}>{conf.mascara}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', background: '#e9ecef', padding: '3px 8px', borderRadius: '12px' }}>{conf.reglaReinicio}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>{conf.ultimoValor}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                          <button className="btn btn-icon" onClick={() => handleEdit(conf)} title="Editar Configuración"><MdEdit /></button>
                          <button className="btn btn-icon" onClick={() => fetchLogs(conf._id, conf.nombre)} title="Ver Historial de Radicados"><MdHistory /></button>
                          <button className="btn btn-icon" onClick={() => handleTestEmitir(conf.codigo)} title="Probar Emisión (Test)"><MdNumbers /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal de Logs */}
        {showLogs && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}><MdHistory /> Historial Inmutable: {activeConfigName}</h3>
                <button className="btn btn-icon" onClick={() => setShowLogs(false)}><MdClose /></button>
              </div>
              
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {currentLogs.length === 0 ? <p className="text-center text-muted">No se han emitido radicados aún.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Fecha y Hora</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Número Emitido</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Usuario</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Referencia</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLogs.map(log => (
                        <tr key={log._id} style={{ borderBottom: '1px solid #eee', background: log.estado === 'ANULADO' ? '#fff0f0' : 'transparent' }}>
                          <td style={{ padding: '10px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace', textDecoration: log.estado === 'ANULADO' ? 'line-through' : 'none' }}>{log.numeroEmitido}</td>
                          <td style={{ padding: '10px' }}>{log.usuarioId?.name || 'Desconocido'}</td>
                          <td style={{ padding: '10px', color: '#666' }}>{log.documentoRefId || '-'}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{ 
                              fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px',
                              background: log.estado === 'ACTIVO' ? '#e6f4ea' : '#ffebee',
                              color: log.estado === 'ACTIVO' ? '#1e8e3e' : '#d93025'
                            }}>
                              {log.estado}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {log.estado === 'ACTIVO' && (
                              <button className="btn btn-icon btn-danger" onClick={() => handleAnular(log._id)} title="Anular Radicado">
                                <MdBlock />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
