import { useState } from 'react';
import * as IconsMd from 'react-icons/md';
import type { ActaComite, ComiteArchivo, CompromisoActa, User } from '../../types/types';

const MdAdd = (IconsMd as any).MdAdd;
const MdDelete = (IconsMd as any).MdDelete;

interface FormularioActaProps {
  acta: ActaComite | null;
  comites: ComiteArchivo[];
  usuarios: User[];
  onGuardar: (data: Partial<ActaComite>) => void;
  onCancelar: () => void;
}

export default function FormularioActa({
  acta,
  comites,
  usuarios,
  onGuardar,
  onCancelar
}: FormularioActaProps) {
  const [comiteId, setComiteId] = useState(acta?.comiteId ? (typeof acta.comiteId === 'object' ? acta.comiteId.id : acta.comiteId) : comites[0]?.id || '');
  const [numeroActa, setNumeroActa] = useState(acta?.numeroActa || '');
  const [fechaReunion, setFechaReunion] = useState(acta?.fechaReunion ? new Date(acta.fechaReunion).toISOString().slice(0, 16) : '');
  const [tipo, setTipo] = useState<'CONSTITUCION' | 'ORDINARIA' | 'EXTRAORDINARIA'>(acta?.tipo || 'ORDINARIA');
  const [desarrollo, setDesarrollo] = useState(acta?.desarrollo || '');

  // Temas Tratados
  const [temas, setTemas] = useState<string[]>(acta?.temasTratados || []);
  const [nuevoTema, setNuevoTema] = useState('');

  // Compromisos
  const [compromisos, setCompromisos] = useState<CompromisoActa[]>(acta?.compromisos || []);
  const [compDesc, setCompDesc] = useState('');
  const [compResp, setCompResp] = useState('');
  const [compFecha, setCompFecha] = useState('');

  function handleAgregarTema() {
    if (!nuevoTema.trim()) return;
    setTemas([...temas, nuevoTema.trim()]);
    setNuevoTema('');
  }

  function handleAgregarCompromiso() {
    if (!compDesc.trim()) {
      alert('La descripción del compromiso es requerida.');
      return;
    }
    const nuevo: CompromisoActa = {
      descripcion: compDesc.trim(),
      responsableId: compResp || undefined,
      fechaLimite: compFecha || undefined
    };
    setCompromisos([...compromisos, nuevo]);
    setCompDesc('');
    setCompResp('');
    setCompFecha('');
  }

  function handleGuardar() {
    if (!comiteId || !numeroActa || !fechaReunion || !desarrollo) {
      alert('Por favor complete los campos obligatorios: Comité, Número de Acta, Fecha y Desarrollo.');
      return;
    }
    onGuardar({
      comiteId,
      numeroActa,
      fechaReunion,
      tipo,
      desarrollo,
      temasTratados: temas,
      compromisos
    });
  }

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h3>{acta ? 'Editar Acta de Comité' : 'Nueva Acta de Comité'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
        <div>
          <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Comité *</label>
          <select value={comiteId} onChange={e => setComiteId(e.target.value)} className="edit-input" style={{ width: '100%' }}>
            <option value="">Seleccione Comité...</option>
            {comites.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Número de Acta *</label>
          <input type="text" value={numeroActa} onChange={e => setNumeroActa(e.target.value)} placeholder="Ej: 001-2026" className="edit-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Fecha y Hora *</label>
          <input type="datetime-local" value={fechaReunion} onChange={e => setFechaReunion(e.target.value)} className="edit-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Tipo de Sesión</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as 'CONSTITUCION' | 'ORDINARIA' | 'EXTRAORDINARIA')} className="edit-input" style={{ width: '100%' }}>
            <option value="ORDINARIA">Ordinaria</option>
            <option value="EXTRAORDINARIA">Extraordinaria</option>
            <option value="CONSTITUCION">Constitución</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Temas Tratados / Orden del Día</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={nuevoTema} onChange={e => setNuevoTema(e.target.value)} placeholder="Describa el tema" className="edit-input" style={{ flex: 1 }} />
          <button type="button" className="btn btn-secondary" onClick={handleAgregarTema} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdAdd /> Agregar</button>
        </div>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          {temas.map((t, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>
              {t} <button type="button" className="btn btn-link" onClick={() => setTemas(temas.filter((_, idx) => idx !== i))} style={{ padding: '0 5px', color: 'red', fontSize: '0.8rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Desarrollo de la Sesión *</label>
        <textarea rows={6} value={desarrollo} onChange={e => setDesarrollo(e.target.value)} placeholder="Redacte los pormenores, deliberaciones y acuerdos alcanzados..." className="edit-input" style={{ width: '100%', padding: '10px', resize: 'vertical' }} />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Compromisos y Tareas</label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#666' }}>Descripción</label>
            <input type="text" value={compDesc} onChange={e => setCompDesc(e.target.value)} placeholder="Compromiso" className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#666' }}>Responsable</label>
            <select value={compResp} onChange={e => setCompResp(e.target.value)} className="edit-input" style={{ width: '100%', padding: '4px' }}>
              <option value="">Seleccione...</option>
              {usuarios.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.nombre || u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#666' }}>Límite</label>
            <input type="date" value={compFecha} onChange={e => setCompFecha(e.target.value)} className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleAgregarCompromiso} style={{ padding: '6px 12px' }}><MdAdd /></button>
        </div>
        {compromisos.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Descripción</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Responsable</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Fecha Límite</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {compromisos.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '6px' }}>{c.descripcion}</td>
                  <td style={{ padding: '6px' }}>{typeof c.responsableId === 'object' ? c.responsableId.nombre : usuarios.find(u => (u.id || u._id) === c.responsableId)?.nombre || usuarios.find(u => (u.id || u._id) === c.responsableId)?.name || 'Sin asignar'}</td>
                  <td style={{ padding: '6px' }}>{c.fechaLimite ? new Date(c.fechaLimite).toLocaleDateString('es-CO') : '-'}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <button type="button" className="btn btn-icon" onClick={() => setCompromisos(compromisos.filter((_, idx) => idx !== i))} style={{ color: 'red' }}><MdDelete /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={handleGuardar}>Guardar Acta</button>
      </div>
    </div>
  );
}
