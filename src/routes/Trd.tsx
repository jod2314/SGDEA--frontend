import { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdAdd, MdDelete, MdSave } from 'react-icons/md';

// Interfaz para un item de la TRD, alineado con el Schema
interface TrdItem {
  _id?: string;
  codigoSerie: string;
  nombreSerie: string;
  codigoSubserie?: string;
  nombreSubserie?: string;
  retencionArchivoGestion: number;
  retencionArchivoCentral: number;
  disposicionFinal: 'CT' | 'E' | 'M' | 'S';
  procedimiento?: string;
  observaciones?: string;
}

// Interfaz para la TRD completa
interface TrdData {
  _id?: string;
  nombre: string;
  items: TrdItem[];
  version?: number;
  activa?: boolean;
}

const emptyItem: TrdItem = {
    codigoSerie: '',
    nombreSerie: '',
    retencionArchivoGestion: 0,
    retencionArchivoCentral: 0,
    disposicionFinal: 'CT',
};

export default function Trd() {
  const [trd, setTrd] = useState<TrdData | null>(null);
  const [nombreTrd, setNombreTrd] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    fetchTrd();
  }, [auth]);

  const fetchTrd = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/trd`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.body.data) {
          setTrd(json.body.data);
          setNombreTrd(json.body.data.nombre);
        } else {
            // Si no hay TRD activa, inicializamos una vacía
            setTrd({ nombre: 'Nueva TRD', items: [] });
            setNombreTrd('Nueva TRD');
        }
      }
    } catch (error) {
      console.error("Error cargando TRD", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof TrdItem, value: any) => {
    if (!trd) return;
    const newItems = [...trd.items];
    (newItems[index] as any)[field] = value;
    setTrd({ ...trd, items: newItems });
  };

  const handleSaveTrd = async () => {
    if (!trd || !trd.nombre) return alert("El nombre de la TRD es obligatorio.");
    if (trd.items.some(item => !item.codigoSerie || !item.nombreSerie)) {
        return alert("Código y nombre de serie son obligatorios para todos los ítems.");
    }

    setLoading(true);
    try {
      const method = trd._id ? 'PATCH' : 'POST';
      const url = `${API_URL}/trd`; // POST y PATCH usan la misma URL para la TRD activa

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ nombre: trd.nombre, items: trd.items }),
      });

      if (response.ok) {
        const json = await response.json();
        setTrd(json.body.data);
        setNombreTrd(json.body.data.nombre);
        alert('TRD Guardada Exitosamente!');
      } else {
        const err = await response.json();
        alert(`Error al guardar TRD: ${err.body.error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Ocurrió un error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    if (!trd) {
        setTrd({ nombre: nombreTrd || 'Nueva TRD', items: [emptyItem] });
    } else {
        setTrd({ ...trd, items: [...trd.items, emptyItem] });
    }
  };

  const removeRow = (index: number) => {
    if(!trd) return;
    if(confirm('¿Eliminar esta serie de la TRD?')) {
        setTrd({ ...trd, items: trd.items.filter((_, i) => i !== index) });
    }
  };

  if (!trd && loading) return <PortalLayout>Cargando TRD...</PortalLayout>;

  return (
    <PortalLayout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Tabla de Retención Documental (TRD)</h1>
          <button onClick={handleSaveTrd} className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar TRD'}
          </button>
      </div>
      
      <p className="text-muted">
        Defina los tiempos de retención y disposición final para las series documentales producidas por la entidad.
      </p>

      <div style={{marginBottom: '20px'}}>
        <label htmlFor="trdName" style={{fontWeight: 'bold', marginRight: '10px'}}>Nombre de la TRD:</label>
        <input 
          id="trdName"
          type="text" 
          value={nombreTrd} 
          onChange={(e) => {
            setNombreTrd(e.target.value);
            if(trd) setTrd({...trd, nombre: e.target.value});
          }} 
          placeholder="Ej: TRD General de la Empresa XYZ" 
          style={{width: '300px', padding: '8px'}}
        />
        {trd?._id && <span style={{marginLeft: '10px', fontSize: '0.9em', color: '#555'}}>Versión: {trd.version}</span>}
      </div>

      <div className='card' style={{padding: '0', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '1500px', fontSize: '13px'}}>
            <thead style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                <tr>
                    <th colSpan={2} style={thStyle}>Serie</th>
                    <th colSpan={2} style={thStyle}>Subserie</th>
                    <th colSpan={2} style={{...thStyle, textAlign: 'center', borderRight:'1px solid #ddd'}}>Retención (Años)</th>
                    <th colSpan={1} style={{...thStyle, textAlign: 'center'}}>Disposición Final</th>
                    <th rowSpan={2} style={thStyle}>Procedimiento</th>
                    <th rowSpan={2} style={thStyle}>Observaciones</th>
                    <th rowSpan={2} style={thStyle}>Acciones</th>
                </tr>
                <tr>
                    <th style={subThStyle}>Código</th>
                    <th style={{...subThStyle, borderRight:'1px solid #ddd'}}>Nombre</th>
                    <th style={subThStyle}>Código</th>
                    <th style={{...subThStyle, borderRight:'1px solid #ddd'}}>Nombre</th>
                    <th style={subThStyle}>AG</th>
                    <th style={{...subThStyle, borderRight:'1px solid #ddd'}}>AC</th>
                    <th style={subThStyle}>DF</th>
                </tr>
            </thead>
            <tbody>
                {trd && trd.items.map((item, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                        <td style={tdStyle}>
                            <input 
                                value={item.codigoSerie} 
                                onChange={(e) => handleItemChange(index, 'codigoSerie', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={tdStyle}>
                            <input 
                                value={item.nombreSerie} 
                                onChange={(e) => handleItemChange(index, 'nombreSerie', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={tdStyle}>
                            <input 
                                value={item.codigoSubserie || ''} 
                                onChange={(e) => handleItemChange(index, 'codigoSubserie', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={tdStyle}>
                            <input 
                                value={item.nombreSubserie || ''} 
                                onChange={(e) => handleItemChange(index, 'nombreSubserie', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={centerTdStyle}>
                            <input type="number" value={item.retencionArchivoGestion} onChange={(e) => handleItemChange(index, 'retencionArchivoGestion', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                        </td>
                        <td style={centerTdStyle}>
                            <input type="number" value={item.retencionArchivoCentral} onChange={(e) => handleItemChange(index, 'retencionArchivoCentral', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                        </td>
                        <td style={centerTdStyle}>
                            <select value={item.disposicionFinal} onChange={(e) => handleItemChange(index, 'disposicionFinal', e.target.value)} style={{border:'none', background:'transparent'}}>
                                <option value="CT">CT</option>
                                <option value="E">E</option>
                                <option value="M">M</option>
                                <option value="S">S</option>
                            </select>
                        </td>
                        <td style={tdStyle}>
                             <input 
                                value={item.procedimiento || ''} 
                                onChange={(e) => handleItemChange(index, 'procedimiento', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={tdStyle}>
                             <input 
                                value={item.observaciones || ''} 
                                onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        <td style={centerTdStyle}>
                            <button onClick={() => removeRow(index)} className="btn-icon" style={{color:'red'}}><MdDelete /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div style={{padding:'10px'}}>
            <button onClick={addNewRow} className="btn btn-secondary"><MdAdd /> Agregar Serie/Subserie</button>
        </div>
      </div>
      
      <div style={{marginTop: '20px', fontSize: '12px', color: '#666'}}>
          <strong>Convenciones Disposición Final:</strong> CT: Conservación Total, E: Eliminación, M: Microfilmación/Digitalización, S: Selección.
          <br/>
          <strong>Retención:</strong> AG: Archivo de Gestión, AC: Archivo Central.
      </div>
    </PortalLayout>
  );
}

const thStyle = { padding: '10px', textAlign: 'left' as const, fontWeight: 'bold', color: '#444' };
const subThStyle = { padding: '8px', fontSize: '11px', fontWeight: 'bold' };
const tdStyle = { padding: '8px', verticalAlign: 'middle' };
const centerTdStyle = { padding: '8px', textAlign: 'center' as const, verticalAlign: 'middle' };
