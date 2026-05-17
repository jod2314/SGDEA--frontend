import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdSave = (IconsMd as any).MdSave;
const MdEdit = (IconsMd as any).MdEdit;
const MdDelete = (IconsMd as any).MdDelete;
const MdAdd = (IconsMd as any).MdAdd;
const MdHistory = (IconsMd as any).MdHistory;

interface DatoMaestro {
  _id: string;
  tipo: string;
  datos: any;
  vigenteDesde: string;
}

export default function DatosMaestros() {
  const auth = useAuth();
  const [maestros, setMaestros] = useState<DatoMaestro[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tipo, setTipo] = useState("");
  const [jsonString, setJsonString] = useState("");
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchMaestros();
    }
  }, [auth.isAuthenticated]);

  async function fetchMaestros() {
    try {
      const json = await auth.request<any>("/datos-maestros");
      setMaestros(json.body.maestros);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsedDatos = JSON.parse(jsonString);
      await auth.request<any>("/datos-maestros", {
        method: "POST",
        body: JSON.stringify({ 
          tipo: tipo.toUpperCase(), 
          datos: parsedDatos, 
          comentario 
        })
      });
      fetchMaestros();
      resetForm();
    } catch (error: any) {
      alert("Error en el formato JSON o en el servidor: " + error.message);
    }
  }

  function handleEdit(m: DatoMaestro) {
    setTipo(m.tipo);
    setJsonString(JSON.stringify(m.datos, null, 2));
    setComentario("");
    setIsEditing(true);
    setShowForm(true);
  }

  function resetForm() {
    setTipo("");
    setJsonString("");
    setComentario("");
    setIsEditing(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este dato maestro? Esto podría afectar la generación de nuevas plantillas que lo usen.")) return;
    try {
      await auth.request<any>(`/datos-maestros/${id}`, { method: "DELETE" });
      fetchMaestros();
    } catch (error) { console.error(error); }
  }

  return (
    <PortalLayout>
      <div className="maestros-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Gestión de Datos Maestros</h1>
            <p className="text-muted">Administra la información institucional dinámica para la fusión de documentos (Representantes, Membretes, etc.).</p>
          </div>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <MdAdd /> Nuevo Dato Maestro
            </button>
          )}
        </header>

        {showForm && (
          <section className="card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '4px solid var(--primary-color)' }}>
            <h2>{isEditing ? `Actualizar: ${tipo}` : "Crear Nuevo Dato Maestro"}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label>Tipo / Identificador (Tokens)</label>
                  <input 
                    type="text" 
                    value={tipo} 
                    onChange={e => setTipo(e.target.value)} 
                    placeholder="Ej: REPRESENTANTE_LEGAL" 
                    disabled={isEditing}
                    className="edit-input"
                    style={{ width: '100%', textTransform: 'uppercase' }}
                    required
                  />
                  <small className="text-muted">Se usará como {'{{maestros.tipo.campo}}'}</small>
                </div>
                <div>
                  <label>Comentario de cambio</label>
                  <input 
                    type="text" 
                    value={comentario} 
                    onChange={e => setComentario(e.target.value)} 
                    placeholder="¿Por qué se actualiza este dato?" 
                    className="edit-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label>Datos (Formato JSON)</label>
                <textarea 
                  value={jsonString} 
                  onChange={e => setJsonString(e.target.value)}
                  placeholder='{ "nombre": "Juan Pérez", "cargo": "Gerente" }'
                  className="edit-input"
                  style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  <MdSave /> {isEditing ? "Guardar Nueva Versión" : "Crear Dato Maestro"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="grid-maestros" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {loading ? <p>Cargando maestros...</p> : maestros.length === 0 ? <p className="text-muted">No hay datos maestros definidos.</p> : maestros.map(m => (
            <div key={m._id} className="card maestro-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{m.tipo}</h3>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-icon" onClick={() => handleEdit(m)}><MdEdit /></button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(m._id)}><MdDelete /></button>
                  </div>
                </div>
                <p className="small text-muted" style={{ marginTop: '5px' }}>Vigente desde: {new Date(m.vigenteDesde).toLocaleDateString()}</p>
                
                <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '5px', fontSize: '0.85rem' }}>
                  <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(m.datos, null, 2)}</pre>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
                  <MdHistory /> Ver Histórico de Cambios
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
