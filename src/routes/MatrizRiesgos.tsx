import { useEffect, useState } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import PortalLayout from '../layout/PortalLayout';
import RiesgoForm from '../components/riesgos/RiesgoForm';
import type { MatrizRiesgosDeposito, RiesgoDeposito } from '../types/types';

const MdSecurity = (IconsMd as any).MdSecurity;
const MdDelete = (IconsMd as any).MdDelete;
const MdSave = (IconsMd as any).MdSave;

export default function MatrizRiesgos() {
  const auth = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [riesgos, setRiesgos] = useState<RiesgoDeposito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMatriz();
  }, []);

  async function cargarMatriz() {
    try {
      const res = await auth.request<{ body: { matriz: MatrizRiesgosDeposito } }>('/matriz-riesgos');
      if (res.body.matriz) {
        const m = res.body.matriz;
        setNombre(m.nombre);
        setDescripcion(m.descripcion || '');
        setRiesgos(m.riesgos || []);
      } else {
        setNombre('Matriz de Conservación Preventiva y Gestión de Riesgos');
        setDescripcion('Identificación y mitigación de riesgos físicos, químicos, biológicos y ambientales en depósitos.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleAgregarRiesgo(nuevo: RiesgoDeposito) {
    setRiesgos([...riesgos, nuevo]);
  }

  function handleRemoverRiesgo(idx: number) {
    setRiesgos(riesgos.filter((_, i) => i !== idx));
  }

  async function handleGuardarMatriz() {
    if (!nombre.trim()) {
      alert('El nombre de la matriz es obligatorio.');
      return;
    }
    try {
      await auth.request<{ body: { matriz: MatrizRiesgosDeposito } }>('/matriz-riesgos', {
        method: 'POST',
        body: JSON.stringify({ nombre, descripcion, riesgos })
      });
      alert('Matriz de riesgos de depósito guardada con éxito.');
      cargarMatriz();
    } catch (e) {
      const err = e as Error;
      alert(err.message || 'Error al guardar la matriz de riesgos.');
    }
  }

  function getClasificacionStyle(nivel?: number) {
    const n = nivel || 0;
    if (n <= 5) return { color: '#2e7d32', bg: '#e8f5e9' };
    if (n <= 12) return { color: '#e65100', bg: '#fff3e0' };
    return { color: '#c62828', bg: '#ffebee' };
  }

  return (
    <PortalLayout>
      <div style={{ padding: '20px' }}>
        <h2><MdSecurity /> Matriz de Riesgos de Depósitos</h2>
        <p className="text-muted">Gestión de riesgos físicos, biológicos y ambientales para la conservación preventiva de fondos acumulados.</p>

        {loading ? (
          <div>Cargando matriz de riesgos...</div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Nombre de la Matriz *</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="edit-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Descripción</label>
                  <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="edit-input" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Prob.</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Imp.</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Nivel</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Controles</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {riesgos.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No hay riesgos registrados. Ingrese un nuevo riesgo abajo.</td>
                    </tr>
                  ) : (
                    riesgos.map((r, idx) => {
                      const style = getClasificacionStyle(r.nivelRiesgo || (r.probabilidad * r.impacto));
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.codigoRiesgo}</td>
                          <td style={{ padding: '10px' }}>{r.descripcion}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{r.probabilidad}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{r.impacto}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{ color: style.color, background: style.bg, padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {r.nivelRiesgo || (r.probabilidad * r.impacto)}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: '#555' }}>{r.controles || 'N/A'}</td>
                          <td style={{ padding: '10px' }}><span className="badge" style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{r.estado}</span></td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button className="btn btn-icon" onClick={() => handleRemoverRiesgo(idx)} style={{ color: 'red' }}><MdDelete /></button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <RiesgoForm onAgregar={handleAgregarRiesgo} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleGuardarMatriz} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MdSave /> Guardar Matriz de Riesgos</button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
