import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdSave, MdAdd, MdDelete, MdContentCopy } from 'react-icons/md';

// Interfaces
interface Periodo {
  _id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface Dependencia {
  _id: string;
  nombre: string;
  codigo: string;
}

interface ItemTvd {
  _id?: string; // virtual/temp
  dependencia?: string; // ID dependencia
  serie: string; 
  subserie?: string;
  
  // Valores
  valorAdministrativo: number;
  valorLegal: number;
  valorFiscal: number;
  valorContable: number;
  valorTecnico: number;
  valorHistorico: number;

  // Tiempos
  retencionArchivoGestion: number;
  retencionArchivoCentral: number;

  // Disposición
  disposicionFinal: 'CT' | 'E' | 'M' | 'S';
  observaciones?: string;
}

export default function Tvd() {
  // Maestros
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  
  // Selecciones
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedDependencia, setSelectedDependencia] = useState<string>('');

  // Data
  const [allItemsTvd, setAllItemsTvd] = useState<ItemTvd[]>([]); // Todos los items del backend
  const [filteredItems, setFilteredItems] = useState<ItemTvd[]>([]); // Items visibles para la dep seleccionada

  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  // 1. Cargar Periodos y TVD completa al inicio
  useEffect(() => {
    loadInitialData();
  }, [auth]);

  // 2. Cargar Dependencias cuando cambia el Periodo
  useEffect(() => {
    if (selectedPeriodo) {
        fetchDependencias(selectedPeriodo);
    } else {
        setDependencias([]);
        setSelectedDependencia('');
    }
  }, [selectedPeriodo]);

  // 3. Filtrar Items cuando cambia Dependencia o TVD global
  useEffect(() => {
    if (selectedDependencia) {
        const filtered = allItemsTvd.filter(item => item.dependencia === selectedDependencia);
        setFilteredItems(filtered);
    } else {
        setFilteredItems([]);
    }
  }, [selectedDependencia, allItemsTvd]);

