import { useState } from 'react';
import * as IconsMd from 'react-icons/md';
import type { RiesgoDeposito } from '../../types/types';

const MdAdd = (IconsMd as any).MdAdd;

interface RiesgoFormProps {
  onAgregar: (riesgo: RiesgoDeposito) => void;
}

export default function RiesgoForm({ onAgregar }: RiesgoFormProps) {
  const [codigoRiesgo, setCodigoRiesgo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [probabilidad, setProbabilidad] = useState<number>(1);
  const [impacto, setImpacto] = useState<number>(1);
  const [controles, setControles] = useState('');
  const [estado, setEstado] = useState<'activo' | 'mitigado' | 'materializado'>('activo');

  const nivelCalculado = probabilidad * impacto;

  function getClasificacionColor(nivel: number) {
    if (nivel <= 5) return { text: 'Bajo', color: '#2e7d32', bg: '#e8f5e9' };
    if (nivel <= 12) return { text: 'Medio', color: '#e65100', bg: '#fff3e0' };
    return { text: 'Alto / Crítico', color: '#c62828', bg: '#ffebee' };
  }

  const clasificacion = getClasificacionColor(nivelCalculado);

  function handleAgregar() {
    if (!codigoRiesgo.trim() || !descripcion.trim()) {
      alert('Por favor ingrese el código y la descripción del riesgo.');
      return;
    }
    onAgregar({
      codigoRiesgo: codigoRiesgo.trim(),
      descripcion: descripcion.trim(),
      probabilidad,
      impacto,
      controles: controles.trim(),
      estado
    });
    setCodigoRiesgo('');
    setDescripcion('');
    setProbabilidad(1);
    setImpacto(1);
    setControles('');
    setEstado('activo');
  }

  return (
    <div className="card" style={{ padding: '15px', backgroundColor: '#fafafa', border: '1px dashed #ccc', marginTop: '15px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Identificar Nuevo Riesgo en Depósito</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 2fr', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Código *</label>
          <input type="text" placeholder="Ej: R-01" value={codigoRiesgo} onChange={e => setCodigoRiesgo(e.target.value)} className="edit-input" style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Descripción del Riesgo *</label>
          <input type="text" placeholder="Ej: Humedad por filtración..." value={descripcion} onChange={e => setDescripcion(e.target.value)} className="edit-input" style={{ width: '100%', padding: '6px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Probabilidad (1-5)</label>
          <select value={probabilidad} onChange={e => setProbabilidad(Number(e.target.value))} className="edit-input" style={{ width: '100%', padding: '6px' }}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Impacto (1-5)</label>
          <select value={impacto} onChange={e => setImpacto(Number(e.target.value))} className="edit-input" style={{ width: '100%', padding: '6px' }}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Controles de Mitigación</label>
          <input type="text" placeholder="Ej: Sensor de humedad..." value={controles} onChange={e => setControles(e.target.value)} className="edit-input" style={{ width: '100%', padding: '6px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', marginRight: '6px' }}>Estado:</label>
            <select value={estado} onChange={e => setEstado(e.target.value as 'activo' | 'mitigado' | 'materializado')} className="edit-input" style={{ padding: '4px 8px' }}>
              <option value="activo">Activo</option>
              <option value="mitigado">Mitigado</option>
              <option value="materializado">Materializado</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Nivel Calculado:</span>
            <span style={{
              background: clasificacion.bg,
              color: clasificacion.color,
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              {nivelCalculado} ({clasificacion.text})
            </span>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAgregar} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 15px' }}><MdAdd /> Registrar Riesgo</button>
      </div>
    </div>
  );
}
