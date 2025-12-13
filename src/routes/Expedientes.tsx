import { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdFolder, MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Expediente {
  _id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: string;
  nombreTRDSerie: string;
  fechaApertura: string;
  documentos: any[];
}

interface TrdItem {
  _id: string;
  codigoSerie: string;
  nombreSerie: string;
  nombreSubserie?: string;
}

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newExpediente, setNewExpediente] = useState({ codigo: '', titulo: '', descripcion: '', idTRDSerie: '' });
  const [trdItems, setTrdItems] = useState<TrdItem[]>([]);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpedientes();
    fetchTrdItems();
  }, [auth]);

  const fetchExpedientes = async () => {
    try {
      const response = await fetch(`${API_URL}/expedientes`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        setExpedientes(json.body.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrdItems = async () => {
    try {
      const response = await fetch(`${API_URL}/trd`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        if(json.body.data) setTrdItems(json.body.data.items);
      }
    } catch (error) { console.error(error); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Encontrar datos de TRD
    const trdItem = trdItems.find(i => i._id === newExpediente.idTRDSerie);
    const payload = {
        ...newExpediente,
        codigoTRDSerie: trdItem?.codigoSerie,
        nombreTRDSerie: trdItem?.nombreSerie,
        nombreSubserie: trdItem?.nombreSubserie
    };

    try {
      const response = await fetch(`${API_URL}/expedientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        fetchExpedientes();
        setNewExpediente({ codigo: '', titulo: '', descripcion: '', idTRDSerie: '' });
      } else {
        alert("Error al crear expediente");
      }
    } catch (error) { console.error(error); }
  };

  return (
    <PortalLayout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Expedientes Electrónicos</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary"><MdAdd /> Nuevo Expediente</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
        {expedientes.map(exp => (
            <div 
                key={exp._id} 
                className="card" 
                style={{padding: '20px', borderLeft: '5px solid #1a73e8', cursor: 'pointer', transition: 'transform 0.2s'}}
                onClick={() => navigate(`/expedientes/${exp._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                    <MdFolder size={30} color="#1a73e8" style={{marginRight:'10px'}}/>
                    <div>
                        <h3 style={{margin:0, fontSize:'1.1em'}}>{exp.codigo}</h3>
                        <span style={{fontSize:'0.8em', color:'#666'}}>{exp.estado}</span>
                    </div>
                </div>
                <h4 style={{margin:'10px 0'}}>{exp.titulo}</h4>
                <p style={{fontSize:'0.9em', color:'#555'}}>{exp.nombreTRDSerie}</p>
                <div style={{marginTop:'15px', borderTop:'1px solid #eee', paddingTop:'10px', fontSize:'0.9em'}}>
                    Documentos: {exp.documentos.length}
                </div>
            </div>
        ))}
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>Nuevo Expediente</h2>
            <form onSubmit={handleCreate}>
                <label>Código Expediente:</label>
                <input style={inputStyle} value={newExpediente.codigo} onChange={e => setNewExpediente({...newExpediente, codigo: e.target.value})} placeholder="Ej: EXP-2023-001" required />
                
                <label>Título:</label>
                <input style={inputStyle} value={newExpediente.titulo} onChange={e => setNewExpediente({...newExpediente, titulo: e.target.value})} placeholder="Ej: Contrato Prestación Servicios" required />
                
                <label>Serie TRD:</label>
                <select style={inputStyle} value={newExpediente.idTRDSerie} onChange={e => setNewExpediente({...newExpediente, idTRDSerie: e.target.value})} required>
                    <option value="">Seleccione Serie...</option>
                    {trdItems.map(i => (
                        <option key={i._id} value={i._id}>{i.codigoSerie} - {i.nombreSerie}</option>
                    ))}
                </select>

                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Crear</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%'
};

const inputStyle = {
  width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'
};