import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdSave, MdClear } from 'react-icons/md';

// Interfaz para los datos del documento, alineada con el Schema
interface DocumentoData {
  _id?: string;
  numeroRadicacion?: string;
  fechaRadicacion?: string;
  tipoDocumento: string;
  asunto: string;
  descripcion?: string;
  remitente?: string;
  destinatario?: string;
  esDigital: boolean;
  rutaArchivo?: string;
  nombreArchivo?: string;
  tipoMime?: string;
  tamanioArchivo?: number;
  ubicacionFisica?: string;
  idTRDSerie?: string; // ID directo
  codigoTRDSerie?: string;
  nombreTRDSerie?: string;
}

// Interfaz para un item de la TRD, para el dropdown de selección
interface TrdItem {
  _id: string; // ID es obligatorio para selección segura
  codigoSerie: string;
  nombreSerie: string;
  codigoSubserie?: string;
  nombreSubserie?: string;
}

const emptyDocumento: DocumentoData = {
  tipoDocumento: 'Oficio',
  asunto: '',
  esDigital: false,
};

export default function Radicacion() {
  const [formData, setFormData] = useState<DocumentoData>(emptyDocumento);
  const [loading, setLoading] = useState(false);
  const [trdItems, setTrdItems] = useState<TrdItem[]>([]); // Para el selector de TRD
  const auth = useAuth();

  useEffect(() => {
    // Cargar la TRD activa para poblar el selector de series
    async function fetchTrdItems() {
      try {
        const response = await fetch(`${API_URL}/trd`, {
          headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
        });
        if (response.ok) {
          const json = await response.json();
          if (json.body.data && json.body.data.items) {
            setTrdItems(json.body.data.items);
          }
        }
      } catch (error) {
        console.error("Error cargando ítems de TRD", error);
      }
    }
    fetchTrdItems();
  }, [auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'idTRDSerie') {
        // Manejar selección de TRD serie por ID
        const selectedItem = trdItems.find(item => item._id === value);
        if (selectedItem) {
            setFormData(prev => ({ 
                ...prev, 
                idTRDSerie: value,
                codigoTRDSerie: selectedItem.codigoSerie, 
                nombreTRDSerie: selectedItem.nombreSerie 
            }));
        } else {
            setFormData(prev => ({ ...prev, idTRDSerie: '', codigoTRDSerie: '', nombreTRDSerie: '' }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Aquí iría la lógica para subir el archivo.
      // Por ahora, solo guardamos el nombre y tamaño en el estado.
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        nombreArchivo: file.name,
        tipoMime: file.type,
        tamanioArchivo: file.size,
        rutaArchivo: `uploads/${file.name}`, // Placeholder
        esDigital: true,
      }));
      alert("Simulación: Archivo cargado. La lógica de subida real no está implementada aún.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipoDocumento || !formData.asunto) {
      return alert("Tipo de documento y Asunto son obligatorios.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/documentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const json = await response.json();
        alert(`Documento radicado con éxito! Número: ${json.body.data.numeroRadicacion}`);
        setFormData(emptyDocumento); // Limpiar formulario
      } else {
        const err = await response.json();
        alert(`Error al radicar: ${err.body.error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Ocurrió un error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Radicación de Documentos</h1>
      </div>
      
      <p className="text-muted">
        Registre nuevos documentos y asócielos a la Tabla de Retención Documental (TRD).
      </p>

      <div className='card' style={{padding: '20px'}}>
        <form onSubmit={handleSubmit}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            
            <div>
              <label htmlFor="tipoDocumento">Tipo de Documento:</label>
              <select name="tipoDocumento" id="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} style={inputStyle}>
                <option value="Oficio">Oficio</option>
                <option value="Acta">Acta</option>
                <option value="Factura">Factura</option>
                <option value="Contrato">Contrato</option>
                <option value="Circular">Circular</option>
                <option value="Informe">Informe</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="asunto">Asunto:</label>
              <input type="text" name="asunto" id="asunto" value={formData.asunto} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{gridColumn: '1 / span 2'}}>
              <label htmlFor="descripcion">Descripción Detallada:</label>
              <textarea name="descripcion" id="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows={3} style={inputStyle}></textarea>
            </div>

            <div>
              <label htmlFor="remitente">Remitente:</label>
              <input type="text" name="remitente" id="remitente" value={formData.remitente || ''} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label htmlFor="destinatario">Destinatario:</label>
              <input type="text" name="destinatario" id="destinatario" value={formData.destinatario || ''} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label htmlFor="idTRDSerie">Serie TRD:</label>
              <select name="idTRDSerie" id="idTRDSerie" value={formData.idTRDSerie || ''} onChange={handleChange} style={inputStyle}>
                <option value="">Seleccione una serie de la TRD</option>
                {trdItems.map((item) => (
                    <option key={item._id} value={item._id}>
                        {item.codigoSerie} - {item.nombreSerie} {item.nombreSubserie ? `(${item.nombreSubserie})` : ''}
                    </option>
                ))}
              </select>
              {trdItems.length === 0 && <p className="text-muted" style={{fontSize: '0.8em'}}>No hay TRD activa. Cree una en "Gestión TRD".</p>}
            </div>

            <div> {/* Este div contiene la lógica de esDigital */}
              <label htmlFor="esDigital">
                <input type="checkbox" name="esDigital" id="esDigital" checked={formData.esDigital} onChange={handleChange} style={{marginRight: '10px'}} />
                ¿Es documento digital?
              </label>
              {formData.esDigital && (
                <div style={{marginTop: '10px'}}>
                  <label htmlFor="archivo">Cargar Archivo:</label>
                  <input type="file" id="archivo" onChange={handleFileChange} style={{...inputStyle, border: 'none', padding: '0'}} />
                  {formData.nombreArchivo && <p className="text-muted" style={{fontSize: '0.8em'}}>Archivo: {formData.nombreArchivo} ({Math.round((formData.tamanioArchivo || 0) / 1024)} KB)</p>}
                </div>
              )}
            </div>

            <div> {/* Nuevo contenedor para Ubicación Física */}
            {!formData.esDigital ? (
              <>
                <label htmlFor="ubicacionFisica">Ubicación Física:</label>
                <input type="text" name="ubicacionFisica" id="ubicacionFisica" value={formData.ubicacionFisica || ''} onChange={handleChange} style={inputStyle} />
              </>
            ) : null}
            </div>

          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
            <button type="button" onClick={() => setFormData(emptyDocumento)} className="btn btn-secondary">
              <MdClear style={{verticalAlign: 'middle'}}/> Limpiar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <MdSave style={{verticalAlign: 'middle'}}/> {loading ? 'Radicando...' : 'Radicar Documento'}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
  marginTop: '5px',
  marginBottom: '10px',
  fontSize: '1em'
};