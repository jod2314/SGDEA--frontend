import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdAdd, MdDelete, MdSave, MdPrint, MdRule } from 'react-icons/md';
import RotuloCaja from '../components/RotuloCaja';

// Interfaz alineada con el nuevo Schema FUID
interface FUIDItem {
  _id?: string;
  numeroOrden?: number;
  codigo?: string;
  dependencia?: string; // ID de dependencia productora
  nombreSerie?: string;
  asunto: string; // Required
  fechaInicial?: string;
  fechaFinal?: string;
  unidadConservacion: 'Caja' | 'Carpeta' | 'Tomo' | 'Otro';
  numeroCaja?: string;
  numeroCarpeta?: string;
  numeroFolios?: number;
  soporte?: string;
  frecuenciaConsulta?: 'Alta' | 'Media' | 'Baja';
  notas?: string;
  valuation?: {
    estado: string;
    accionSugerida: string;
    fechaDisposicionFinal: string;
  };
}

const emptyItem: FUIDItem = {
  asunto: '',
  unidadConservacion: 'Carpeta',
  soporte: 'Papel',
  frecuenciaConsulta: 'Baja',
  numeroCaja: '',
  numeroCarpeta: '',
  numeroFolios: 0,
  dependencia: ''
};

export default function Inventario() {
  const [items, setItems] = useState<FUIDItem[]>([]);
  const [newItem, setNewItem] = useState<FUIDItem>(emptyItem);
  const [loading, setLoading] = useState(false);
  const [printingItem, setPrintingItem] = useState<any>(null);
  
  // Estados para Dependencias Dinámicas (Fondos Acumulados)
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [dependencias, setDependencias] = useState<any[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<string>(''); // Nombre del periodo detectado

  const auth = useAuth();

  // Cargar inventario existente y periodos históricos
  useEffect(() => {
    fetchInventario();
    fetchPeriodos();
  }, [auth]);

  // Efecto: Cuando cambia la fecha inicial, buscar el periodo y cargar sus dependencias
  useEffect(() => {
    if (newItem.fechaInicial && periodos.length > 0) {
        const fecha = new Date(newItem.fechaInicial);
        const periodoEncontrado = periodos.find(p => {
            const inicio = new Date(p.fechaInicio);
            const fin = new Date(p.fechaFin);
            return fecha >= inicio && fecha <= fin;
        });

        if (periodoEncontrado) {
            setPeriodoActivo(periodoEncontrado.nombre);
            fetchDependencias(periodoEncontrado._id);
        } else {
            setPeriodoActivo('Sin periodo histórico definido para esta fecha');
            setDependencias([]);
        }
    }
  }, [newItem.fechaInicial, periodos]);

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/inventario`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        setItems(json.body.data);
      }
    } catch (error) {
      console.error("Error cargando inventario", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodos = async () => {
      try {
          const res = await fetch(`${API_URL}/historico`, {
              headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
          });
          if(res.ok) {
              const json = await res.json();
              setPeriodos(json.body.data);
          }
      } catch (err) { console.error(err); }
  };

  const fetchDependencias = async (periodoId: string) => {
      try {
          const res = await fetch(`${API_URL}/estructura?periodoId=${periodoId}`, {
              headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
          });
          if(res.ok) {
              const json = await res.json();
              setDependencias(json.body.data);
          }
      } catch(err) { console.error(err); }
  };

  // --- Lógica de Valoración (Nuevo) ---
  const handleCheckValuation = async () => {
    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/valuation/report`, {
            headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
        });
        if(response.ok) {
            const json = await response.json();
            const report = json.body.data;
            
            // Mezclar el reporte con los items actuales
            // Asumimos que el orden o los IDs coinciden. Lo ideal es mapear por ID.
            const newItems = items.map(item => {
                const valResult = report.find((r:any) => r._id === item._id);
                if (valResult && valResult.calculable) {
                    return { ...item, valuation: valResult };
                }
                return item;
            });
            setItems(newItems);
            alert("Valoración completada. Revise la columna de acciones/estado.");
        } else {
            alert("No se pudo realizar la valoración. Asegúrese de tener una TRD activa.");
        }
    } catch(error) {
        console.error(error);
        alert("Error al consultar el motor de valoración");
    } finally {
        setLoading(false);
    }
  };

  // --- Lógica de Importación Masiva ---
  const handleImportClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/exportar/fuid`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "FUID_Oficial.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Error al exportar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al exportar");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/importar/inventario`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
            // No Content-Type header needed for FormData, browser sets it with boundary
          },
          body: formData,
        });

        const json = await response.json();
        if (response.ok) {
          alert(`Importación completada.\nInsertados: ${json.body.resumen.insertados}\nFallidos: ${json.body.resumen.fallidos}`);
          if (json.body.resumen.errores.length > 0) {
            console.warn("Errores de importación:", json.body.resumen.errores);
            alert("Revise la consola para ver los detalles de los errores.");
          }
          fetchInventario();
        } else {
          alert(`Error en importación: ${json.body.error}`);
        }
      } catch (error) {
        console.error(error);
        alert("Error de conexión al importar.");
      } finally {
        setLoading(false);
        // Limpiar input
        e.target.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.asunto) return alert("El asunto es obligatorio");
    
    setLoading(true);
    try {
      // Calcular número de orden automático si no se provee
      const itemToSend = { ...newItem, numeroOrden: items.length + 1 };

      const response = await fetch(`${API_URL}/inventario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(itemToSend),
      });

      const json = await response.json();

      if (response.ok) {
        setItems([...items, json.body.data]);
        setNewItem({ ...emptyItem, numeroCaja: newItem.numeroCaja, fechaInicial: newItem.fechaInicial, dependencia: newItem.dependencia }); // Mantener datos contextuales
      } else {
        alert(`Error: ${json.body.error}`);
      }
    } catch (error) {
      console.error("Error guardando", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar este registro?")) return;
    try {
      const response = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if(response.ok) {
        setItems(items.filter(i => i._id !== id));
      }
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <PortalLayout>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Inventario Documental (FUID)</h1>
        <div style={{display:'flex', gap:'10px'}}>
            <input type="file" id="fileInput" style={{display:'none'}} accept=".xlsx, .xls" onChange={handleFileChange} />
            <button className="btn btn-secondary" onClick={handleImportClick}>📂 Importar Excel</button>
            <button className="btn btn-warning" onClick={handleCheckValuation} title="Aplicar TVD/TRD para ver disposición final">
                <MdRule /> Valorar
            </button>
            <button className="btn btn-success" onClick={handleExport} style={{backgroundColor:'#137333', color:'white'}}>📊 Exportar FUID</button>
            <button className="btn btn-secondary" onClick={fetchInventario}>Refrescar</button>
        </div>
      </div>
      
            
      
            <p className="text-muted">
              Formato Único de Inventario Documental. Ingrese los expedientes fila por fila.
              {periodoActivo && <span style={{marginLeft: '15px', color: '#1a73e8', fontWeight:'bold'}}> Periodo Detectado: {periodoActivo}</span>}
            </p>
      
      
      
            {loading && <div style={{textAlign: 'center', padding: '10px', color: '#1a73e8'}}>Cargando datos...</div>}
      
      
      
            {/*Tabla Grid */}
      <div className='card' style={{padding: '0', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '1300px', fontSize: '14px'}}>
            <thead style={{backgroundColor: '#f8f9fa'}}>
                <tr>
                    <th style={thStyle}>No. Orden</th>
                    <th style={thStyle}>Fechas Extremas</th>
                    <th style={thStyle}>Dependencia</th>
                    <th style={thStyle}>Código</th>
                    <th style={thStyle}>Asunto / Descripción</th>
                    <th style={thStyle}>U. Conserv.</th>
                    <th style={thStyle}>No. Caja</th>
                    <th style={thStyle}>No. Carpeta</th>
                    <th style={thStyle}>Folios</th>
                    <th style={thStyle}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {/* Fila de Entrada (Formulario Integrado) */}
                <tr style={{backgroundColor: '#e8f0fe', borderBottom: '2px solid #1a73e8'}}>
                   <td style={tdStyle}>Auto</td>
                   <td style={tdStyle}>
                     <div style={{display:'flex', gap:'2px', flexDirection:'column'}}>
                       <input type="date" className="input-grid" name="fechaInicial" value={newItem.fechaInicial || ''} onChange={handleInputChange} title="Fecha Inicial" style={{fontSize:'11px'}} />
                       <input type="date" className="input-grid" name="fechaFinal" value={newItem.fechaFinal || ''} onChange={handleInputChange} title="Fecha Final" style={{fontSize:'11px'}} />
                     </div>
                   </td>
                   <td style={tdStyle}>
                       <select className="input-grid" name="dependencia" value={newItem.dependencia || ''} onChange={handleInputChange} disabled={!newItem.fechaInicial}>
                           <option value="">Seleccione...</option>
                           {dependencias.map(d => (
                               <option key={d._id} value={d._id}>{d.codigo} - {d.nombre}</option>
                           ))}
                       </select>
                   </td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="codigo" placeholder="Serie/Sub" value={newItem.codigo || ''} onChange={handleInputChange} />
                   </td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="asunto" placeholder="Descripción del expediente" value={newItem.asunto} onChange={handleInputChange} autoFocus />
                   </td>
                   
                   <td style={tdStyle}>
                     <select className="input-grid" name="unidadConservacion" value={newItem.unidadConservacion} onChange={handleInputChange}>
                       <option value="Carpeta">Carpeta</option>
                       <option value="Caja">Caja</option>
                       <option value="Tomo">Tomo</option>
                       <option value="Otro">Otro</option>
                     </select>
                   </td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="numeroCaja" placeholder="#" value={newItem.numeroCaja || ''} onChange={handleInputChange} style={{width: '50px'}} />
                   </td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="numeroCarpeta" placeholder="#" value={newItem.numeroCarpeta || ''} onChange={handleInputChange} style={{width: '50px'}} />
                   </td>
                   <td style={tdStyle}>
                     <input type="number" className="input-grid" name="numeroFolios" placeholder="0" value={newItem.numeroFolios || ''} onChange={handleInputChange} style={{width: '60px'}} />
                   </td>
                   <td style={tdStyle}>
                     <select className="input-grid" name="soporte" value={newItem.soporte} onChange={handleInputChange}>
                       <option value="Papel">Papel</option>
                       <option value="Electronico">Electrónico</option>
                       <option value="CD">CD/DVD</option>
                     </select>
                   </td>
                   <td style={tdStyle}>
                     <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{padding: '5px 10px'}}>
                       {loading ? '...' : <MdAdd />}
                     </button>
                   </td>
                </tr>

                {/* Filas de Datos */}
                {items.map((item, idx) => {
                    // Determinar estilo de fila según valoración
                    let rowStyle = {borderBottom: '1px solid #ddd', backgroundColor: 'transparent'};
                    if (item.valuation) {
                        if (item.valuation.estado === 'CUMPLIDO') {
                            rowStyle.backgroundColor = '#ffebee'; // Rojo claro para eliminar/disposición
                        } else if (item.valuation.estado === 'VIGENTE') {
                            rowStyle.backgroundColor = '#e8f5e9'; // Verde claro vigente
                        }
                    }

                    return (
                    <tr key={item._id || idx} style={rowStyle}>
                        <td style={tdStyle}>{item.numeroOrden || idx + 1}</td>
                        <td style={tdStyle}>
                          {item.fechaInicial ? new Date(item.fechaInicial).toLocaleDateString() : ''} <br/>
                          {item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString() : ''}
                        </td>
                        <td style={tdStyle}>
                           {/* Mostrar nombre de dependencia si está poblado (requeriría ajuste en backend .populate o búsqueda local) */}
                           {item.dependencia || '-'}
                        </td>
                        <td style={tdStyle}>
                            {item.codigo}
                            {item.valuation && (
                                <div style={{fontSize:'0.7em', color: item.valuation.estado === 'CUMPLIDO' ? 'red' : 'green'}}>
                                    {item.valuation.accionSugerida}
                                </div>
                            )}
                        </td>
                        <td style={tdStyle}>{item.asunto}</td>
                        
                        <td style={tdStyle}>{item.unidadConservacion}</td>
                        <td style={tdStyle}>{item.numeroCaja}</td>
                        <td style={tdStyle}>{item.numeroCarpeta}</td>
                        <td style={tdStyle}>{item.numeroFolios}</td>
                        <td style={tdStyle}>{item.soporte}</td>
                        <td style={tdStyle}>
                           <button onClick={() => setPrintingItem({
                               empresa: 'EMPRESA DEMO S.A.S',
                               unidadAdministrativa: 'Gestión Documental',
                               serie: item.nombreSerie || item.codigo || 'Sin Serie',
                               subserie: '',
                               asunto: item.asunto,
                               fechas: `${item.fechaInicial || ''} - ${item.fechaFinal || ''}`,
                               noCaja: item.numeroCaja || '0',
                               noCarpeta: item.numeroCarpeta || '0',
                               noFolios: item.numeroFolios || 0
                           })} style={{border:'none', background:'none', color:'#555', cursor:'pointer', marginRight:'5px'}} title="Imprimir Rótulo">
                             <MdPrint />
                           </button>
                           <button onClick={() => item._id && handleDelete(item._id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>
                             <MdDelete />
                           </button>
                        </td>
                    </tr>
                )})
            </tbody>
        </table>
        
        {items.length === 0 && <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>No hay registros en el inventario. Use la primera fila azul para agregar.</div>}
      </div>

      {printingItem && (
        <RotuloCaja 
            data={printingItem} 
            onClose={() => setPrintingItem(null)} 
        />
      )}

      <style>{`
        .input-grid {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 4px;
          font-size: 13px;
        }
        .input-grid:focus {
          border-color: #1a73e8;
          outline: none;
        }
      `}</style>

    </PortalLayout>
  );
}

const thStyle = { padding: '12px 8px', textAlign: 'left' as const, fontSize: '12px', fontWeight: 'bold', color: '#5f6368' };
const tdStyle = { padding: '8px', verticalAlign: 'middle' };