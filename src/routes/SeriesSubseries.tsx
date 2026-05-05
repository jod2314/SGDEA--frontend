import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { SerieDocumental, SubserieDocumental } from "../types/types";

const MdFolder = (IconsMd as any).MdFolder;
const MdSubtitles = (IconsMd as any).MdSubtitles;
const MdEdit = (IconsMd as any).MdEdit;
const MdDelete = (IconsMd as any).MdDelete;
const MdAdd = (IconsMd as any).MdAdd;
const MdCloudDownload = (IconsMd as any).MdCloudDownload;

export default function SeriesSubseries() {
  const auth = useAuth();
  const [series, setSeries] = useState<SerieDocumental[]>([]);
  const [subseries, setSubseries] = useState<{ [serieId: string]: SubserieDocumental[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Serie Form state
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

  useEffect(() => {
    fetchSeries();
  }, []);

  async function fetchSeries() {
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const response = await fetch(`${API_URL}/archivistica/series`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa.id,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setSeries(json.body.series);
        // Cargar subseries para cada serie
        json.body.series.forEach((s: SerieDocumental) => fetchSubseries(s.id));
      } else {
        setError("Error al cargar series");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubseries(serieId: string) {
    try {
      const response = await fetch(`${API_URL}/archivistica/series/${serieId}/subseries`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        setSubseries(prev => ({ ...prev, [serieId]: json.body.subseries }));
      }
    } catch (err) {
      console.error("Error cargando subseries de", serieId);
    }
  }

  async function handleSerieSubmit(e: React.FormEvent) {
    e.preventDefault();
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    const url = isEditingSerie 
      ? `${API_URL}/archivistica/series/${currentSerieId}`
      : `${API_URL}/archivistica/series`;
    
    const method = isEditingSerie ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa.id,
        },
        body: JSON.stringify({
          codigoSerie,
          nombreSerie,
          tiempoRetencionGestion: gestion,
          tiempoRetencionCentral: central,
          disposicionFinal: disposicion
        }),
      });

      if (response.ok) {
        resetSerieForm();
        fetchSeries();
      } else {
        const json = await response.json();
        setError(json.body.error || "Error al guardar serie");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  }

  async function handleSubserieSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/archivistica/subseries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          serieId: targetSerieId,
          codigoSubserie,
          nombreSubserie
        }),
      });

      if (response.ok) {
        setCodigoSubserie("");
        setNombreSubserie("");
        setShowSubForm(false);
        fetchSubseries(targetSerieId);
      } else {
        const json = await response.json();
        alert(json.body.error || "Error al guardar subserie");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  }

  async function handleDeleteSerie(id: string) {
    if (!confirm("¿Eliminar serie? Solo se puede si no tiene subseries.")) return;
    try {
      const response = await fetch(`${API_URL}/archivistica/series/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
      if (response.ok) fetchSeries();
      else {
        const json = await response.json();
        alert(json.body.error);
      }
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  async function handleDeleteSubserie(id: string, serieId: string) {
    if (!confirm("¿Eliminar subserie?")) return;
    try {
      const response = await fetch(`${API_URL}/archivistica/subseries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
      if (response.ok) fetchSubseries(serieId);
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  async function handleImportBanter() {
    if (!confirm("¿Deseas importar el catálogo estándar BANTER? Esto agregará series y subseries comunes.")) return;
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/importar-banter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) fetchSeries();
    } catch (err) {
      alert("Error al importar");
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
          <button className="btn btn-secondary" onClick={handleImportBanter}>
            <MdCloudDownload /> Importar BANTER
          </button>
        </header>

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
            <h2>Catálogo Documental</h2>
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
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button className="btn btn-icon" onClick={() => { setTargetSerieId(ser.id); setShowSubForm(true); }} title="Añadir Subserie"><MdAdd /></button>
                          <button className="btn btn-icon" onClick={() => handleEditSerie(ser)}><MdEdit /></button>
                          <button className="btn btn-icon btn-danger" onClick={() => handleDeleteSerie(ser.id)}><MdDelete /></button>
                        </div>
                      </div>
                      
                      <div className="subseries-list" style={{ padding: '10px 10px 10px 40px' }}>
                        {subseries[ser.id]?.map(sub => (
                          <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                              <MdSubtitles size={14} color="#666" />
                              <span>{sub.codigoSubserie} - {sub.nombreSubserie}</span>
                            </div>
                            <button className="btn btn-icon btn-danger" style={{ padding: '2px' }} onClick={() => handleDeleteSubserie(sub.id, ser.id)}><MdDelete size={14} /></button>
                          </div>
                        ))}
                        {subseries[ser.id]?.length === 0 && !showSubForm && <p style={{ fontSize: '0.8rem', color: '#999' }}>Sin subseries</p>}
                        
                        {showSubForm && targetSerieId === ser.id && (
                          <form onSubmit={handleSubserieSubmit} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <input type="text" value={codigoSubserie} onChange={e => setCodigoSubserie(e.target.value)} placeholder="Cód" required style={{ width: '60px' }} className="edit-input" />
                            <input type="text" value={nombreSubserie} onChange={e => setNombreSubserie(e.target.value)} placeholder="Nombre Subserie" required style={{ flex: 1 }} className="edit-input" />
                            <button type="submit" className="btn btn-primary">Guardar</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowSubForm(false)}>X</button>
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
        .badge { font-weight: bold; color: #555; }
        .serie-item:hover { border-color: var(--primary-color) !important; }
      `}</style>
    </PortalLayout>
  );
}
