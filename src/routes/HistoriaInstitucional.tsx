import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdHistory, MdAdd, MdDelete, MdEdit, MdBusiness } from 'react-icons/md';

// Tipos
interface Periodo {
  _id?: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  actoAdministrativo?: string;
  descripcion?: string;
  estado?: 'Abierto' | 'Cerrado';
}

interface Dependencia {
  _id?: string;
  periodoHistorico: string;
  codigo: string;
  nombre: string;
  padre?: any; // ID o objeto poblado
  nivelJerarquico?: string;
  activa: boolean;
}

export default function HistoriaInstitucional() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  
  // Estados de formularios
  const [newPeriodo, setNewPeriodo] = useState<Periodo>({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [newDependencia, setNewDependencia] = useState<Dependencia>({ periodoHistorico: '', codigo: '', nombre: '', activa: true });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();

  // Cargar Periodos al inicio
  useEffect(() => {
    fetchPeriodos();
  }, []);

  // Cargar Estructura cuando se selecciona un periodo
  useEffect(() => {
    if (selectedPeriodo && selectedPeriodo._id) {
      fetchEstructura(selectedPeriodo._id);
    } else {
      setDependencias([]);
    }
  }, [selectedPeriodo]);

  const fetchPeriodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/historico`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPeriodos(json.body.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstructura = async (periodoId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/estructura?periodoId=${periodoId}`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        setDependencias(json.body.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers Periodos ---
  const handleCreatePeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodo.nombre || !newPeriodo.fechaInicio || !newPeriodo.fechaFin) {
        return alert("Complete los campos obligatorios del periodo");
    }
    
    try {
      const res = await fetch(`${API_URL}/historico`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.getAccessToken()}` 
        },
        body: JSON.stringify(newPeriodo)
      });
      const json = await res.json();
      if (res.ok) {
        setPeriodos([...periodos, json.body.data]);
        setNewPeriodo({ nombre: '', fechaInicio: '', fechaFin: '' });
      } else {
        alert("Error: " + json.body.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePeriodo = async (id: string) => {
    if(!confirm("¿Eliminar periodo? Se perderá la estructura asociada.")) return;
    try {
        await fetch(`${API_URL}/historico/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
        });
        setPeriodos(periodos.filter(p => p._id !== id));
        if(selectedPeriodo?._id === id) setSelectedPeriodo(null);
    } catch(err) { console.error(err); }
  };

  // --- Handlers Dependencias ---
  const handleCreateDependencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodo?._id) return;

    try {
      const payload = { ...newDependencia, periodoHistorico: selectedPeriodo._id };
      const res = await fetch(`${API_URL}/estructura`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.getAccessToken()}` 
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        setDependencias([...dependencias, json.body.data]);
        setNewDependencia({ ...newDependencia, codigo: '', nombre: '' }); // Limpiar campos básicos
      } else {
        alert("Error: " + json.body.error);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteDependencia = async (id: string) => {
    if(!confirm("¿Eliminar dependencia?")) return;
    try {
        await fetch(`${API_URL}/estructura/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${auth.getAccessToken()}` }
        });
        setDependencias(dependencias.filter(d => d._id !== id));
    } catch(err) { console.error(err); }
  };

  return (
    <PortalLayout>
      <h1><MdHistory /> Historia Institucional (Timeline)</h1>
      <p className="text-muted">Reconstruya la evolución de la entidad definiendo los periodos históricos y sus respectivas estructuras orgánicas.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        
        {/* COLUMNA IZQUIERDA: PERIODOS */}
        <div className="card">
            <h3>Periodos Históricos</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                {periodos.map(p => (
                    <div 
                        key={p._id} 
                        onClick={() => setSelectedPeriodo(p)}
                        style={{
                            padding: '10px', 
                            border: '1px solid #eee', 
                            marginBottom: '5px', 
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: selectedPeriodo?._id === p._id ? '#e8f0fe' : 'white',
                            borderColor: selectedPeriodo?._id === p._id ? '#1a73e8' : '#eee'
                        }}
                    >
                        <div style={{fontWeight: 'bold'}}>{p.nombre}</div>
                        <div style={{fontSize: '0.8em', color: '#666'}}>
                            {new Date(p.fechaInicio).getFullYear()} - {new Date(p.fechaFin).getFullYear()}
                        </div>
                        <div style={{textAlign: 'right'}}>
                             <button onClick={(e) => { e.stopPropagation(); p._id && handleDeletePeriodo(p._id); }} style={{border:'none', background:'transparent', color:'red', cursor:'pointer'}} title="Eliminar"><MdDelete/></button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleCreatePeriodo} style={{borderTop: '1px solid #eee', paddingTop: '10px'}}>
                <h4>Nuevo Periodo</h4>
                <input 
                    className="form-control" 
                    placeholder="Nombre (Ej: Fundación)" 
                    value={newPeriodo.nombre} 
                    onChange={e => setNewPeriodo({...newPeriodo, nombre: e.target.value})} 
                    style={{marginBottom: '5px', width: '100%'}}
                />
                <div style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                    <input type="date" className="form-control" value={newPeriodo.fechaInicio} onChange={e => setNewPeriodo({...newPeriodo, fechaInicio: e.target.value})} title="Fecha Inicio" />
                    <input type="date" className="form-control" value={newPeriodo.fechaFin} onChange={e => setNewPeriodo({...newPeriodo, fechaFin: e.target.value})} title="Fecha Fin" />
                </div>
                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Agregar Periodo</button>
            </form>
        </div>

        {/* COLUMNA DERECHA: ESTRUCTURA */}
        <div className="card">
            {selectedPeriodo ? (
                <>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h3>Estructura: {selectedPeriodo.nombre}</h3>
                        <span className="text-muted">{new Date(selectedPeriodo.fechaInicio).getFullYear()} - {new Date(selectedPeriodo.fechaFin).getFullYear()}</span>
                    </div>
                    
                    <p style={{fontSize:'0.9em'}}>Defina las dependencias que existían en este periodo. Esto validará el inventario.</p>

                    <table style={{width: '100%', marginTop: '10px', fontSize: '14px'}}>
                        <thead>
                            <tr style={{background: '#f8f9fa'}}>
                                <th style={{padding:'8px'}}>Código</th>
                                <th style={{padding:'8px'}}>Nombre Dependencia</th>
                                <th style={{padding:'8px'}}>Nivel</th>
                                <th style={{padding:'8px'}}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dependencias.map(d => (
                                <tr key={d._id} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding:'8px'}}>{d.codigo}</td>
                                    <td style={{padding:'8px'}}>{d.nombre}</td>
                                    <td style={{padding:'8px'}}>{d.nivelJerarquico || '-'}</td>
                                    <td style={{padding:'8px'}}>
                                        <button onClick={() => d._id && handleDeleteDependencia(d._id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}><MdDelete/></button>
                                    </td>
                                </tr>
                            ))}
                            {/* Fila de creación */}
                            <tr style={{background: '#e8f0fe'}}>
                                <td style={{padding:'5px'}}>
                                    <input placeholder="Cód" value={newDependencia.codigo} onChange={e => setNewDependencia({...newDependencia, codigo: e.target.value})} style={{width: '60px'}} />
                                </td>
                                <td style={{padding:'5px'}}>
                                    <input placeholder="Nombre de la dependencia" value={newDependencia.nombre} onChange={e => setNewDependencia({...newDependencia, nombre: e.target.value})} style={{width: '100%'}} />
                                </td>
                                <td style={{padding:'5px'}}>
                                    <select value={newDependencia.nivelJerarquico || ''} onChange={e => setNewDependencia({...newDependencia, nivelJerarquico: e.target.value})} style={{fontSize:'12px'}}>
                                        <option value="">Sel...</option>
                                        <option value="Direccion">Dirección</option>
                                        <option value="Subdireccion">Subdirección</option>
                                        <option value="Division">División</option>
                                        <option value="Seccion">Sección</option>
                                    </select>
                                </td>
                                <td style={{padding:'5px'}}>
                                    <button onClick={handleCreateDependencia} className="btn btn-primary" style={{padding: '2px 8px'}}><MdAdd/></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            ) : (
                <div style={{display:'flex', height:'100%', justifyContent:'center', alignItems:'center', flexDirection:'column', color:'#999'}}>
                    <MdBusiness size={64} />
                    <p>Seleccione un periodo histórico a la izquierda para gestionar su organigrama.</p>
                </div>
            )}
        </div>
      </div>
    </PortalLayout>
  );
}
