import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdAdd, MdDelete, MdSave } from 'react-icons/md';

// Interfaz alineada con el nuevo Schema FUID
interface FUIDItem {
  _id?: string;
  numeroOrden?: number;
  codigo?: string;
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
}

const emptyItem: FUIDItem = {
  asunto: '',
  unidadConservacion: 'Carpeta',
  soporte: 'Papel',
  frecuenciaConsulta: 'Baja',
  numeroCaja: '',
  numeroCarpeta: '',
  numeroFolios: 0
};

export default function Inventario() {
  const [items, setItems] = useState<FUIDItem[]>([]);
  const [newItem, setNewItem] = useState<FUIDItem>(emptyItem);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  // Cargar inventario existente
  useEffect(() => {
    fetchInventario();
  }, [auth]);

  const fetchInventario = async () => {
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
        setNewItem({ ...emptyItem, numeroCaja: newItem.numeroCaja }); // Mantener el número de caja para agilizar ingreso
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
        <button className="btn btn-secondary" onClick={fetchInventario}>Refrescar</button>
      </div>
      
      <p className="text-muted">
        Formato Único de Inventario Documental. Ingrese los expedientes fila por fila.
      </p>

      {/* Tabla Grid */}
      <div className='card' style={{padding: '0', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '1200px', fontSize: '14px'}}>
            <thead style={{backgroundColor: '#f8f9fa'}}>
                <tr>
                    <th style={thStyle}>No. Orden</th>
                    <th style={thStyle}>Código</th>
                    <th style={thStyle}>Asunto / Descripción</th>
                    <th style={thStyle}>Fechas Extremas</th>
                    <th style={thStyle}>U. Conserv.</th>
                    <th style={thStyle}>No. Caja</th>
                    <th style={thStyle}>No. Carpeta</th>
                    <th style={thStyle}>Folios</th>
                    <th style={thStyle}>Soporte</th>
                    <th style={thStyle}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {/* Fila de Entrada (Formulario Integrado) */}
                <tr style={{backgroundColor: '#e8f0fe', borderBottom: '2px solid #1a73e8'}}>
                   <td style={tdStyle}>Auto</td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="codigo" placeholder="Serie/Sub" value={newItem.codigo || ''} onChange={handleInputChange} />
                   </td>
                   <td style={tdStyle}>
                     <input className="input-grid" name="asunto" placeholder="Descripción del expediente" value={newItem.asunto} onChange={handleInputChange} autoFocus />
                   </td>
                   <td style={tdStyle}>
                     <div style={{display:'flex', gap:'2px'}}>
                       <input type="date" className="input-grid" name="fechaInicial" value={newItem.fechaInicial || ''} onChange={handleInputChange} title="Fecha Inicial" />
                       <input type="date" className="input-grid" name="fechaFinal" value={newItem.fechaFinal || ''} onChange={handleInputChange} title="Fecha Final" />
                     </div>
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
                {items.map((item, idx) => (
                    <tr key={item._id || idx} style={{borderBottom: '1px solid #ddd'}}>
                        <td style={tdStyle}>{item.numeroOrden || idx + 1}</td>
                        <td style={tdStyle}>{item.codigo}</td>
                        <td style={tdStyle}>{item.asunto}</td>
                        <td style={tdStyle}>
                          {item.fechaInicial ? new Date(item.fechaInicial).toLocaleDateString() : ''} - 
                          {item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString() : ''}
                        </td>
                        <td style={tdStyle}>{item.unidadConservacion}</td>
                        <td style={tdStyle}>{item.numeroCaja}</td>
                        <td style={tdStyle}>{item.numeroCarpeta}</td>
                        <td style={tdStyle}>{item.numeroFolios}</td>
                        <td style={tdStyle}>{item.soporte}</td>
                        <td style={tdStyle}>
                           <button onClick={() => item._id && handleDelete(item._id)} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>
                             <MdDelete />
                           </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {items.length === 0 && <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>No hay registros en el inventario. Use la primera fila azul para agregar.</div>}
      </div>

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