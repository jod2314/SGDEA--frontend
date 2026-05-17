import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Expediente, HistorialDocumento, TRD } from "../types/types";

const MdFolder = (IconsMd as any).MdFolder;
const MdFolderOpen = (IconsMd as any).MdFolderOpen;
const MdAdd = (IconsMd as any).MdAdd;
const MdClose = (IconsMd as any).MdClose;
const MdDownload = (IconsMd as any).MdDownload;
const MdDescription = (IconsMd as any).MdDescription;
const MdLock = (IconsMd as any).MdLock;
const MdSearch = (IconsMd as any).MdSearch;
const MdVerifiedUser = (IconsMd as any).MdVerifiedUser;

export default function Expedientes() {
  const auth = useAuth();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [trds, setTrds] = useState<TRD[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Create Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nombreExpediente, setNombreExpediente] = useState("");
  const [subserieId, setSubserieId] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // State for Details View
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [documentos, setDocumentos] = useState<HistorialDocumento[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchExpedientes();
      fetchTrds();
    }
  }, [auth.isAuthenticated]);

  async function fetchExpedientes() {
    try {
      const json = await auth.request<any>("/expedientes");
      setExpedientes(json.body.expedientes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrds() {
    try {
      const json = await auth.request<any>("/archivistica/trd");
      setTrds(json.body.trd);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateExpediente(e: React.FormEvent) {
    e.preventDefault();
    try {
      await auth.request<any>("/expedientes", {
        method: "POST",
        body: JSON.stringify({ nombreExpediente, subserieId, descripcion })
      });
      fetchExpedientes();
      setShowCreateForm(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || "Error al crear expediente");
    }
  }

  function resetForm() {
    setNombreExpediente("");
    setSubserieId("");
    setDescripcion("");
  }

  async function handleViewDetails(exp: Expediente) {
    setSelectedExpediente(exp);
    setLoadingDetails(true);
    try {
      const json = await auth.request<any>(`/expedientes/${exp.id}`);
      setDocumentos(json.body.documentos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleCerrarExpediente(id: string) {
    if (!confirm("¿Deseas cerrar este expediente? No podrás añadir más documentos y se generará el Índice XML inmutable.")) return;
    try {
      const json = await auth.request<any>(`/expedientes/${id}/cerrar`, { method: "POST" });
      alert(json.body.message);
      fetchExpedientes();
      if (selectedExpediente?.id === id) {
        handleViewDetails(json.body.expediente);
      }
    } catch (error: any) {
      alert(error.message || "Error al cerrar");
    }
  }

  function downloadXml(xml: string, name: string) {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INDICE_${name.replace(/\s+/g, "_")}.xml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <PortalLayout>
      <div className="expedientes-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Expedientes Electrónicos</h1>
            <p className="text-muted">Agrupación lógica y foliación secuencial de documentos por serie/subserie.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <MdAdd /> Abrir Nuevo Expediente
          </button>
        </header>

        {showCreateForm && (
          <section className="card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '4px solid #2ecc71' }}>
            <h2>Apertura de Expediente</h2>
            <form onSubmit={handleCreateExpediente} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div>
                <label>Nombre del Expediente</label>
                <input 
                  type="text" 
                  value={nombreExpediente} 
                  onChange={e => setNombreExpediente(e.target.value)} 
                  required 
                  className="edit-input" 
                  placeholder="Ej: Contrato de Arrendamiento 2026-001" 
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label>Vincular a Categoría TRD</label>
                <select 
                  value={subserieId} 
                  onChange={e => setSubserieId(e.target.value)} 
                  required 
                  className="edit-input" 
                  style={{ width: '100%' }}
                >
                  <option value="">Seleccione Subserie...</option>
                  {trds.map(trd => (
                    <option key={trd.id} value={(trd.subserieId as any)._id}>
                      {trd.codigoTRD} - {(trd.subserieId as any).nombreSubserie}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Descripción / Justificación</label>
                <textarea 
                  value={descripcion} 
                  onChange={e => setDescripcion(e.target.value)} 
                  className="edit-input" 
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Abrir Expediente</button>
              </div>
            </form>
          </section>
        )}

        <div className="expedientes-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '25px' }}>
          {/* Listado de Expedientes */}
          <section className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h2><MdFolder /> Inventario de Expedientes</h2>
            <div style={{ marginTop: '20px' }}>
              {loading ? <p>Cargando...</p> : expedientes.length === 0 ? <p className="text-muted">No hay expedientes abiertos.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {expedientes.map(exp => (
                    <div 
                      key={exp.id} 
                      onClick={() => handleViewDetails(exp)}
                      style={{ 
                        padding: '12px', 
                        border: '1px solid #eee', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        background: selectedExpediente?.id === exp.id ? '#f0f7ff' : '#fff',
                        borderColor: selectedExpediente?.id === exp.id ? 'var(--primary-color)' : '#eee'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '1rem' }}>{exp.nombreExpediente}</strong>
                          <span className="small text-muted">{exp.codigoTRD} | {exp.subserieId.nombreSubserie}</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                          background: exp.estado === 'ABIERTO' ? '#e6f4ea' : '#f1f3f4',
                          color: exp.estado === 'ABIERTO' ? '#1e8e3e' : '#5f6368'
                        }}>
                          {exp.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Detalle del Expediente y Foliación */}
          <section className="card" style={{ padding: '20px' }}>
            {selectedExpediente ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  <div>
                    <h2>{selectedExpediente.estado === 'ABIERTO' ? <MdFolderOpen color="#f1c40f" /> : <MdLock color="#95a5a6" />} {selectedExpediente.nombreExpediente}</h2>
                    <p className="small text-muted">Apertura: {new Date(selectedExpediente.fechaApertura).toLocaleDateString()} | Código: {selectedExpediente.codigoTRD}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedExpediente.estado === 'ABIERTO' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleCerrarExpediente(selectedExpediente.id)}>
                        Cerrar Expediente
                      </button>
                    )}
                    {selectedExpediente.estado === 'CERRADO' && selectedExpediente.indiceXml && (
                      <button className="btn btn-primary btn-sm" onClick={() => downloadXml(selectedExpediente.indiceXml!, selectedExpediente.nombreExpediente)}>
                        <MdDownload /> Índice XML
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h3>Foliación Electrónica</h3>
                  <div className="table-responsive" style={{ marginTop: '10px' }}>
                    {loadingDetails ? <p>Cargando folios...</p> : documentos.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <p className="text-muted">Este expediente no contiene documentos aún.</p>
                        <p className="small">Vincula documentos desde la vista de Proyección o Carga.</p>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Folio</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Radicado / Documento</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Integridad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentos.map((doc, index) => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                              <td style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <MdDescription color="#3498db" />
                                  <div>
                                    <div>{doc.numeroRadicado || 'NAT_000'}</div>
                                    <div className="small text-muted">{doc.plantillaId?.nombre}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px' }}>{new Date(doc.fechaGeneracion).toLocaleDateString()}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <span title={doc.hashIntegridad} style={{ color: '#27ae60', cursor: 'help' }}>
                                  <IconsMd.MdVerifiedUser />
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: '#ccc' }}>
                <MdSearch size={60} style={{ opacity: 0.3 }} />
                <p>Selecciona un expediente para ver su foliación y metadatos.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}
