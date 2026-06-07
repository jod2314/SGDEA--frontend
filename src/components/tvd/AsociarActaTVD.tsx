import { useState } from 'react';
import type { ActaComite } from '../../types/types';

interface AsociarActaTVDProps {
  actas: ActaComite[];
  onAprobar: (actaId: string) => void;
  onCancelar: () => void;
}

export default function AsociarActaTVD({ actas, onAprobar, onCancelar }: AsociarActaTVDProps) {
  const [selectedActaId, setSelectedActaId] = useState('');

  function handleConfirmar() {
    if (!selectedActaId) {
      alert('Debe seleccionar un acta del comité.');
      return;
    }
    onAprobar(selectedActaId);
  }

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px', maxWidth: '500px' }}>
      <h3>Oficializar Tabla de Valoración Documental (TVD)</h3>
      <p className="text-muted" style={{ fontSize: '0.85rem', margin: '5px 0 15px 0' }}>
        Para oficializar la TVD y hacerla vigente, debe asociar el Acta del Comité de Archivo que la aprobó formalmente.
      </p>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
          Acta de Aprobación *
        </label>
        <select
          value={selectedActaId}
          onChange={e => setSelectedActaId(e.target.value)}
          className="edit-input"
          style={{ width: '100%' }}
        >
          <option value="">Seleccione un acta de la lista...</option>
          {actas.map(a => (
            <option key={a.id || a._id} value={a.id || a._id}>
              Acta No. {a.numeroActa} (Reunión: {new Date(a.fechaReunion).toLocaleDateString()})
            </option>
          ))}
        </select>
        {actas.length === 0 && (
          <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            ⚠️ No hay actas oficializadas/aprobadas disponibles. Oficialice un acta de comité primero.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleConfirmar}
          disabled={!selectedActaId}
        >
          Oficializar y Sincronizar
        </button>
      </div>
    </div>
  );
}
