import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { Link } from "react-router-dom";
import { Empresa, ApiResponse } from "../types/types";

const MdEdit = IconsMd.MdEdit as any;
const MdSave = IconsMd.MdSave as any;
const MdCancel = IconsMd.MdCancel as any;
const MdBusiness = IconsMd.MdBusiness as any;
const MdPerson = IconsMd.MdPerson as any;
const MdBadge = IconsMd.MdBadge as any;
const MdLocationOn = IconsMd.MdLocationOn as any;
const MdPhone = IconsMd.MdPhone as any;
const MdEmail = IconsMd.MdEmail as any;
const MdAccountTree = IconsMd.MdAccountTree as any;
const MdPhotoSizeSelectLarge = IconsMd.MdPhotoSizeSelectLarge as any;

export default function Profile() {
  const auth = useAuth();
  const selectedEmpresa = auth.getSelectedEmpresa();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    razonSocial: "",
    nit: "",
    direccion: "",
    tipoPersona: "juridica" as "natural" | "juridica",
    nombreComercial: "",
    sigla: "",
    ciudad: "",
    departamento: "",
    telefono: "",
    correo: "",
    sitioWeb: "",
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    logoAlturaMm: 25,
    logoAnchoMm: 60,
    digitoVerificacion: ""
  });

  useEffect(() => {
    if (selectedEmpresa) {
      setFormData({
        razonSocial: selectedEmpresa.razonSocial || "",
        nit: selectedEmpresa.nit || "",
        direccion: selectedEmpresa.direccion || "",
        tipoPersona: selectedEmpresa.tipoPersona || "juridica",
        nombreComercial: selectedEmpresa.nombreComercial || "",
        sigla: selectedEmpresa.sigla || "",
        ciudad: selectedEmpresa.ciudad || "",
        departamento: selectedEmpresa.departamento || "",
        telefono: selectedEmpresa.telefono || "",
        correo: selectedEmpresa.correo || "",
        sitioWeb: selectedEmpresa.sitioWeb || "",
        nombres: selectedEmpresa.nombres || "",
        primerApellido: selectedEmpresa.primerApellido || "",
        segundoApellido: selectedEmpresa.segundoApellido || "",
        logoAlturaMm: selectedEmpresa.logoAlturaMm || 25,
        logoAnchoMm: selectedEmpresa.logoAnchoMm || 60,
        digitoVerificacion: selectedEmpresa.digitoVerificacion || ""
      });
    }
  }, [selectedEmpresa]);

  async function handleSave() {
    if (!selectedEmpresa) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await auth.request<ApiResponse<{ empresa: Empresa }>>(`/empresas/${selectedEmpresa.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      setMessage({ text: "Información actualizada correctamente", type: "success" });
      setIsEditing(false);
      auth.setSelectedEmpresa({
        ...selectedEmpresa,
        ...formData
      });
    } catch (error) {
      const err = error as Error;
      setMessage({ text: err.message || "Error de conexión con el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (!selectedEmpresa) return <PortalLayout><div>Cargando perfil...</div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-avatar-section">
            <div className={`profile-icon-large ${selectedEmpresa.isPersonal ? 'personal' : 'corporate'}`}>
              {selectedEmpresa.isPersonal ? <MdPerson /> : <MdBusiness />}
            </div>
            <div className="profile-title-section">
              <h1>Perfil de {selectedEmpresa.isPersonal ? "Persona Natural" : "Persona Jurídica"}</h1>
              <p className="text-muted">Gestiona la información legal, de contacto y estructura de este entorno.</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <MdEdit /> Editar Perfil
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                <MdSave /> {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                <MdCancel /> Cancelar
              </button>
            </div>
          )}
        </header>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-info' : 'errorMessage'}`} style={{marginBottom: '20px'}}>
            {message.text}
          </div>
        )}

        <div className="profile-grid">
          <div className="profile-main-content">
            <section className="card profile-info-card">
              <h3>Información Identitaria</h3>
              
              {!selectedEmpresa.isPersonal && (
                <div className="info-row">
                  <div className="info-label">
                    <MdBusiness className="row-icon" />
                    <span>Razón Social</span>
                  </div>
                  <div className="info-value">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.razonSocial} 
                        onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      <span>{selectedEmpresa.razonSocial}</span>
                    )}
                  </div>
                </div>
              )}

              {selectedEmpresa.isPersonal && (
                <>
                  <div className="info-row">
                    <div className="info-label"><MdPerson className="row-icon" /><span>Nombres</span></div>
                    <div className="info-value">
                      {isEditing ? (
                        <input type="text" value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} className="edit-input" />
                      ) : (<span>{selectedEmpresa.nombres}</span>)}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label"><MdPerson className="row-icon" /><span>Apellidos</span></div>
                    <div className="info-value">
                      {isEditing ? (
                        <div style={{display: 'flex', gap: '10px'}}>
                          <input type="text" placeholder="Primer Apellido" value={formData.primerApellido} onChange={(e) => setFormData({...formData, primerApellido: e.target.value})} className="edit-input" />
                          <input type="text" placeholder="Segundo Apellido" value={formData.segundoApellido} onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})} className="edit-input" />
                        </div>
                      ) : (<span>{selectedEmpresa.primerApellido} {selectedEmpresa.segundoApellido}</span>)}
                    </div>
                  </div>
                </>
              )}

              <div className="info-row">
                <div className="info-label">
                  <MdBadge className="row-icon" />
                  <span>{selectedEmpresa.isPersonal ? "Cédula / Identificación" : "NIT / RUT"}</span>
                </div>
                <div className="info-value">
                  {isEditing ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <input 
                        type="text" 
                        value={formData.nit} 
                        onChange={(e) => setFormData({...formData, nit: e.target.value})}
                        className="edit-input"
                      />
                      {!selectedEmpresa.isPersonal && (
                        <>
                          <span>-</span>
                          <input 
                            type="text" 
                            maxLength={1}
                            style={{width: '40px', textAlign: 'center'}}
                            value={formData.digitoVerificacion} 
                            onChange={(e) => setFormData({...formData, digitoVerificacion: e.target.value})}
                            className="edit-input"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <span>{selectedEmpresa.nit}{selectedEmpresa.digitoVerificacion ? `-${selectedEmpresa.digitoVerificacion}` : ''}</span>
                  )}
                </div>
              </div>

              {!selectedEmpresa.isPersonal && (
                <div className="info-row">
                  <div className="info-label">
                    <MdBusiness className="row-icon" />
                    <span>Sigla / Nombre Corto</span>
                  </div>
                  <div className="info-value">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.sigla} 
                        onChange={(e) => setFormData({...formData, sigla: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      <span>{selectedEmpresa.sigla || "No definida"}</span>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="card profile-info-card" style={{marginTop: '20px'}}>
              <h3>Ubicación y Contacto</h3>
              <div className="info-row">
                <div className="info-label"><MdLocationOn className="row-icon" /><span>Dirección</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="edit-input" />
                  ) : (<span>{selectedEmpresa.direccion || "No especificada"}</span>)}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label"><MdLocationOn className="row-icon" /><span>Ciudad / Depto</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input type="text" placeholder="Ciudad" value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} className="edit-input" />
                      <input type="text" placeholder="Departamento" value={formData.departamento} onChange={(e) => setFormData({...formData, departamento: e.target.value})} className="edit-input" />
                    </div>
                  ) : (<span>{selectedEmpresa.ciudad} {selectedEmpresa.departamento ? `, ${selectedEmpresa.departamento}` : ''}</span>)}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label"><MdPhone className="row-icon" /><span>Teléfono</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="edit-input" />
                  ) : (<span>{selectedEmpresa.telefono || "No especificado"}</span>)}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label"><MdEmail className="row-icon" /><span>Correo Electrónico</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} className="edit-input" />
                  ) : (<span>{selectedEmpresa.correo || "No especificado"}</span>)}
                </div>
              </div>
            </section>

            <section className="card profile-info-card" style={{marginTop: '20px'}}>
              <h3>Parametrización Visual (Logo)</h3>
              <div className="info-row">
                <div className="info-label"><MdPhotoSizeSelectLarge className="row-icon" /><span>Dimensiones en PDF (mm)</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <label>Ancho:</label>
                      <input type="number" value={formData.logoAnchoMm} onChange={(e) => setFormData({...formData, logoAnchoMm: Number(e.target.value)})} className="edit-input" style={{width: '70px'}} />
                      <label>Alto:</label>
                      <input type="number" value={formData.logoAlturaMm} onChange={(e) => setFormData({...formData, logoAlturaMm: Number(e.target.value)})} className="edit-input" style={{width: '70px'}} />
                    </div>
                  ) : (<span>{selectedEmpresa.logoAnchoMm}mm x {selectedEmpresa.logoAlturaMm}mm</span>)}
                </div>
              </div>
            </section>
          </div>

          <aside className="profile-sidebar">
            <div className="card hierarchy-card" style={{border: '2px solid var(--primary)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
                <MdAccountTree size={24} color="var(--primary)" />
                <h3 style={{margin: 0}}>Jerarquía Organizacional</h3>
              </div>
              <p className="small">Define el organigrama, las dependencias y oficinas productoras de esta entidad.</p>
              <Link to="/estructura-organizacional" className="btn btn-primary" style={{width: '100%', marginTop: '10px', textDecoration: 'none', textAlign: 'center'}}>
                Gestionar Estructura
              </Link>
            </div>

            <div className="card status-card" style={{marginTop: '20px'}}>
              <h3>Estado de la Entidad</h3>
              <div className="status-badge active">Verificada</div>
              <p className="small text-muted" style={{marginTop: '10px'}}>
                Tu rol: <strong>{selectedEmpresa.rol}</strong>
              </p>
              <p className="small text-muted">
                Tipo: <strong>{selectedEmpresa.isPersonal ? 'Persona Natural' : 'Persona Jurídica'}</strong>
              </p>
            </div>
            
            <div className="card info-box" style={{marginTop: '20px'}}>
              <h4>Integridad Archivística</h4>
              <p className="small">
                La información aquí registrada (Razón Social, NIT, Sigla y Dependencias) se inyectará automáticamente en los encabezados y metadatos de los documentos generados.
              </p>
            </div>
          </aside>
        </div>
      </div>
      
      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-top: 20px;
        }
        .info-row {
          padding: 12px 0;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          flex: 0 0 200px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .row-icon {
          font-size: 1.1rem;
          color: var(--muted);
        }
        .info-value {
          flex: 1;
          font-weight: 400;
        }
        .profile-icon-large {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
        }
        .profile-icon-large.corporate { background: var(--primary); }
        .profile-icon-large.personal { background: #2ecc71; }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .status-badge.active {
          background: var(--primary-light-2);
          color: var(--primary);
        }
        .hierarchy-card {
          background: var(--primary-light-1);
          border-color: var(--primary);
        }
      `}</style>
    </PortalLayout>
  );
}

