import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Dependencia } from "../types/types";
import { Tree, TreeNode } from "react-organizational-chart";
import { useNavigate } from "react-router-dom";

const MdEdit = (IconsMd as any).MdEdit;
const MdDelete = (IconsMd as any).MdDelete;
const MdAccountTree = (IconsMd as any).MdAccountTree;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdLock = (IconsMd as any).MdLock;

export default function EstructuraOrganizacional() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "arbol">("arbol");
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [padreId, setPadreId] = useState("");
  const [esJunta, setEsJunta] = useState(false);

  const selectedEmpresa = auth.getSelectedEmpresa();

  useEffect(() => {
    fetchDependencias();
  }, []);

  async function fetchDependencias() {
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const response = await fetch(`${API_URL}/archivistica/dependencias`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa.id,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setDependencias(json.body.dependencias);
      } else {
        setError("Error al cargar dependencias");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    const url = isEditing 
      ? `${API_URL}/archivistica/dependencias/${currentId}`
      : `${API_URL}/archivistica/dependencias`;
    
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa.id,
        },
        body: JSON.stringify({
          codigoDependencia: codigo,
          nombreDependencia: nombre,
          dependenciaPadreId: padreId || null,
          esJuntaDirectiva: esJunta
        }),
      });

      if (response.ok) {
        resetForm();
        fetchDependencias();
      } else {
        const json = await response.json();
        setError(json.body.error || "Error al guardar");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta dependencia?")) return;
    
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/dependencias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });

      if (response.ok) {
        fetchDependencias();
      } else {
        const json = await response.json();
        alert(json.body.error || "No se pudo eliminar");
      }
    } catch (err) {
      setError("Error al eliminar");
    }
  }

  async function handleFinalizarOnboarding() {
    if (dependencias.length === 0) {
      alert("Debes crear al menos una dependencia antes de finalizar.");
      return;
    }

    if (!confirm("¿Estás seguro de que la estructura organizacional está completa? Una vez proyectada, podrás continuar con el resto de la aplicación.")) return;

    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const response = await fetch(`${API_URL}/empresas/${empresa.id}/onboarding/completar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const _json = await response.json();
        // Actualizar el estado local de la empresa
        const empresaActualizada = { ...empresa, onboardingCompleted: true };
        auth.setSelectedEmpresa(empresaActualizada);
        navigate("/dashboard");
      } else {
        const json = await response.json();
        setError(json.body.error || "Error al completar el onboarding");
      }
    } catch (err) {
      setError("Error de conexión al finalizar");
    }
  }

  function handleEdit(dep: Dependencia) {
    setIsEditing(true);
    setCurrentId(dep.id);
    setCodigo(dep.codigoDependencia);
    setNombre(dep.nombreDependencia);
    setPadreId(dep.dependenciaPadreId || "");
    setEsJunta(dep.esJuntaDirectiva);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setIsEditing(false);
    setCurrentId("");
    setCodigo("");
    setNombre("");
    setPadreId("");
    setEsJunta(false);
    setError("");
  }

  const getNombrePadre = (id?: string) => {
    if (!id) return "Nivel Superior";
    const padre = dependencias.find(d => d.id === id);
    return padre ? padre.nombreDependencia : "Desconocido";
  };

  // Función recursiva para renderizar el árbol
  const renderTreeNodes = (parentId: string | null) => {
    return dependencias
      .filter(dep => dep.dependenciaPadreId === parentId || (parentId === null && !dep.dependenciaPadreId))
      .map(dep => (
        <TreeNode 
          key={dep.id} 
          label={
            <div className="tree-node-card">
              <span className="tree-node-code">{dep.codigoDependencia}</span>
              <span className="tree-node-name">{dep.nombreDependencia}</span>
              <div className="tree-node-actions">
                <button onClick={() => handleEdit(dep)}><MdEdit size={12} /></button>
                <button onClick={() => handleDelete(dep.id)} className="danger"><MdDelete size={12} /></button>
              </div>
            </div>
          }
        >
          {renderTreeNodes(dep.id)}
        </TreeNode>
      ));
  };

  return (
    <PortalLayout>
      <div className="estructura-container">
        {!selectedEmpresa?.onboardingCompleted && (
          <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', padding: '20px' }}>
            <MdLock size={40} />
            <div>
              <h3 style={{ margin: 0 }}>Configuración Inicial Requerida</h3>
              <p style={{ margin: '5px 0 0 0' }}>Para habilitar el resto de las herramientas de SGDEA, debes definir la estructura organizacional (Organigrama) de tu empresa. Esta información es transversal para la codificación de documentos y TRD.</p>
            </div>
          </div>
        )}

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>Estructura Organizacional</h1>
            <p className="text-muted">Define la jerarquía de áreas y dependencias.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn ${viewMode === 'arbol' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setViewMode('arbol')}
            >
              Ver Árbol
            </button>
            <button 
              className={`btn ${viewMode === 'lista' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setViewMode('lista')}
            >
              Ver Tabla
            </button>
          </div>
        </header>

        {error && <div className="errorMessage">{error}</div>}

        <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '30px' }}>
          {/* Formulario */}
          <section className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h2>{isEditing ? "Editar Dependencia" : "Nueva Dependencia"}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label>Código de Dependencia</label>
                <input 
                  type="text" 
                  value={codigo} 
                  onChange={(e) => setCodigo(e.target.value)} 
                  placeholder="Ej: 100, 110, GG"
                  required
                  className="edit-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Nombre de la Dependencia</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej: Gerencia General"
                  required
                  className="edit-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label>Dependencia Superior (Opcional)</label>
                <select 
                  className="edit-input" 
                  style={{ width: '100%' }}
                  value={padreId}
                  onChange={(e) => setPadreId(e.target.value)}
                >
                  <option value="">Ninguna (Nivel Superior)</option>
                  {dependencias
                    .filter(d => d.id !== currentId)
                    .map(d => (
                    <option key={d.id} value={d.id}>{d.codigoDependencia} - {d.nombreDependencia}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="esJunta"
                  checked={esJunta} 
                  onChange={(e) => setEsJunta(e.target.checked)} 
                />
                <label htmlFor="esJunta">¿Es Junta Directiva / Nivel Directivo?</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isEditing ? "Actualizar" : "Crear Dependencia"}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {!selectedEmpresa?.onboardingCompleted && dependencias.length > 0 && (
              <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button 
                  className="btn btn-success" 
                  style={{ width: '100%', padding: '15px', fontWeight: 'bold' }}
                  onClick={handleFinalizarOnboarding}
                >
                  <MdCheckCircle size={20} style={{ marginRight: '10px' }} />
                  Proyectar Estructura y Finalizar
                </button>
              </div>
            )}
          </section>

          {/* Visualización */}
          <section className="card" style={{ padding: '20px', minHeight: '500px', overflowX: 'auto' }}>
            {loading ? (
              <p>Cargando...</p>
            ) : viewMode === 'lista' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Superior</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dependencias.map(dep => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px' }}><strong>{dep.codigoDependencia}</strong></td>
                      <td style={{ padding: '10px' }}>{dep.nombreDependencia}</td>
                      <td style={{ padding: '10px' }} className="text-muted">{getNombrePadre(dep.dependenciaPadreId)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button className="btn btn-icon" onClick={() => handleEdit(dep)} title="Editar">
                          <MdEdit />
                        </button>
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(dep.id)} title="Eliminar">
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="tree-container" style={{ padding: '20px' }}>
                {dependencias.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
                    <MdAccountTree size={60} style={{ opacity: 0.3 }} />
                    <p>No hay dependencias registradas aún. Empieza creando la Gerencia o nivel directivo.</p>
                  </div>
                ) : (
                  <Tree
                    lineWidth={'2px'}
                    lineColor={'var(--primary-color)'}
                    lineBorderRadius={'10px'}
                    label={
                      <div className="tree-root-label">
                        {selectedEmpresa?.razonSocial}
                      </div>
                    }
                  >
                    {renderTreeNodes(null)}
                  </Tree>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .tree-node-card {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: inline-block;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          min-width: 120px;
          position: relative;
        }
        .tree-node-code {
          display: block;
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--primary-color);
        }
        .tree-node-name {
          display: block;
          font-size: 0.9rem;
        }
        .tree-node-actions {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 5px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .tree-node-card:hover .tree-node-actions {
          opacity: 1;
        }
        .tree-node-actions button {
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 2px;
        }
        .tree-node-actions button:hover {
          color: var(--primary-color);
        }
        .tree-node-actions button.danger:hover {
          color: #e74c3c;
        }
        .tree-root-label {
          padding: 15px;
          background: var(--primary-color);
          color: white;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .btn-success {
          background-color: #27ae60;
          color: white;
          border: none;
        }
        .btn-success:hover {
          background-color: #2ecc71;
        }
        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          border-radius: 8px;
        }
      `}</style>
    </PortalLayout>
  );
}
