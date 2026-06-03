import React, { useState, useEffect } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import { Entidad } from '../types/types';
import PortalLayout from '../layout/PortalLayout';

// Iconos usando el patrón recomendado
const MdPeople = (IconsMd as any).MdPeople;
const MdAdd = (IconsMd as any).MdAdd;
const MdSearch = (IconsMd as any).MdSearch;
const MdBusiness = (IconsMd as any).MdBusiness;
const MdPerson = (IconsMd as any).MdPerson;
const MdEmail = (IconsMd as any).MdEmail;
const MdPhone = (IconsMd as any).MdPhone;
const MdLocationOn = (IconsMd as any).MdLocationOn;
const MdClose = (IconsMd as any).MdClose;
const MdWarning = (IconsMd as any).MdWarning;

export default function Entidades() {
  const auth = useAuth();
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para el formulario/modal
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState<'NATURAL' | 'JURIDICA'>('NATURAL');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  
  const [errorForm, setErrorForm] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar las entidades asociadas a la empresa activa
  async function fetchEntidades() {
    setLoading(true);
    try {
      const response = await auth.request<any>('/entidades');
      if (response.statusCode === 200) {
        setEntidades(response.body.entidades || []);
      }
    } catch (err) {
      console.error('Error al obtener entidades:', err);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmpresa = auth.getSelectedEmpresa();

  useEffect(() => {
    fetchEntidades();
  }, [selectedEmpresa?.id]);

  // Limpiar campos del formulario
  function cleanForm() {
    setTipo('NATURAL');
    setNumeroIdentificacion('');
    setNombre('');
    setApellidos('');
    setRazonSocial('');
    setDireccion('');
    setTelefono('');
    setCorreo('');
    setCiudad('');
    setDepartamento('');
    setErrorForm('');
  }

  // Guardar nueva entidad
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm('');
    
    if (!numeroIdentificacion.trim() || !nombre.trim()) {
      setErrorForm('La identificación y el nombre completo son campos requeridos.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tipo,
        numeroIdentificacion: numeroIdentificacion.trim(),
        nombre: nombre.trim(),
        apellidos: tipo === 'NATURAL' ? apellidos.trim() : undefined,
        razonSocial: tipo === 'JURIDICA' ? razonSocial.trim() : undefined,
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        ciudad: ciudad.trim(),
        departamento: departamento.trim(),
      };

      const response = await auth.request<any>('/entidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.statusCode === 201) {
        setShowModal(false);
        cleanForm();
        fetchEntidades(); // Refrescar el listado
      } else {
        setErrorForm(response.body.error || 'Error al registrar la entidad');
      }
    } catch (err: any) {
      console.error('Error al registrar entidad:', err);
      setErrorForm(err.message || 'Error en la conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  }

  // Filtrado local de entidades
  const filteredEntidades = entidades.filter((ent) => {
    const query = searchQuery.toLowerCase();
    const nombreCompleto = `${ent.nombre} ${ent.apellidos || ''} ${ent.razonSocial || ''}`.toLowerCase();
    const idNum = ent.numeroIdentificacion.toLowerCase();
    const mail = (ent.correo || '').toLowerCase();
    return nombreCompleto.includes(query) || idNum.includes(query) || mail.includes(query);
  });

  return (
    <PortalLayout>
      <div className="entidades-container">
        
        {/* Cabecera */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdPeople style={{ color: 'var(--primary)' }} /> Terceros y Entidades
            </h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
              Administra los clientes, proveedores, ciudadanos o entidades externas asociadas a la gestión documental.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => { cleanForm(); setShowModal(true); }}
            style={{ borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MdAdd size={20} /> Registrar Tercero
          </button>
        </div>

        {/* Buscador */}
        <div className="card search-card" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f3f4', borderRadius: '8px', padding: '8px 16px' }}>
            <MdSearch size={22} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, identificación o correo electrónico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '1rem',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Listado */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="text-muted">Cargando terceros...</div>
        ) : filteredEntidades.length === 0 ? (
          <div className="card center" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <MdPeople size={48} style={{ color: 'var(--muted)', marginBottom: '16px' }} />
            <h3>No se encontraron terceros</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '8px auto' }}>
              {searchQuery ? 'Prueba refinando los criterios de búsqueda.' : 'Aún no has registrado terceros en esta organización. Comienza creando uno nuevo.'}
            </p>
          </div>
        ) : (
          <div className="entidades-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredEntidades.map((ent) => (
              <div className="card entidad-card" key={ent.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                
                {/* Tipo de entidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: ent.tipo === 'JURIDICA' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(26, 115, 232, 0.1)',
                    color: ent.tipo === 'JURIDICA' ? '#34a853' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {ent.tipo === 'JURIDICA' ? <MdBusiness size={18} /> : <MdPerson size={18} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {ent.tipo === 'JURIDICA' ? ent.razonSocial : `${ent.nombre} ${ent.apellidos || ''}`}
                    </h4>
                    <span className="small text-muted" style={{ fontSize: '0.8rem' }}>
                      {ent.tipo === 'JURIDICA' ? 'Persona Jurídica' : 'Persona Natural'} • CC/NIT: {ent.numeroIdentificacion}
                    </span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid rgba(60,64,67,0.08)' }}></div>

                {/* Detalles de contacto */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  {ent.correo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MdEmail size={16} /> <span>{ent.correo}</span>
                    </div>
                  )}
                  {ent.telefono && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MdPhone size={16} /> <span>{ent.telefono}</span>
                    </div>
                  )}
                  {(ent.direccion || ent.ciudad) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MdLocationOn size={16} />
                      <span>
                        {ent.direccion ? `${ent.direccion}, ` : ''}{ent.ciudad || ''} {ent.departamento ? `(${ent.departamento})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Registro */}
        {showModal && (
          <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card modal-content" style={{
              width: '100%',
              maxWidth: '550px',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
              background: 'white',
              position: 'relative'
            }}>
              
              <button 
                className="icon-btn" 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px' }}
              >
                <MdClose size={24} />
              </button>

              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Registrar Tercero / Entidad</h2>
              
              {errorForm && (
                <div style={{ 
                  background: 'rgba(217,48,37,0.06)', 
                  color: 'var(--danger)', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem'
                }}>
                  <MdWarning />
                  <span>{errorForm}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Tipo de Persona */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Tipo de Persona</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="tipoPersona" 
                        checked={tipo === 'NATURAL'} 
                        onChange={() => { setTipo('NATURAL'); }} 
                      />
                      <span>Natural</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="tipoPersona" 
                        checked={tipo === 'JURIDICA'} 
                        onChange={() => { setTipo('JURIDICA'); }} 
                      />
                      <span>Jurídica</span>
                    </label>
                  </div>
                </div>

                {/* Número Identificación */}
                <div>
                  <label htmlFor="identificacion" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>
                    Número de Identificación (Cédula o NIT) *
                  </label>
                  <input 
                    type="text" 
                    id="identificacion"
                    className="form-input-custom"
                    value={numeroIdentificacion}
                    onChange={(e) => setNumeroIdentificacion(e.target.value)}
                    placeholder="Ej: 10203040 ó 900.123.456-7"
                    required
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(60,64,67,0.2)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Nombres / Razón Social */}
                {tipo === 'NATURAL' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label htmlFor="nombre" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Nombres *</label>
                      <input 
                        type="text" 
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombres"
                        required
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(60,64,67,0.2)',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidos" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Apellidos</label>
                      <input 
                        type="text" 
                        id="apellidos"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        placeholder="Apellidos"
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(60,64,67,0.2)',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="razonSocial" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Razón Social *</label>
                    <input 
                      type="text" 
                      id="razonSocial"
                      value={nombre} // Envíamos la razón social en la propiedad 'nombre' como exige la validación backend
                      onChange={(e) => {
                        setNombre(e.target.value);
                        setRazonSocial(e.target.value);
                      }}
                      placeholder="Nombre de la empresa o entidad"
                      required
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(60,64,67,0.2)',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Contacto (Email & Telefono) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="correo" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Correo Electrónico</label>
                    <input 
                      type="email" 
                      id="correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(60,64,67,0.2)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Teléfono</label>
                    <input 
                      type="text" 
                      id="telefono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 3001234567"
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(60,64,67,0.2)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Ubicación (Ciudad & Dirección) */}
                <div>
                  <label htmlFor="direccion" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Dirección de Contacto</label>
                  <input 
                    type="text" 
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, Avenida, Oficina..."
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(60,64,67,0.2)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="ciudad" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Ciudad</label>
                    <input 
                      type="text" 
                      id="ciudad"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder="Ciudad"
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(60,64,67,0.2)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="departamento" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Departamento</label>
                    <input 
                      type="text" 
                      id="departamento"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      placeholder="Departamento"
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(60,64,67,0.2)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => setShowModal(false)}
                    style={{ borderRadius: '22px', height: '40px' }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ borderRadius: '22px', height: '40px' }}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Registrar'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
