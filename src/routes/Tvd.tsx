import { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';

// Interfaces alineadas
interface InventarioItem {
  _id: string;
  codigo?: string;
  asunto: string;
}

interface ItemTvd {
  serie: string; // Codigo o Nombre
  subserie?: string; // Asunto
  
  // Valoración Primaria (0=No, 1=Si)
  valorAdministrativo: number;
  valorLegal: number;
  valorFiscal: number;
  valorContable: number;
  valorTecnico: number;

  // Valoración Secundaria
  valorHistorico: number;

  // Tiempos de Retención (años)
  retencionArchivoGestion: number;
  retencionArchivoCentral: number;

  // Disposición Final
  disposicionFinal: 'CT' | 'E' | 'M' | 'S'; // Conservación Total, Eliminación, Microfilmación, Selección
  
  observaciones: string;
}

export default function Tvd() {
  const [itemsTvd, setItemsTvd] = useState<ItemTvd[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    loadData();
  }, [auth]);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Cargar Inventario para sugerir series
      const invResponse = await fetch(`${API_URL}/inventario`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      let inventarioData: InventarioItem[] = [];
      if (invResponse.ok) {
        const json = await invResponse.json();
        inventarioData = json.body.data || [];
      }

      // 2. Cargar TVD existente
      const tvdResponse = await fetch(`${API_URL}/tvd`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      let existingTvdItems: ItemTvd[] = [];
      if (tvdResponse.ok) {
        const json = await tvdResponse.json();
        existingTvdItems = json.body.data.items || [];
      }

      // 3. Mezclar: Si ya existe TVD, usarla. Si no, generar sugerencias basadas en inventario único.
      if (existingTvdItems.length > 0) {
        setItemsTvd(existingTvdItems);
      } else {
        // Extraer asuntos únicos del inventario para proponerlos como Series/Subseries
        const uniqueAsuntos = Array.from(new Set(inventarioData.map(i => i.asunto)));
        const sugerencias: ItemTvd[] = uniqueAsuntos.map(asunto => ({
          serie: asunto,
          subserie: '',
          valorAdministrativo: 1, // Por defecto
          valorLegal: 0,
          valorFiscal: 0,
          valorContable: 0,
          valorTecnico: 0,
          valorHistorico: 0,
          retencionArchivoGestion: 1,
          retencionArchivoCentral: 5,
          disposicionFinal: 'E',
          observaciones: ''
        }));
        setItemsTvd(sugerencias);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (index: number, field: keyof ItemTvd, value: any) => {
    const newItems = [...itemsTvd];
    (newItems[index] as any)[field] = value;
    setItemsTvd(newItems);
  };
  
  const handleCheckboxChange = (index: number, field: keyof ItemTvd) => {
      const newItems = [...itemsTvd];
      const currentVal = (newItems[index] as any)[field];
      (newItems[index] as any)[field] = currentVal === 1 ? 0 : 1;
      setItemsTvd(newItems);
  };

  const handleSaveTvd = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/tvd`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ items: itemsTvd }),
      });
      alert('Tabla de Valoración Documental Guardada Exitosamente');
    } catch (error) {
      alert('Error guardando TVD');
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
      setItemsTvd([...itemsTvd, {
          serie: '', subserie: '',
          valorAdministrativo: 1, valorLegal: 0, valorFiscal: 0, valorContable: 0, valorTecnico: 0,
          valorHistorico: 0,
          retencionArchivoGestion: 1, retencionArchivoCentral: 5,
          disposicionFinal: 'E',
          observaciones: ''
      }]);
  };

  const removeRow = (index: number) => {
      if(confirm('¿Eliminar fila?')) {
          setItemsTvd(itemsTvd.filter((_, i) => i !== index));
      }
  };

  return (
    <PortalLayout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Tabla de Valoración Documental (TVD)</h1>
          <button onClick={handleSaveTvd} className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar TVD'}
          </button>
      </div>
      
      <p className="text-muted">
        Defina los tiempos de retención y disposición final para cada serie o asunto identificado en el inventario.
      </p>

      <div className='card' style={{padding: '0', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '1400px', fontSize: '13px'}}>
            <thead style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                <tr>
                    <th rowSpan={2} style={thStyle}>Serie / Asunto</th>
                    <th colSpan={5} style={{...thStyle, textAlign: 'center', borderRight:'1px solid #ddd'}}>Valores Primarios</th>
                    <th colSpan={1} style={{...thStyle, textAlign: 'center', borderRight:'1px solid #ddd'}}>Secundarios</th>
                    <th colSpan={2} style={{...thStyle, textAlign: 'center', borderRight:'1px solid #ddd'}}>Retención (Años)</th>
                    <th colSpan={1} style={{...thStyle, textAlign: 'center'}}>Disposición</th>
                    <th rowSpan={2} style={thStyle}>Acciones</th>
                </tr>
                <tr>
                    <th title="Administrativo" style={subThStyle}>A</th>
                    <th title="Legal" style={subThStyle}>L</th>
                    <th title="Fiscal" style={subThStyle}>F</th>
                    <th title="Contable" style={subThStyle}>C</th>
                    <th title="Técnico" style={subThStyle} style={{borderRight:'1px solid #ddd'}}>T</th>
                    
                    <th title="Histórico" style={subThStyle} style={{borderRight:'1px solid #ddd'}}>H</th>
                    
                    <th title="Archivo Gestión" style={subThStyle}>AG</th>
                    <th title="Archivo Central" style={subThStyle} style={{borderRight:'1px solid #ddd'}}>AC</th>
                    
                    <th title="Disposición Final" style={subThStyle}>DF</th>
                </tr>
            </thead>
            <tbody>
                {itemsTvd.map((item, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                        <td style={tdStyle}>
                            <input 
                                value={item.serie} 
                                onChange={(e) => handleChange(index, 'serie', e.target.value)} 
                                style={{width:'100%', border:'1px solid #ddd', padding:'4px'}}
                            />
                        </td>
                        
                        {/* Checkboxes Valores Primarios */}
                        <td style={centerTdStyle}><input type="checkbox" checked={item.valorAdministrativo === 1} onChange={() => handleCheckboxChange(index, 'valorAdministrativo')} /></td>
                        <td style={centerTdStyle}><input type="checkbox" checked={item.valorLegal === 1} onChange={() => handleCheckboxChange(index, 'valorLegal')} /></td>
                        <td style={centerTdStyle}><input type="checkbox" checked={item.valorFiscal === 1} onChange={() => handleCheckboxChange(index, 'valorFiscal')} /></td>
                        <td style={centerTdStyle}><input type="checkbox" checked={item.valorContable === 1} onChange={() => handleCheckboxChange(index, 'valorContable')} /></td>
                        <td style={{...centerTdStyle, borderRight:'1px solid #eee'}}><input type="checkbox" checked={item.valorTecnico === 1} onChange={() => handleCheckboxChange(index, 'valorTecnico')} /></td>

                        {/* Valores Secundarios */}
                        <td style={{...centerTdStyle, borderRight:'1px solid #eee'}}><input type="checkbox" checked={item.valorHistorico === 1} onChange={() => handleCheckboxChange(index, 'valorHistorico')} /></td>

                        {/* Retención */}
                        <td style={centerTdStyle}>
                            <input type="number" value={item.retencionArchivoGestion} onChange={(e) => handleChange(index, 'retencionArchivoGestion', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                        </td>
                        <td style={{...centerTdStyle, borderRight:'1px solid #eee'}}>
                            <input type="number" value={item.retencionArchivoCentral} onChange={(e) => handleChange(index, 'retencionArchivoCentral', parseInt(e.target.value))} style={{width:'40px', textAlign:'center'}} />
                        </td>

                        {/* Disposición Final */}
                        <td style={centerTdStyle}>
                            <select value={item.disposicionFinal} onChange={(e) => handleChange(index, 'disposicionFinal', e.target.value)} style={{border:'none', background:'transparent'}}>
                                <option value="CT">Conservación Total</option>
                                <option value="E">Eliminación</option>
                                <option value="M">Microfilmación</option>
                                <option value="S">Selección</option>
                            </select>
                        </td>

                        <td style={centerTdStyle}>
                            <button onClick={() => removeRow(index)} className="btn-icon" style={{color:'red'}}>X</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div style={{padding:'10px'}}>
            <button onClick={addNewRow} className="btn btn-secondary">+ Agregar Fila Manual</button>
        </div>
      </div>
      
      <div style={{marginTop: '20px', fontSize: '12px', color: '#666'}}>
          <strong>Convenciones:</strong> CT: Conservación Total, E: Eliminación, M: Microfilmación/Digitalización, S: Selección.
          <br/>
          <strong>A:</strong> Administrativo, <strong>L:</strong> Legal, <strong>F:</strong> Fiscal, <strong>C:</strong> Contable, <strong>T:</strong> Técnico, <strong>H:</strong> Histórico.
      </div>
    </PortalLayout>
  );
}

const thStyle = { padding: '10px', textAlign: 'left' as const, fontWeight: 'bold', color: '#444' };
const subThStyle = { padding: '8px', fontSize: '11px', fontWeight: 'bold' };
const tdStyle = { padding: '8px', verticalAlign: 'middle' };
const centerTdStyle = { padding: '8px', textAlign: 'center' as const, verticalAlign: 'middle' };