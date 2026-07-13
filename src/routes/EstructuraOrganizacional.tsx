import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as IconsMd from "react-icons/md";
import { Tree, TreeNode } from "react-organizational-chart";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import { Dependencia, User, ApiResponse } from "../types/types";

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
  
  // Estado del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [padreId, setPadreId] = useState("");
  const [esJunta, setEsJunta] = useState(false);
  const [jefeId, setJefeId] = useState("");
  const [usuarios, setUsuarios] = useState<User[]>([]);

  const selectedEmpresa = auth.getSelectedEmpresa();

  useEffect(() => {
    fetchDependencias();
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const json = await auth.request<ApiResponse<{ usuarios: User[] }>>(`/empresas/${empresa.id}/usuarios`);
      setUsuarios(json.body.usuarios || []);
    } catch (err) {
      console.error("Error al cargar usuarios de la empresa", err);
    }
  }

  async function fetchDependencias() {
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const json = await auth.request<ApiResponse<{ dependencias: Dependencia[] }>>("/archivistica/dependencias");
      setDependencias(json.body.dependencias);
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

    const endpoint = isEditing 
      ? `/archivistica/dependencias/${currentId}`
      : `/archivistica/dependencias`;
    
    const method = isEditing ? "PUT" : "POST";

    try {
      await auth.request<ApiResponse<{ dependencia: Dependencia }>>(endpoint, {
        method,
        body: JSON.stringify({
          codigoDependencia: codigo,
          nombreDependencia: nombre,
          dependenciaPadreId: padreId || null,
          esJuntaDirectiva: esJunta,
          jefeDependenciaId: jefeId || null
        }),
      });

      resetForm();
      fetchDependencias();
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg || "Error al guardar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta dependencia?")) return;
    
    try {
      await auth.request<ApiResponse<{ success: boolean }>>(`/archivistica/dependencias/${id}`, {
        method: "DELETE",
      });
      fetchDependencias();
    } catch (err) {
      const errorMsg = (err as Error).message;
      alert(errorMsg || "No se pudo eliminar");
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
      await auth.request<ApiResponse<{ success: boolean }>>(`/empresas/${empresa.id}/onboarding/completar`, {
        method: "POST",
      });
      
      // Actualizar el estado local de la empresa
      const empresaActualizada = { ...empresa, onboardingCompleted: true };
      auth.setSelectedEmpresa(empresaActualizada);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg || "Error al completar el onboarding");
    }
  }

  function handleEdit(dep: Dependencia) {
    setIsEditing(true);
    setCurrentId(dep.id);
    setCodigo(dep.codigoDependencia);
    setNombre(dep.nombreDependencia);
    setPadreId(dep.dependenciaPadreId || "");
    setEsJunta(dep.esJuntaDirectiva);
    setJefeId(dep.jefeDependenciaId || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setIsEditing(false);
    setCurrentId("");
    setCodigo("");
    setNombre("");
    setPadreId("");
    setEsJunta(false);
    setJefeId("");
    setError("");
  }

  const getNombrePadre = (id?: string) => {
    if (!id) return "Nivel Superior";
    const padre = dependencias.find(d => d.id === id);
    return padre ? padre.nombreDependencia : "Desconocido";
  };

  const getNombreJefe = (jefeId?: string) => {
    if (!jefeId) return "";
    const u = usuarios.find(usr => usr.id === jefeId);
    return u ? u.name : "";
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
              {dep.jefeDependenciaId && (
                <span className="tree-node-jefe" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '3px' }}>
                  Jefe: {getNombreJefe(dep.jefeDependenciaId)}
                </span>
              )}
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

              <div>
                <label>Jefe de Dependencia / Responsable (Opcional)</label>
                <select 
                  className="edit-input" 
                  style={{ width: '100%' }}
                  value={jefeId}
                  onChange={(e) => setJefeId(e.target.value)}
                >
                  <option value="">Ninguno asignado</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
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
              <div style={{ marginTop: '30px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
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
                  <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Superior</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Jefe de Dependencia</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dependencias.map(dep => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '10px' }}><strong>{dep.codigoDependencia}</strong></td>
                      <td style={{ padding: '10px' }}>{dep.nombreDependencia}</td>
                      <td style={{ padding: '10px' }} className="text-muted">{getNombrePadre(dep.dependenciaPadreId)}</td>
                      <td style={{ padding: '10px' }}>
                        {getNombreJefe(dep.jefeDependenciaId) || (
                          <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>No asignado</span>
                        )}
                      </td>
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
                  <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '50px' }}>
                    <MdAccountTree size={60} style={{ opacity: 0.3 }} />
                    <p>No hay dependencias registradas aún. Empieza creando la Gerencia o nivel directivo.</p>
                  </div>
                ) : (
                  <Tree
                    lineWidth={'2px'}
                    lineColor={'var(--primary)'}
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
          border: 1px solid var(--glass-border);
          display: inline-block;
          background: var(--surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-1);
          min-width: 120px;
          position: relative;
        }
        .tree-node-code {
          display: block;
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--primary);
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
          color: var(--muted);
          padding: 2px;
        }
        .tree-node-actions button:hover {
          color: var(--primary);
        }
        .tree-node-actions button.danger:hover {
          color: #e74c3c;
        }
        .tree-root-label {
          padding: 15px;
          background: var(--primary);
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
