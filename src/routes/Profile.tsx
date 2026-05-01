import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdEdit = IconsMd.MdEdit as any;
const MdSave = IconsMd.MdSave as any;
const MdCancel = IconsMd.MdCancel as any;
const MdBusiness = IconsMd.MdBusiness as any;
const MdPerson = IconsMd.MdPerson as any;
const MdBadge = IconsMd.MdBadge as any;
const MdLocationOn = IconsMd.MdLocationOn as any;

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
  });

  useEffect(() => {
    if (selectedEmpresa) {
      setFormData({
        razonSocial: selectedEmpresa.razonSocial || "",
        nit: selectedEmpresa.nit || "",
        direccion: selectedEmpresa.direccion || "",
      });
    }
  }, [selectedEmpresa]);

  async function handleSave() {
    if (!selectedEmpresa) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${API_URL}/empresas/${selectedEmpresa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (response.ok) {
        setMessage({ text: "Información actualizada correctamente", type: "success" });
        setIsEditing(false);
        // Actualizar el estado global de la empresa seleccionada
        auth.setSelectedEmpresa({
          ...selectedEmpresa,
          razonSocial: formData.razonSocial,
          nit: formData.nit,
          direccion: formData.direccion
        });
      } else {
        setMessage({ text: json.body.error, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error de conexión con el servidor", type: "error" });
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
              <p className="text-muted">Gestiona la información legal y de contacto de este entorno.</p>
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
          <section className="card profile-info-card">
            <div className="info-row">
              <div className="info-label">
                <MdBusiness className="row-icon" />
                <span>Razón Social / Nombre</span>
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

            <div className="info-row">
              <div className="info-label">
                <MdBadge className="row-icon" />
                <span>{selectedEmpresa.isPersonal ? "Cédula / Identificación" : "NIT / RUT"}</span>
              </div>
              <div className="info-value">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.nit} 
                    onChange={(e) => setFormData({...formData, nit: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedEmpresa.nit}</span>
                )}
              </div>
            </div>

            <div className="info-row">
              <div className="info-label">
                <MdLocationOn className="row-icon" />
                <span>Dirección de Contacto</span>
              </div>
              <div className="info-value">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.direccion} 
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedEmpresa.direccion || "No especificada"}</span>
                )}
              </div>
            </div>
          </section>

          <section className="profile-sidebar">
            <div className="card status-card">
              <h3>Estado de la Cuenta</h3>
              <div className="status-badge active">Verificada</div>
              <p className="small text-muted" style={{marginTop: '10px'}}>
                Tu rol en esta entidad: <strong>{selectedEmpresa.rol}</strong>
              </p>
            </div>
            
            <div className="card info-box">
              <h4>Seguridad de Datos</h4>
              <p className="small">
                Los cambios en la identificación (NIT/Cédula) serán validados para evitar duplicidad en el sistema.
              </p>
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}
