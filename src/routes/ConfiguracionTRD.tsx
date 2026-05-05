import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Dependencia, SerieDocumental, SubserieDocumental, TRD } from "../types/types";

const MdAdd = (IconsMd as any).MdAdd;
const MdAssignment = (IconsMd as any).MdAssignment;

export default function ConfiguracionTRD() {
  const auth = useAuth();
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [series, setSeries] = useState<SerieDocumental[]>([]);
  const [subseries, setSubseries] = useState<SubserieDocumental[]>([]);
  const [trds, setTrds] = useState<TRD[]>([]);
  
  const [selectedDep, setSelectedDep] = useState("");
  const [selectedSerie, setSelectedSerie] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchDependencias();
      fetchSeries();
      fetchTrds();
    }
  }, [auth.isAuthenticated]);

  async function fetchDependencias() {
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/dependencias`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setDependencias(json.body.dependencias);
      }
    } catch (error) { console.log(error); }
  }

  async function fetchSeries() {
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/series`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setSeries(json.body.series);
      }
    } catch (error) { console.log(error); }
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
        setSubseries(json.body.subseries);
      }
    } catch (error) { console.log(error); }
  }

  async function fetchTrds() {
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/trd`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setTrds(json.body.trd);
      }
    } catch (error) { console.log(error); }
  }

  async function handleAddTRD() {
    if (!selectedDep || !selectedSub) return;
    const empresa = auth.getSelectedEmpresa();

    try {
      const response = await fetch(`${API_URL}/archivistica/trd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
        body: JSON.stringify({
          dependenciaId: selectedDep,
          subserieId: selectedSub
        }),
      });

      if (response.ok) {
        fetchTrds();
        setSelectedDep("");
        setSelectedSerie("");
        setSelectedSub("");
        setSubseries([]);
      } else {
        const json = await response.json();
        alert(json.body.error || "Error al vincular");
      }
    } catch (error) { console.log(error); }
  }

  async function handleDeleteTRD(id: string) {
    if (!confirm("¿Deseas eliminar esta vinculación de la TRD?")) return;
    try {
      const response = await fetch(`${API_URL}/archivistica/trd/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
      if (response.ok) fetchTrds();
    } catch (error) { console.log(error); }
  }

  return (
    <PortalLayout>
      <div className="trd-config-container">
        <h1>Configuración Archivística (TRD)</h1>
        <p className="text-muted">Asigna series y subseries documentales a las dependencias de tu organización.</p>

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
            <h2><MdAssignment /> Tabla de Retención Vigente</h2>
            <div className="trd-list" style={{ marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Código TRD</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Dependencia</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Serie / Subserie</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {trds.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No hay registros en la TRD</td></tr>
                  ) : trds.map(trd => (
                    <tr key={trd.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px' }}><strong>{trd.codigoTRD}</strong></td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: '0.9rem' }}>{(trd.dependenciaId as any).nombreDependencia}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Cód: {(trd.dependenciaId as any).codigoDependencia}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: '0.9rem' }}>{(trd.subserieId as any).serieId.nombreSerie}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{(trd.subserieId as any).nombreSubserie}</div>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button className="btn btn-icon btn-danger" onClick={() => handleDeleteTRD(trd.id)}>
                          <IconsMd.MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </PortalLayout>
  );
}
