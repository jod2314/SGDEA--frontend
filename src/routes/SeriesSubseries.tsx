import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { SerieDocumental, SubserieDocumental } from "../types/types";

const MdFolder = (IconsMd as any).MdFolder;
const MdSubtitles = (IconsMd as any).MdSubtitles;
const MdEdit = (IconsMd as any).MdEdit;
const MdDelete = (IconsMd as any).MdDelete;
const MdAdd = (IconsMd as any).MdAdd;
const MdCloudDownload = (IconsMd as any).MdCloudDownload;
const MdSearch = (IconsMd as any).MdSearch;

interface BanterItem {
  _id: string;
  nivel: 'SERIE' | 'SUBSERIE';
  codigo: string;
  nombre: string;
  definicion?: string;
  retencionGestion?: number;
  retencionCentral?: number;
  disposicionFinal?: string;
}

export default function SeriesSubseries() {
  const auth = useAuth();
  const [series, setSeries] = useState<SerieDocumental[]>([]);
  const [subseries, setSubseries] = useState<{ [serieId: string]: SubserieDocumental[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Banter Search state
  const [showBanterSearch, setShowBanterSearch] = useState(false);
  const [banterQuery, setBanterQuery] = useState("");
  const [banterResults, setBanterResults] = useState<BanterItem[]>([]);
  const [isSearchingBanter, setIsBanterLoading] = useState(false);

  // Serie Form state ... (rest of existing state)
  const [isEditingSerie, setIsEditingSerie] = useState(false);
  const [currentSerieId, setCurrentSerieId] = useState("");
  const [codigoSerie, setCodigoSerie] = useState("");
  const [nombreSerie, setNombreSerie] = useState("");
  const [gestion, setGestion] = useState(2);
  const [central, setCentral] = useState(8);
  const [disposicion, setDisposicion] = useState("Eliminación");

  // Subserie Form state
  const [showSubForm, setShowSubForm] = useState(false);
  const [targetSerieId, setTargetSerieId] = useState("");
  const [codigoSubserie, setCodigoSubserie] = useState("");
  const [nombreSubserie, setNombreSubserie] = useState("");
  const [subGestion, setSubGestion] = useState(2);
  const [subCentral, setSubCentral] = useState(8);
  const [subDisposicion, setSubDisposicion] = useState("Eliminación");

  useEffect(() => {
    fetchSeries();
  }, []);

  async function handleBanterSearch() {
    if (!banterQuery) return;
    setIsBanterLoading(true);
    try {
      const json = await auth.request<any>(`/archivistica/banter/buscar?q=${banterQuery}`);
      setBanterResults(json.body.sugerencias);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBanterLoading(false);
    }
  }

  async function handleImportItem(item: BanterItem) {
    try {
      const json = await auth.request<any>("/archivistica/banter/importar", {
        method: "POST",
        body: JSON.stringify({ 
          banterId: item._id, 
          incluirSubseries: item.nivel === 'SERIE' 
        })
      });
      alert(json.body.message);
      fetchSeries();
      setShowBanterSearch(false);
      setBanterQuery("");
      setBanterResults([]);
    } catch (err: any) {
      alert(err.message || "Error al importar");
    }
  }

  async function fetchSeries() {
    try {
      const json = await auth.request<any>("/archivistica/series");
      setSeries(json.body.series);
      json.body.series.forEach((s: SerieDocumental) => fetchSubseries(s.id));
    } catch (err) {
      setError("Error al cargar series");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubseries(serieId: string) {
    try {
      const json = await auth.request<any>(`/archivistica/series/${serieId}/subseries`);
      setSubseries(prev => ({ ...prev, [serieId]: json.body.subseries }));
    } catch (err) {
      console.error("Error cargando subseries de", serieId);
    }
  }

  async function handleSerieSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endpoint = isEditingSerie ? `/archivistica/series/${currentSerieId}` : "/archivistica/series";
    const method = isEditingSerie ? "PUT" : "POST";

    try {
      await auth.request<any>(endpoint, {
        method,
        body: JSON.stringify({
          codigoSerie,
          nombreSerie,
          tiempoRetencionGestion: gestion,
          tiempoRetencionCentral: central,
          disposicionFinal: disposicion
        }),
      });
      resetSerieForm();
      fetchSeries();
    } catch (err: any) {
      setError(err.message || "Error al guardar serie");
    }
  }

  async function handleSubserieSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await auth.request<any>("/archivistica/subseries", {
        method: "POST",
        body: JSON.stringify({
          serieId: targetSerieId,
          codigoSubserie,
          nombreSubserie,
          tiempoRetencionGestion: subGestion,
          tiempoRetencionCentral: subCentral,
          disposicionFinal: subDisposicion
        }),
      });
      setCodigoSubserie("");
      setNombreSubserie("");
      setSubGestion(2);
      setSubCentral(8);
      setSubDisposicion("Eliminación");
      setShowSubForm(false);
      fetchSubseries(targetSerieId);
    } catch (err: any) {
      alert(err.message || "Error al guardar subserie");
    }
  }

  async function handleDeleteSerie(id: string) {
    if (!confirm("¿Eliminar serie? Solo se puede si no tiene subseries.")) return;
    try {
      await auth.request<any>(`/archivistica/series/${id}`, { method: "DELETE" });
      fetchSeries();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteSubserie(id: string, serieId: string) {
    if (!confirm("¿Eliminar subserie?")) return;
    try {
      await auth.request<any>(`/archivistica/subseries/${id}`, { method: "DELETE" });
      fetchSubseries(serieId);
    } catch (err: any) {
      alert(err.message);
    }
  }

  function handleEditSerie(ser: SerieDocumental) {
    setIsEditingSerie(true);
    setCurrentSerieId(ser.id);
    setCodigoSerie(ser.codigoSerie);
    setNombreSerie(ser.nombreSerie);
    setGestion(ser.tiempoRetencionGestion || 2);
    setCentral(ser.tiempoRetencionCentral || 8);
    setDisposicion(ser.disposicionFinal || "Eliminación");
  }

  function resetSerieForm() {
    setIsEditingSerie(false);
    setCurrentSerieId("");
    setCodigoSerie("");
    setNombreSerie("");
    setGestion(2);
    setCentral(8);
    setDisposicion("Eliminación");
  }

  return (
    <PortalLayout>
      <div className="series-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>Series y Subseries Documentales</h1>
            <p className="text-muted">Define el catálogo de categorías para la retención documental.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setShowBanterSearch(!showBanterSearch)}>
              <MdSearch /> Buscar en BANTER
            </button>
          </div>
        </header>

        {showBanterSearch && (
          <section className="card banter-search-section" style={{ padding: '20px', marginBottom: '20px', border: '2px solid var(--primary-color)' }}>
            <h3>Buscador Catálogo BANTER (Archivo General de la Nación)</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input 
                type="text" 
                className="edit-input" 
                style={{ flex: 1 }} 
                placeholder="Busca por nombre (ej: ACTAS, CONTRATOS)..." 
                value={banterQuery}
                onChange={e => setBanterQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBanterSearch()}
              />
              <button className="btn btn-primary" onClick={handleBanterSearch} disabled={isSearchingBanter}>
                {isSearchingBanter ? '...' : 'Buscar'}
              </button>
            </div>

            <div className="banter-results" style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {banterResults.map(item => (
                <div key={item._id} className="banter-result-item" style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={`badge ${item.nivel.toLowerCase()}`} style={{ marginRight: '10px', fontSize: '0.7rem' }}>{item.nivel}</span>
                    <strong>{item.codigo} - {item.nombre}</strong>
                    <p className="small text-muted" style={{ margin: '5px 0 0 0' }}>{item.definicion?.substring(0, 100)}...</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleImportItem(item)}>
                    <MdCloudDownload /> Importar
                  </button>
                </div>
              ))}
              {banterResults.length === 0 && !isSearchingBanter && banterQuery && <p className="text-muted">No se encontraron resultados.</p>}
            </div>
          </section>
        )}

        {error && <div className="errorMessage">{error}</div>}

        <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          {/* Formulario Serie */}
          <section className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h2>{isEditingSerie ? "Editar Serie" : "Nueva Serie"}</h2>
            <form onSubmit={handleSerieSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label>Código</label>
                  <input type="text" value={codigoSerie} onChange={e => setCodigoSerie(e.target.value)} required className="edit-input" placeholder="01" />
                </div>
                <div>
                  <label>Nombre de Serie</label>
                  <input type="text" value={nombreSerie} onChange={e => setNombreSerie(e.target.value)} required className="edit-input" placeholder="ACTAS" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Retención Gestión (Años)</label>
                  <input type="number" value={gestion} onChange={e => setGestion(Number(e.target.value))} className="edit-input" />
                </div>
                <div>
                  <label>Retención Central (Años)</label>
                  <input type="number" value={central} onChange={e => setCentral(Number(e.target.value))} className="edit-input" />
                </div>
              </div>

              <div>
                <label>Disposición Final</label>
                <select value={disposicion} onChange={e => setDisposicion(e.target.value)} className="edit-input" style={{ width: '100%' }}>
                  <option value="Eliminación">Eliminación</option>
                  <option value="Conservación Total">Conservación Total</option>
                  <option value="Selección">Selección</option>
                  <option value="Medio Técnico">Medio Técnico</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isEditingSerie ? "Actualizar" : "Crear Serie"}
                </button>
                {isEditingSerie && <button type="button" className="btn btn-ghost" onClick={resetSerieForm}>Cancelar</button>}
              </div>
            </form>
          </section>

          {/* Listado de Series y Subseries */}
          <section className="card" style={{ padding: '20px' }}>
            <h2>Catálogo Documental Local (CCD)</h2>
            <div style={{ marginTop: '15px' }}>
              {loading ? <p>Cargando...</p> : series.length === 0 ? <p>No hay series registradas.</p> : (
                <div className="series-list">
                  {series.map(ser => (
                    <div key={ser.id} className="serie-item" style={{ marginBottom: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div className="serie-header" style={{ padding: '12px', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MdFolder color="var(--primary-color)" />
                          <strong>{ser.codigoSerie} - {ser.nombreSerie}</strong>
                          <span className="badge" style={{ fontSize: '0.7rem', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>
                            {ser.disposicionFinal} ({ser.tiempoRetencionGestion}+{ser.tiempoRetencionCentral})
                          </span>
                          {ser.origen === 'BANTER' && <span title="Origen: Catálogo Nacional" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}><MdCloudDownload /></span>}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button className="btn btn-icon" onClick={() => { setTargetSerieId(ser.id); setShowSubForm(true); }} title="Añadir Subserie"><MdAdd /></button>
                          <button className="btn btn-icon" onClick={() => handleEditSerie(ser)}><MdEdit /></button>
                          <button className="btn btn-icon btn-danger" onClick={() => handleDeleteSerie(ser.id)}><MdDelete /></button>
                        </div>
                      </div>
                      
                      <div className="subseries-list" style={{ padding: '10px 10px 10px 40px' }}>
                        {subseries[ser.id]?.map(sub => (
                          <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                              <MdSubtitles size={14} color="#666" />
                              <span>{sub.codigoSubserie} - {sub.nombreSubserie}</span>
                              <span className="small text-muted" style={{ fontSize: '0.75rem', background: '#f0f0f0', padding: '1px 5px', borderRadius: '3px' }}>
                                Val: {sub.tiempoRetencionGestion || 0}+{sub.tiempoRetencionCentral || 0} | {sub.disposicionFinal || 'E'}
                              </span>
                            </div>
                            <button className="btn btn-icon btn-danger" style={{ padding: '2px' }} onClick={() => handleDeleteSubserie(sub.id, ser.id)}><MdDelete size={14} /></button>
                          </div>
                        ))}
                        {subseries[ser.id]?.length === 0 && !showSubForm && <p style={{ fontSize: '0.8rem', color: '#999' }}>Sin subseries</p>}
                        
                        {showSubForm && targetSerieId === ser.id && (
                          <form onSubmit={handleSubserieSubmit} style={{ marginTop: '15px', padding: '15px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input type="text" value={codigoSubserie} onChange={e => setCodigoSubserie(e.target.value)} placeholder="Cód" required style={{ width: '60px' }} className="edit-input" />
                              <input type="text" value={nombreSubserie} onChange={e => setNombreSubserie(e.target.value)} placeholder="Nombre Subserie" required style={{ flex: 1 }} className="edit-input" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.75rem' }}>Ret. Gestión</label>
                                <input type="number" value={subGestion} onChange={e => setSubGestion(Number(e.target.value))} className="edit-input" style={{ width: '100%' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem' }}>Ret. Central</label>
                                <input type="number" value={subCentral} onChange={e => setSubCentral(Number(e.target.value))} className="edit-input" style={{ width: '100%' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem' }}>Disposición</label>
                                <select value={subDisposicion} onChange={e => setSubDisposicion(e.target.value)} className="edit-input" style={{ width: '100%', fontSize: '0.8rem' }}>
                                  <option value="Eliminación">Eliminación</option>
                                  <option value="Conservación Total">Conservación Total</option>
                                  <option value="Selección">Selección</option>
                                  <option value="Medio Técnico">Medio Técnico</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSubForm(false)}>Cancelar</button>
                              <button type="submit" className="btn btn-primary btn-sm">Guardar Subserie</button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <style>{`
        .badge { font-weight: bold; color: #555; padding: 2px 8px; border-radius: 4px; }
        .badge.serie { background: #d1ecf1; color: #0c5460; }
        .badge.subserie { background: #e2e3e5; color: #383d41; }
        .serie-item:hover { border-color: var(--primary-color) !important; }
        .banter-result-item:hover { background: #f0f7ff; cursor: pointer; }
      `}</style>
    </PortalLayout>
  );
}
