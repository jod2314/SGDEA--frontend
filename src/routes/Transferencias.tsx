import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Expediente, Transferencia } from "../types/types";

const MdSwapHoriz = (IconsMd as any).MdSwapHoriz;
const MdNotificationsActive = (IconsMd as any).MdNotificationsActive;
const MdAssignment = (IconsMd as any).MdAssignment;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdInfo = (IconsMd as any).MdInfo;

export default function Transferencias() {
  const auth = useAuth();
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [listosPrimaria, setListosPrimaria] = useState<Expediente[]>([]);
  const [listosSecundaria, setListosSecundaria] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tipoActual, setTipoActual] = useState<'PRIMARIA' | 'SECUNDARIA'>('PRIMARIA');
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchData();
    }
  }, [auth.isAuthenticated]);

  async function fetchData() {
    setLoading(true);
    try {
      const [transRes, primRes, secRes] = await Promise.all([
        auth.request<any>("/transferencias"),
        auth.request<any>("/transferencias/listos?tipo=PRIMARIA"),
        auth.request<any>("/transferencias/listos?tipo=SECUNDARIA")
      ]);
      
      setTransferencias(transRes.body.transferencias || []);
      setListosPrimaria(primRes.body.expedientes || []);
      setListosSecundaria(secRes.body.expedientes || []);
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

  async function handleCreateActa() {
    if (selectedIds.length === 0) return alert("Selecciona al menos un expediente.");
    
    try {
      await auth.request<any>("/transferencias", {
        method: "POST",
        body: JSON.stringify({
          tipoTransferencia: tipoActual,
          expedientes: selectedIds,
          observaciones
        })
      });
      alert("Acta de transferencia creada como borrador.");
      setSelectedIds([]);
      setObservaciones("");
      fetchData();
    } catch (error: any) {
      alert(error.message || "Error al crear acta");
    }
  }

  async function handleFinalizar(id: string) {
    if (!confirm("¿Deseas finalizar esta transferencia? Los expedientes cambiarán su ubicación física de forma irreversible en el sistema.")) return;
    try {
      await auth.request<any>(`/transferencias/${id}/finalizar`, { method: "POST" });
      alert("Transferencia finalizada con éxito.");
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleDownloadFUID(id: string, name: string) {
    try {
      const json = await auth.request<any>(`/transferencias/${id}/fuid`);
      // Simulación de exportación a CSV/JSON para el FUID
      const data = json.body.inventario;
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Orden;Código;Serie/Subserie;Fecha Inicial;Fecha Final;Soporte;Notas\n"
        + data.map((item: any) => `${item.numeroOrden};${item.codigo};${item.nombreSerieSubserie};${item.fechasExtremas.inicial};${item.fechasExtremas.final};${item.soporte};${item.notas}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `FUID_${name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error al generar FUID");
    }
  }

  return (
    <PortalLayout>
      <div className="transferencias-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1><MdSwapHoriz /> Ciclo Vital y Transferencias</h1>
            <p className="text-muted">Gestión de traslados entre Archivo de Gestión, Central e Histórico.</p>
          </div>
        </header>

        <div className="transferencias-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          
          {/* Alertas de Retención Vencida */}
          <section className="column-left">
            <div className="card" style={{ padding: '20px', marginBottom: '25px', borderTop: '4px solid #f39c12' }}>
              <h2><MdNotificationsActive color="#f39c12" /> Alertas de Retención</h2>
              <p className="small text-muted">Expedientes que han cumplido su tiempo de permanencia y están listos para traslado.</p>
              
              <div style={{ marginTop: '20px' }}>
                <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                  <button 
                    className={`btn ${tipoActual === 'PRIMARIA' ? 'btn-primary' : 'btn-ghost'}`} 
                    onClick={() => { setTipoActual('PRIMARIA'); setSelectedIds([]); }}
                    style={{ borderRadius: '0' }}
                  >
                    Para Primaria ({listosPrimaria.length})
                  </button>
                  <button 
                    className={`btn ${tipoActual === 'SECUNDARIA' ? 'btn-primary' : 'btn-ghost'}`} 
                    onClick={() => { setTipoActual('SECUNDARIA'); setSelectedIds([]); }}
                    style={{ borderRadius: '0' }}
                  >
                    Para Secundaria ({listosSecundaria.length})
                  </button>
                </div>

                <div className="listos-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {(tipoActual === 'PRIMARIA' ? listosPrimaria : listosSecundaria).length === 0 ? (
                    <p className="text-muted text-center" style={{ padding: '20px' }}>No hay expedientes pendientes por transferir en esta categoría.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee', color: '#666' }}>
                          <th style={{ padding: '10px' }}>Sel.</th>
                          <th style={{ padding: '10px' }}>Código / Nombre</th>
                          <th style={{ padding: '10px' }}>Cierre</th>
                          <th style={{ padding: '10px' }}>Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tipoActual === 'PRIMARIA' ? listosPrimaria : listosSecundaria).map(exp => (
                          <tr key={exp.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '10px' }}>
                              <input type="checkbox" checked={selectedIds.includes(exp.id)} onChange={() => toggleSelection(exp.id)} />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <strong>{exp.codigoTRD}</strong><br/>
                              {exp.nombreExpediente}
                            </td>
                            <td style={{ padding: '10px' }}>{new Date(exp.fechaCierre!).toLocaleDateString()}</td>
                            <td style={{ padding: '10px' }}><span className="badge">{exp.ubicacion}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {selectedIds.length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px' }}>
                    <label>Observaciones del Acta</label>
                    <textarea 
                      className="edit-input" 
                      style={{ width: '100%', minHeight: '60px', marginTop: '10px' }}
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                      placeholder="Indique detalles sobre el estado físico de los expedientes o motivos del traslado..."
                    />
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }} onClick={handleCreateActa}>
                      Generar Acta de Transferencia ({selectedIds.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Historial de Transferencias y FUID */}
          <section className="column-right">
            <div className="card" style={{ padding: '20px' }}>
              <h2><MdAssignment /> Actas y FUIDs</h2>
              <p className="small text-muted">Registro de transferencias realizadas y descarga de inventarios.</p>

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? <p>Cargando actas...</p> : transferencias.length === 0 ? <p className="text-muted">No se han registrado transferencias aún.</p> : transferencias.map(trans => (
                  <div key={trans.id} className="card" style={{ padding: '15px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge" style={{ background: trans.tipoTransferencia === 'PRIMARIA' ? '#d1ecf1' : '#f8d7da', color: trans.tipoTransferencia === 'PRIMARIA' ? '#0c5460' : '#721c24', fontSize: '0.7rem' }}>
                          {trans.tipoTransferencia}
                        </span>
                        <h4 style={{ margin: '5px 0' }}>Acta: {trans.numeroActa || 'SIN-NUMERO'}</h4>
                        <p className="small text-muted">{new Date(trans.fechaTransferencia).toLocaleDateString()} | {trans.expedientes.length} Expedientes</p>
                      </div>
                      <span className={`badge ${trans.estado === 'FINALIZADA' ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem' }}>{trans.estado}</span>
                    </div>
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                      {trans.estado === 'BORRADOR' && (
                        <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleFinalizar(trans.id)}>
                          <MdCheckCircle /> Finalizar
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleDownloadFUID(trans.id, trans.id)}>
                        <MdFileDownload /> FUID
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px', marginTop: '25px', background: '#f4f7fe' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <MdInfo color="#2b5fcc" size={24} />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Nota Normativa:</strong> El FUID es el soporte legal para la entrega y recepción de documentos. Debe ser firmado por los responsables de las dependencias remitente y receptora.
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      <style>{`
        .badge.success { background: #e6f4ea; color: #1e8e3e; }
        .badge.warning { background: #fff4e5; color: #663c00; }
        .listos-list table tr:hover { background: #fcfcfc; }
      `}</style>
    </PortalLayout>
  );
}