  async function loadInitialData() {
    setLoading(true);
    try {
      // Periodos
      const resPeriodos = await fetch(`${API_URL}/historico`, { headers: { Authorization: `Bearer ${auth.getAccessToken()}` } });
      if(resPeriodos.ok) setPeriodos((await resPeriodos.json()).body.data);

      // TVD Existente
      const resTvd = await fetch(`${API_URL}/tvd`, { headers: { Authorization: `Bearer ${auth.getAccessToken()}` } });
      if(resTvd.ok) {
          const json = await resTvd.json();
          setAllItemsTvd(json.body.data.items || []);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  }

  async function fetchDependencias(periodoId: string) {
      try {
        const res = await fetch(`${API_URL}/estructura?periodoId=${periodoId}`, { headers: { Authorization: `Bearer ${auth.getAccessToken()}` } });
        if(res.ok) setDependencias((await res.json()).body.data);
      } catch(err) { console.error(err); }
  }

  // --- Importar del Inventario ---
  const handleImportFromInventory = async () => {
    if(!selectedDependencia) return alert("Seleccione una dependencia primero.");
    
    setLoading(true);
    try {
        // Traer todo el inventario (idealmente filtrar por dependencia en backend, pero filtramos aquí por ahora)
        const res = await fetch(`${API_URL}/inventario`, { headers: { Authorization: `Bearer ${auth.getAccessToken()}` } });
        if(res.ok) {
            const data = (await res.json()).body.data;
            // Filtrar items de esta dependencia
            const itemsOfDep = data.filter((i: any) => i.dependencia === selectedDependencia);
            
            // Extraer series únicas (campo 'codigo' o 'nombreSerie' si existiera)
            // Asumimos que 'codigo' es la Serie y 'asunto' puede ser pista de subserie
            const uniqueSeries = new Set();
            const newItems: ItemTvd[] = [];

            itemsOfDep.forEach((invItem: any) => {
                const key = invItem.codigo || invItem.asunto; // Usar codigo como identificador de serie
                if(!uniqueSeries.has(key)) {
                    uniqueSeries.add(key);
                    // Verificar si ya existe en TVD para no duplicar
                    const exists = allItemsTvd.some(t => t.dependencia === selectedDependencia && t.serie === key);
                    if(!exists) {
                        newItems.push({
                            dependencia: selectedDependencia,
                            serie: key,
                            subserie: invItem.asunto, // Sugerencia inicial
                            valorAdministrativo: 1, valorLegal: 0, valorFiscal: 0, valorContable: 0, valorTecnico: 0, valorHistorico: 0,
                            retencionArchivoGestion: 1, retencionArchivoCentral: 9,
                            disposicionFinal: 'S'
                        });
                    }
                }
            });

            if(newItems.length > 0) {
                setAllItemsTvd([...allItemsTvd, ...newItems]);
                alert(`Se importaron ${newItems.length} series sugeridas del inventario.`);
            } else {
                alert("No se encontraron nuevas series para importar de esta dependencia.");
            }
        }
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  // --- CRUD Local ---
  const handleAddItem = () => {
      if(!selectedDependencia) return alert("Seleccione una dependencia.");
      const newItem: ItemTvd = {
          dependencia: selectedDependencia,
          serie: '',
          valorAdministrativo: 1, valorLegal: 0, valorFiscal: 0, valorContable: 0, valorTecnico: 0, valorHistorico: 0,
          retencionArchivoGestion: 0, retencionArchivoCentral: 0,
          disposicionFinal: 'E'
      };
      setAllItemsTvd([...allItemsTvd, newItem]);
  };

  const handleRemoveItem = (indexInFiltered: number) => {
      // Necesitamos encontrar el index real en allItemsTvd
      const itemToRemove = filteredItems[indexInFiltered];
      setAllItemsTvd(allItemsTvd.filter(i => i !== itemToRemove));
  };

  const handleChange = (indexInFiltered: number, field: keyof ItemTvd, value: any) => {
      const itemToUpdate = filteredItems[indexInFiltered];
      const updatedItems = allItemsTvd.map(i => {
          if(i === itemToUpdate) return { ...i, [field]: value };
          return i;
      });
      setAllItemsTvd(updatedItems);
  };
  
  const handleCheckbox = (indexInFiltered: number, field: keyof ItemTvd) => {
    const itemToUpdate = filteredItems[indexInFiltered];
    const updatedItems = allItemsTvd.map(i => {
        if(i === itemToUpdate) return { ...i, [field]: (i as any)[field] === 1 ? 0 : 1 };
        return i;
    });
    setAllItemsTvd(updatedItems);
  };

  // --- Guardar en Backend ---
  const handleSave = async () => {
      setLoading(true);
      try {
          // Enviamos TODA la TVD (reemplazo completo por ahora, idealmente sería patch inteligente)
          await fetch(`${API_URL}/tvd`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.getAccessToken()}`,
            },
            body: JSON.stringify({ items: allItemsTvd }),
          });
          alert("TVD Guardada Correctamente");
      } catch(err) {
          alert("Error al guardar");
          console.error(err);
      } finally { setLoading(false); }
  };

  return (
    <PortalLayout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <div>
            <h1>Editor de Valoración (TVD)</h1>
            <p className="text-muted">Gestión de Tablas de Valoración por Periodo y Estructura Orgánica</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{height:'40px'}}>
            <MdSave/> Guardar Cambios
        </button>
      </div>

      {/* Selectores */}
      <div style={{display:'flex', gap:'20px', backgroundColor:'#f8f9fa', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
          <div style={{flex: 1}}>
              <label style={{display:'block', fontSize:'12px', fontWeight:'bold', color:'#666'}}>1. Periodo Histórico</label>
              <select className="form-control" value={selectedPeriodo} onChange={e => setSelectedPeriodo(e.target.value)} style={{width:'100%'}}>
                  <option value="">Seleccione Periodo...</option>
                  {periodos.map(p => <option key={p._id} value={p._id}>{p.nombre} ({new Date(p.fechaInicio).getFullYear()}-{new Date(p.fechaFin).getFullYear()})</option>)}
              </select>
          </div>
          <div style={{flex: 1}}>
              <label style={{display:'block', fontSize:'12px', fontWeight:'bold', color:'#666'}}>2. Dependencia / Oficina</label>
              <select className="form-control" value={selectedDependencia} onChange={e => setSelectedDependencia(e.target.value)} disabled={!selectedPeriodo} style={{width:'100%'}}>
                  <option value="">Seleccione Dependencia...</option>
                  {dependencias.map(d => <option key={d._id} value={d._id}>{d.codigo} - {d.nombre}</option>)}
              </select>
          </div>
          <div style={{display:'flex', alignItems:'end'}}>
             <button className="btn btn-secondary" onClick={handleImportFromInventory} disabled={!selectedDependencia} title="Traer series del inventario automáticamente">
                 <MdContentCopy/> Traer del Inventario
             </button>
          </div>
      </div>

      {/* Tabla Editora */}
      {selectedDependencia ? (
          <div className='card' style={{padding: '0', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
                <thead style={{backgroundColor: '#e8f0fe', borderBottom: '2px solid #1a73e8'}}>
                    <tr>
                        <th style={thStyle}>Código / Serie</th>
                        <th style={thStyle}>Nombre / Subserie</th>
                        <th style={{...thStyle, textAlign:'center'}}>Valores (A-L-F-C-H)</th>
                        <th style={{...thStyle, textAlign:'center'}}>Retención (AG / AC)</th>
                        <th style={thStyle}>Disposición</th>
                        <th style={thStyle}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length === 0 && (
                        <tr><td colSpan={6} style={{padding:'20px', textAlign:'center', color:'#888'}}>No hay series valoradas para esta dependencia. Importe del inventario o agregue manualmente.</td></tr>
                    )}
                    {filteredItems.map((item, idx) => (
                        <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                            <td style={tdStyle}>
                                <input value={item.serie} onChange={e => handleChange(idx, 'serie', e.target.value)} className="input-grid" placeholder="Código" />
                            </td>
                            <td style={tdStyle}>
                                <input value={item.subserie || ''} onChange={e => handleChange(idx, 'subserie', e.target.value)} className="input-grid" placeholder="Descripción" />
                            </td>
                            <td style={{...tdStyle, textAlign:'center'}}>
                                <div style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                                    <span title="Administrativo"><input type="checkbox" checked={item.valorAdministrativo===1} onChange={() => handleCheckbox(idx, 'valorAdministrativo')}/> A</span>
                                    <span title="Legal"><input type="checkbox" checked={item.valorLegal===1} onChange={() => handleCheckbox(idx, 'valorLegal')}/> L</span>
                                    <span title="Fiscal"><input type="checkbox" checked={item.valorFiscal===1} onChange={() => handleCheckbox(idx, 'valorFiscal')}/> F</span>
                                    <span title="Contable"><input type="checkbox" checked={item.valorContable===1} onChange={() => handleCheckbox(idx, 'valorContable')}/> C</span>
                                    <span title="Histórico"><input type="checkbox" checked={item.valorHistorico===1} onChange={() => handleCheckbox(idx, 'valorHistorico')}/> H</span>
                                </div>
                            </td>
                            <td style={{...tdStyle, textAlign:'center'}}>
                                <input type="number" value={item.retencionArchivoGestion} onChange={e => handleChange(idx, 'retencionArchivoGestion', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                                {' / '}
                                <input type="number" value={item.retencionArchivoCentral} onChange={e => handleChange(idx, 'retencionArchivoCentral', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                            </td>
                            <td style={tdStyle}>
                                <select value={item.disposicionFinal} onChange={e => handleChange(idx, 'disposicionFinal', e.target.value)} style={{border:'none', background:'transparent', fontWeight:'bold'}}>
                                    <option value="CT">Conservación Total</option>
                                    <option value="E">Eliminación</option>
                                    <option value="M">Digitalización</option>
                                    <option value="S">Selección</option>
                                </select>
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => handleRemoveItem(idx)} style={{color:'red', border:'none', background:'transparent', cursor:'pointer'}}><MdDelete/></button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={6} style={{padding:'10px'}}>
                            <button onClick={handleAddItem} className="btn-link" style={{color:'#1a73e8', textDecoration:'none', fontWeight:'bold'}}>
                                <MdAdd/> Agregar Fila
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
      ) : (
          <div style={{textAlign:'center', padding:'40px', color:'#999', border:'2px dashed #ccc', borderRadius:'10px'}}>
              Seleccione un Periodo y una Dependencia para comenzar a valorar.
          </div>
      )}

      <style>{`
        .input-grid { width: 100%; border: 1px solid transparent; padding: 4px; border-radius: 3px; }
        .input-grid:focus { border-color: #1a73e8; outline: none; background: #fff; }
        .input-grid:hover { border-color: #eee; background: #fdfdfd; }
      `}</style>
    </PortalLayout>
  );
}

const thStyle = { padding: '12px 8px', textAlign: 'left' as const, fontSize: '12px', fontWeight: 'bold', color: '#5f6368' };
const tdStyle = { padding: '8px', verticalAlign: 'middle' };
