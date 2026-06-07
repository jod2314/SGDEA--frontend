import { useEffect, useState } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import PortalLayout from '../layout/PortalLayout';
import FormularioTVD from '../components/tvd/FormularioTVD';
import AsociarActaTVD from '../components/tvd/AsociarActaTVD';
import type { TablaValoracionDocumental, ActaComite } from '../types/types';

const MdAssignment = (IconsMd as any).MdAssignment;
const MdEdit = (IconsMd as any).MdEdit;
const MdDelete = (IconsMd as any).MdDelete;
const MdVerified = (IconsMd as any).MdVerified;

export default function TablaValoracion() {
  const auth = useAuth();
  const [tvds, setTvds] = useState<TablaValoracionDocumental[]>([]);
  const [actas, setActas] = useState<ActaComite[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedTvd, setSelectedTvd] = useState<TablaValoracionDocumental | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const resTvd = await auth.request<{ body: { tvds: TablaValoracionDocumental[] } }>('/tvd');
      setTvds(resTvd.body.tvds);
      const resActas = await auth.request<{ body: { actas: ActaComite[] } }>('/comites/actas');
      setActas((resActas.body.actas || []).filter((a: ActaComite) => a.estado === 'aprobada'));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGuardarTVD(tvdData: Partial<TablaValoracionDocumental>) {
    try {
      if (selectedTvd) {
        await auth.request<{ body: { tvd: TablaValoracionDocumental } }>(`/tvd/${selectedTvd.id || selectedTvd._id}`, {
          method: 'PUT',
          body: JSON.stringify(tvdData)
        });
      } else {
        await auth.request<{ body: { tvd: TablaValoracionDocumental } }>('/tvd', {
          method: 'POST',
          body: JSON.stringify(tvdData)
        });
      }
      setIsEditing(false);
      setSelectedTvd(null);
      cargarDatos();
    } catch (e) {
      const err = e as Error;
      alert(err.message || 'Error al guardar la TVD.');
    }
  }

  async function handleAprobarTVD(actaAprobacionId: string) {
    if (!selectedTvd) return;
    try {
      await auth.request<{ body: { tvd: TablaValoracionDocumental } }>(`/tvd/${selectedTvd.id || selectedTvd._id}/aprobar`, {
        method: 'POST',
        body: JSON.stringify({ actaAprobacionId })
      });
      setIsApproving(false);
      setSelectedTvd(null);
      cargarDatos();
      alert('TVD oficializada e incorporada con éxito.');
    } catch (e) {
      const err = e as Error;
      alert(err.message || 'Error al aprobar la TVD.');
    }
  }

  async function handleEliminarTVD(tvdId: string) {
    if (!confirm('¿Está seguro de eliminar esta Tabla de Valoración en borrador?')) return;
    try {
      await auth.request<{ body: { success: boolean } }>(`/tvd/${tvdId}`, { method: 'DELETE' });
      cargarDatos();
    } catch (e) {
      const err = e as Error;
      alert(err.message || 'Error al eliminar la TVD.');
    }
  }

  return (
    <PortalLayout>
      <div style={{ padding: '20px' }}>
        <h2><MdAssignment /> Tabla de Valoración Documental (TVD)</h2>
        <p className="text-muted">Gestión de series documentales aplicadas a los fondos acumulados históricos de la empresa.</p>

        {!isEditing && !isApproving ? (
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => { setSelectedTvd(null); setIsEditing(true); }} style={{ marginBottom: '15px' }}>Nueva TVD</button>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Versión</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Series</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tvds.map(t => (
                    <tr key={t.id || t._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.version}</td>
                      <td style={{ padding: '10px' }}>{t.nombre}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{t.series.length}</td>
                      <td style={{ padding: '10px' }}><span className="badge" style={{ background: t.estado === 'aprobada' ? '#e8f5e9' : '#fff3e0', color: t.estado === 'aprobada' ? '#2e7d32' : '#e65100', padding: '3px 8px', borderRadius: '4px' }}>{t.estado.toUpperCase()}</span></td>
                      <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        {t.estado === 'borrador' && (
                          <>
                            <button className="btn btn-secondary" onClick={() => { setSelectedTvd(t); setIsEditing(true); }}><MdEdit /> Editar</button>
                            <button className="btn btn-primary" onClick={() => { setSelectedTvd(t); setIsApproving(true); }} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MdVerified /> Oficializar</button>
                            <button className="btn btn-icon" onClick={() => handleEliminarTVD((t.id || t._id)!)} style={{ color: 'red' }}><MdDelete /></button>
                          </>
                        )}
                        {t.estado === 'aprobada' && <span style={{ color: 'green', fontSize: '0.85rem' }}>Vigente (Sincronizada)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : isEditing ? (
          <FormularioTVD tvd={selectedTvd} onGuardar={handleGuardarTVD} onCancelar={() => { setIsEditing(false); setSelectedTvd(null); }} />
        ) : (
          <AsociarActaTVD actas={actas} onAprobar={handleAprobarTVD} onCancelar={() => { setIsApproving(false); setSelectedTvd(null); }} />
        )}
      </div>
    </PortalLayout>
  );
}
