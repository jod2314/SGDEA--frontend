import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Dependencia, SerieDocumental, SubserieDocumental, TRD } from "../types/types";

const MdAdd = (IconsMd as any).MdAdd;
const MdAssignment = (IconsMd as any).MdAssignment;
const MdDelete = (IconsMd as any).MdDelete;
const MdLightbulb = (IconsMd as any).MdLightbulb;


export default function ConfiguracionTRD() {
  const auth = useAuth();
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [series, setSeries] = useState<SerieDocumental[]>([]);
  const [subseries, setSubseries] = useState<SubserieDocumental[]>([]);
  const [trds, setTrds] = useState<TRD[]>([]);
  
  const [selectedDep, setSelectedDep] = useState("");
  const [selectedSerie, setSelectedSerie] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  // Sugeridor de TRD por Sector
  const [selectedSector, setSelectedSector] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [sugerenciasSeleccionadas, setSugerenciasSeleccionadas] = useState<Record<string, boolean>>({});
  const [importandoSugerencias, setImportandoSugerencias] = useState(false);
  const [mensajeImportacion, setMensajeImportacion] = useState("");

  const handleCargarSugerencias = async (sector: string) => {
    if (!sector) {
      setSugerencias([]);
      return;
    }
    setLoadingSugerencias(true);
    setMensajeImportacion("");
    try {
      const json = await auth.request<any>(`/archivistica/banter/sugerencias-sector?sector=${sector}`);
      const listado = json.body.sugerencias || [];
      setSugerencias(listado);
      
      // Auto-seleccionar todas las sugerencias por defecto
      const iniciales: Record<string, boolean> = {};
      listado.forEach((item: any) => {
        iniciales[item._id] = true;
      });
      setSugerenciasSeleccionadas(iniciales);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al cargar sugerencias");
    } finally {
      setLoadingSugerencias(false);
    }
  };

  const toggleSugerencia = (id: string) => {
    setSugerenciasSeleccionadas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImportarSugeridas = async () => {
    const idsAImportar = Object.keys(sugerenciasSeleccionadas).filter(id => sugerenciasSeleccionadas[id]);
    if (idsAImportar.length === 0) return;

    setImportandoSugerencias(true);
    setMensajeImportacion("");
    let importadasCount = 0;

    try {
      for (const id of idsAImportar) {
        await auth.request<any>("/archivistica/banter/importar", {
          method: "POST",
          body: JSON.stringify({
            banterId: id,
            incluirSubseries: true
          })
        });
        importadasCount++;
      }
      setMensajeImportacion(`¡Se importaron ${importadasCount} series con sus subseries exitosamente!`);
      setSugerencias([]);
      setSelectedSector("");
      fetchSeries();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al importar algunas sugerencias");
    } finally {
      setImportandoSugerencias(false);
    }
  };


  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchDependencias();
      fetchSeries();
      fetchTrds();
    }
  }, [auth.isAuthenticated]);

  async function fetchDependencias() {
    try {
      const json = await auth.request<any>("/archivistica/dependencias");
      setDependencias(json.body.dependencias);
    } catch (error) { console.log(error); }
  }

  async function fetchSeries() {
    try {
      const json = await auth.request<any>("/archivistica/series");
      setSeries(json.body.series);
    } catch (error) { console.log(error); }
  }

  async function fetchSubseries(serieId: string) {
    try {
      const json = await auth.request<any>(`/archivistica/series/${serieId}/subseries`);
      setSubseries(json.body.subseries);
    } catch (error) { console.log(error); }
  }

  async function fetchTrds() {
    try {
      const json = await auth.request<any>("/archivistica/trd");
      setTrds(json.body.trd);
    } catch (error) { console.log(error); }
  }

  async function handleAddTRD() {
    if (!selectedDep || !selectedSub) return;

    try {
      await auth.request<any>("/archivistica/trd", {
        method: "POST",
        body: JSON.stringify({
          dependenciaId: selectedDep,
          subserieId: selectedSub
        }),
      });

      fetchTrds();
      setSelectedDep("");
      setSelectedSerie("");
      setSelectedSub("");
      setSubseries([]);
    } catch (error: any) {
      alert(error.message || "Error al vincular");
    }
  }

  async function handleDeleteTRD(id: string) {
    if (!confirm("¿Deseas eliminar esta vinculación de la TRD?")) return;
    try {
      await auth.request<any>(`/archivistica/trd/${id}`, {
        method: "DELETE",
      });
      fetchTrds();
    } catch (error) { console.log(error); }
  }

  return (
    <PortalLayout>
      <div className="trd-config-container">
        <h1>Configuración Archivística (TRD)</h1>
        <p className="text-muted">Asigna series y subseries documentales a las dependencias de tu organización.</p>

        {/* Recomendador Inteligente BANTER por Sector */}
        <section className="card" style={{ padding: '20px', marginBottom: '25px', borderLeft: '4px solid var(--primary-color)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdLightbulb style={{ color: '#fbc02d' }} /> Constructor Asistido de TRD (Recomendador BANTER)
          </h2>
          <p className="text-muted small">
            Selecciona el sector económico de tu empresa para recibir recomendaciones automáticas de series y subseries según el Banco Terminológico Nacional (BANTER) y las transversales de ley.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '250px' }}>
              <label className="small" style={{ fontWeight: 'bold' }}>Sector Comercial / Industrial</label>
              <select 
                className="edit-input" 
                style={{ width: '100%', marginTop: '5px' }} 
                value={selectedSector} 
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  handleCargarSugerencias(e.target.value);
                }}
              >
                <option value="">Seleccione un sector...</option>
                <option value="SALUD">Salud y Servicios Médicos</option>
                <option value="EDUCACION">Educación y Academia</option>
                <option value="CONSTRUCCION">Construcción e Ingeniería</option>
                <option value="FINANCIERO">Financiero y Contable</option>
                <option value="TECNOLOGIA">Tecnología y Servicios Digitales</option>
              </select>
            </div>

            {loadingSugerencias && <span className="small text-muted" style={{ marginTop: '18px' }}>Buscando en catálogo BANTER...</span>}
            {mensajeImportacion && <span className="small text-success" style={{ marginTop: '18px', color: '#137333', fontWeight: 'bold' }}>{mensajeImportacion}</span>}
          </div>

          {sugerencias.length > 0 && (
            <div style={{ marginTop: '20px', backgroundColor: 'rgba(0,0,0,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 className="small" style={{ marginBottom: '10px' }}>Series recomendadas para el sector {selectedSector}:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                {sugerencias.map(s => (
                  <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={!!sugerenciasSeleccionadas[s._id]} 
                      onChange={() => toggleSugerencia(s._id)} 
                    />
                    <span><strong>{s.codigo}</strong> - {s.nombre} {s.transversal && <span style={{ fontSize: '0.75rem', backgroundColor: '#e8f0fe', padding: '2px 5px', borderRadius: '4px', color: '#1a73e8', marginLeft: '5px' }}>Transversal</span>}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleImportarSugeridas} 
                  disabled={importandoSugerencias || Object.values(sugerenciasSeleccionadas).filter(Boolean).length === 0}
                >
                  {importandoSugerencias ? "Importando a tu CCD..." : "Importar en Lote"}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="trd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginTop: '30px' }}>

          
          <section className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h2><MdAdd /> Nueva Asignación</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <label>1. Seleccionar Dependencia</label>
                <select className="edit-input" style={{ width: '100%' }} value={selectedDep} onChange={(e) => setSelectedDep(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {dependencias.map(d => (
                    <option key={d.id} value={d.id}>{d.codigoDependencia} - {d.nombreDependencia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>2. Seleccionar Serie</label>
                <select className="edit-input" style={{ width: '100%' }} value={selectedSerie} onChange={(e) => {
                  setSelectedSerie(e.target.value);
                  fetchSubseries(e.target.value);
                }}>
                  <option value="">Seleccione...</option>
                  {series.map(s => (
                    <option key={s.id} value={s.id}>{s.codigoSerie} - {s.nombreSerie}</option>
                  ))}
                </select>
              </div>

              {subseries.length > 0 && (
                <div>
                  <label>3. Seleccionar Subserie</label>
                  <select className="edit-input" style={{ width: '100%' }} value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
                    <option value="">Seleccione...</option>
                    {subseries.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.codigoSubserie} - {sub.nombreSubserie}</option>
                    ))}
                  </select>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleAddTRD} disabled={!selectedDep || !selectedSub}>
                Vincular a TRD
              </button>
            </div>
          </section>

          <section className="card" style={{ padding: '20px' }}>
            <h2><MdAssignment /> Tabla de Retención Vigente (Matriz TRD)</h2>
            <div className="trd-list" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: '#f8f9fa' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Código TRD</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Dependencia</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Serie / Subserie</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Gestión</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Central</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Disp.</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {trds.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No hay registros en la TRD</td></tr>
                  ) : trds.map(trd => {
                    const sub = trd.subserieId as any;
                    return (
                      <tr key={trd.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px' }}><strong>{trd.codigoTRD}</strong></td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: '500' }}>{(trd.dependenciaId as any).nombreDependencia}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ color: '#666' }}>{sub.serieId.nombreSerie}</div>
                          <div style={{ fontWeight: 'bold' }}>{sub.nombreSubserie}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px' }}>{sub.tiempoRetencionGestion || 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px' }}>{sub.tiempoRetencionCentral || 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px' }}>
                          <span title={sub.disposicionFinal} style={{ cursor: 'help', borderBottom: '1px dotted' }}>
                            {sub.disposicionFinal?.charAt(0) || 'E'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button className="btn btn-icon btn-danger" onClick={() => handleDeleteTRD(trd.id)}>
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </PortalLayout>
  );
}
