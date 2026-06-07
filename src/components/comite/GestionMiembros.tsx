import { useState } from 'react';
import * as IconsMd from 'react-icons/md';
import type { MiembroComite, User } from '../../types/types';

const MdDelete = (IconsMd as any).MdDelete;
const MdAdd = (IconsMd as any).MdAdd;
const MdPersonAdd = (IconsMd as any).MdPersonAdd;

interface GestionMiembrosProps {
  miembrosIniciales: MiembroComite[];
  usuariosEmpresa: User[];
  onGuardar: (miembros: MiembroComite[]) => void;
  onCancelar: () => void;
}

export default function GestionMiembros({
  miembrosIniciales,
  usuariosEmpresa,
  onGuardar,
  onCancelar
}: GestionMiembrosProps) {
  const [miembros, setMiembros] = useState<MiembroComite[]>(miembrosIniciales);
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState('');
  const [nuevoCargo, setNuevoCargo] = useState('');
  const [nuevoRol, setNuevoRol] = useState<'Presidente' | 'Secretario Técnico' | 'Miembro Vocal' | 'Invitado'>('Miembro Vocal');

  function handleAgregarMiembro() {
    if (!nuevoUsuarioId || !nuevoCargo) {
      alert('Debe seleccionar un usuario y definir su cargo.');
      return;
    }

    const existe = miembros.some(m => {
      const uId = typeof m.usuarioId === 'object' ? m.usuarioId.id : m.usuarioId;
      return uId === nuevoUsuarioId;
    });

    if (existe) {
      alert('Este usuario ya es miembro de este comité.');
      return;
    }

    const usuarioSelect = usuariosEmpresa.find(u => (u.id || u._id) === nuevoUsuarioId);
    if (!usuarioSelect) return;

    const nuevoMiembro: MiembroComite = {
      usuarioId: {
        id: usuarioSelect.id || usuarioSelect._id || '',
        nombre: usuarioSelect.nombre || usuarioSelect.name || '',
        email: usuarioSelect.email || usuarioSelect.username || '',
        _id: usuarioSelect._id
      },
      cargo: nuevoCargo,
      rolComite: nuevoRol
    };

    setMiembros([...miembros, nuevoMiembro]);
    setNuevoUsuarioId('');
    setNuevoCargo('');
    setNuevoRol('Miembro Vocal');
  }

  function handleRemoverMiembro(idx: number) {
    const list = [...miembros];
    list.splice(idx, 1);
    setMiembros(list);
  }

  function handleGuardarTodo() {
    onGuardar(miembros);
  }

  return (
    <div className="gestion-miembros" style={{ marginTop: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <MdPersonAdd /> Configurar Miembros del Comité
      </h3>

      {/* Agregar Miembro Form */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#fdfdfd', border: '1px dashed #ccc' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Agregar Integrante</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Usuario</label>
            <select
              className="edit-input"
              style={{ width: '100%', padding: '6px' }}
              value={nuevoUsuarioId}
              onChange={e => setNuevoUsuarioId(e.target.value)}
            >
              <option value="">Seleccione un usuario...</option>
              {usuariosEmpresa.map(u => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.nombre || u.name} ({u.email || u.username || ''})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Cargo en la Entidad</label>
            <input
              type="text"
              placeholder="Ej: Jefe de Planeación"
              className="edit-input"
              style={{ width: '100%', padding: '6px' }}
              value={nuevoCargo}
              onChange={e => setNuevoCargo(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Rol en Comité</label>
            <select
              className="edit-input"
              style={{ width: '100%', padding: '6px' }}
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value as 'Presidente' | 'Secretario Técnico' | 'Miembro Vocal' | 'Invitado')}
            >
              <option value="Presidente">Presidente</option>
              <option value="Secretario Técnico">Secretario Técnico</option>
              <option value="Miembro Vocal">Miembro Vocal</option>
              <option value="Invitado">Invitado</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}
            onClick={handleAgregarMiembro}
          >
            <MdAdd /> Agregar
          </button>
        </div>
      </div>

      {/* Lista de Miembros */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Nombre / Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Cargo Entidad</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Rol Comité</th>
              <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {miembros.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  No hay miembros configurados en el comité.
                </td>
              </tr>
            ) : (
              miembros.map((m, index) => {
                const u = typeof m.usuarioId === 'object' ? m.usuarioId : null;
                const nombre = u ? u.nombre : 'Usuario no cargado';
                const email = u ? u.email : '';
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      <strong>{nombre}</strong>
                      {email && <div style={{ fontSize: '0.75rem', color: '#666' }}>{email}</div>}
                    </td>
                    <td style={{ padding: '10px' }}>{m.cargo}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge" style={{
                        background: m.rolComite === 'Presidente' ? '#e8f5e9' : m.rolComite === 'Secretario Técnico' ? '#e3f2fd' : '#f5f5f5',
                        color: m.rolComite === 'Presidente' ? '#2e7d32' : m.rolComite === 'Secretario Técnico' ? '#1565c0' : '#333',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {m.rolComite}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-icon"
                        style={{ color: '#d32f2f' }}
                        title="Remover Miembro"
                        onClick={() => handleRemoverMiembro(index)}
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Botones de acción general */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleGuardarTodo}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
