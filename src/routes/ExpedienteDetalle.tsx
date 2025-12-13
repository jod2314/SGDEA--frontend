import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdArrowBack, MdInsertDriveFile, MdAddLink } from 'react-icons/md';

interface Documento {
  _id: string;
  numeroRadicacion: string;
  asunto: string;
  tipoDocumento: string;
  fechaRadicacion: string;
}

interface ExpedienteDetail {
  _id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: string;
  nombreTRDSerie: string;
  fechaApertura: string;
  documentos: {
    documento: Documento;
    fechaVinculacion: string;
    folioInicio?: number;
    folioFin?: number;
  }[];
}

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [expediente, setExpediente] = useState<ExpedienteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de vinculación
  const [showModal, setShowModal] = useState(false);
  const [docsDisponibles, setDocsDisponibles] = useState<Documento[]>([]);
  const [selectedDoc, setSelectedDoc] = useState('');

  useEffect(() => {
    if (id) fetchExpediente();
  }, [id, auth]);

  const fetchExpediente = async () => {
    try {
      const response = await fetch(`${API_URL}/expedientes/${id}`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        setExpediente(json.body.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocsDisponibles = async () => {
    // En un sistema real, esto debería ser una búsqueda filtrada por "No archivados"
    // Por simplicidad, traemos todos y filtramos en cliente
    try {
      const response = await fetch(`${API_URL}/documentos`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        // Filtramos para no mostrar los que ya están en este expediente
        const currentIds = expediente?.documentos.map(d => d.documento._id) || [];
        const disponibles = json.body.data.filter((d: Documento) => !currentIds.includes(d._id));
        setDocsDisponibles(disponibles);
      }
    } catch (error) { console.error(error); }
  };

  const handleOpenLinkModal = () => {
    fetchDocsDisponibles();
    setShowModal(true);
  };

  const handleLinkDocumento = async () => {
    if (!selectedDoc) return;
    try {
      const response = await fetch(`${API_URL}/expedientes/${id}/agregar-documento`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ documentoId: selectedDoc }),
      });

      if (response.ok) {
        alert("Documento vinculado correctamente");
        setShowModal(false);
        fetchExpediente(); // Recargar expediente
      } else {
        alert("Error al vincular documento");
      }
    } catch (error) { console.error(error); }
  };

  if (loading) return <PortalLayout>Cargando expediente...</PortalLayout>;
  if (!expediente) return <PortalLayout>Expediente no encontrado</PortalLayout>;

  return (
    <PortalLayout>
      <button onClick={() => navigate('/expedientes')} className="btn-icon" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1rem'}}>
        <MdArrowBack /> Volver a la lista
      </button>

      <div className="card" style={{borderLeft: '5px solid #1a73e8', marginBottom: '20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
                <h1 style={{margin: '0 0 10px 0', fontSize: '1.8rem'}}>{expediente.codigo}</h1>
                <h2 style={{margin: '0 0 10px 0', fontSize: '1.4rem', color: '#444'}}>{expediente.titulo}</h2>
                <p style={{margin: '0', color: '#666'}}>{expediente.nombreTRDSerie}</p>
            </div>
            <div style={{textAlign: 'right'}}>
                <span style={{
                    padding: '5px 10px', 
                    borderRadius: '15px', 
                    backgroundColor: expediente.estado === 'Abierto' ? '#e6f4ea' : '#fce8e6',
                    color: expediente.estado === 'Abierto' ? '#137333' : '#c5221f',
                    fontWeight: 'bold'
                }}>
                    {expediente.estado}
                </span>
                <p style={{fontSize: '0.8rem', marginTop: '10px', color: '#888'}}>
                    Apertura: {new Date(expediente.fechaApertura).toLocaleDateString()}
                </p>
            </div>
        </div>
        <p style={{marginTop: '15px'}}>{expediente.descripcion}</p>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
        <h3>Índice Electrónico ({expediente.documentos.length} folios)</h3>
        {expediente.estado === 'Abierto' && (
            <button onClick={handleOpenLinkModal} className="btn btn-primary" style={{display:'flex', alignItems:'center', gap:'5px'}}>
                <MdAddLink /> Vincular Documento
            </button>
        )}
      </div>

      <div className="card" style={{padding: '0'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
                <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={thStyle}>No. Radicado</th>
                    <th style={thStyle}>Fecha Radicación</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Asunto</th>
                    <th style={thStyle}>Fecha Vinculación</th>
                    <th style={thStyle}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {expediente.documentos.map((item, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                        <td style={tdStyle}>
                            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                <MdInsertDriveFile color="#555"/> {item.documento.numeroRadicacion}
                            </div>
                        </td>
                        <td style={tdStyle}>{new Date(item.documento.fechaRadicacion).toLocaleDateString()}</td>
                        <td style={tdStyle}>{item.documento.tipoDocumento}</td>
                        <td style={tdStyle}>{item.documento.asunto}</td>
                        <td style={tdStyle}>{new Date(item.fechaVinculacion).toLocaleDateString()}</td>
                        <td style={tdStyle}>
                            <button className="btn-secondary" style={{fontSize: '0.8rem', padding: '2px 8px'}}>Ver</button>
                        </td>
                    </tr>
                ))}
                {expediente.documentos.length === 0 && (
                    <tr>
                        <td colSpan={6} style={{padding: '20px', textAlign: 'center', color: '#888'}}>
                            Este expediente aún no contiene documentos.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Modal para vincular documentos */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Vincular Documento al Expediente</h3>
            <p>Seleccione un documento radicado para archivarlo aquí.</p>
            
            <select 
                value={selectedDoc} 
                onChange={(e) => setSelectedDoc(e.target.value)}
                style={{width: '100%', padding: '10px', margin: '15px 0'}}
            >
                <option value="">-- Seleccione un documento --</option>
                {docsDisponibles.map(doc => (
                    <option key={doc._id} value={doc._id}>
                        {doc.numeroRadicacion} - {doc.asunto} ({doc.tipoDocumento})
                    </option>
                ))}
            </select>

            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button onClick={handleLinkDocumento} className="btn btn-primary" disabled={!selectedDoc}>
                    Vincular
                </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}

const thStyle = { padding: '12px 10px', textAlign: 'left' as const, fontWeight: 'bold', color: '#444' };
const tdStyle = { padding: '10px', verticalAlign: 'middle' };

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
  
const modalStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%'
};
