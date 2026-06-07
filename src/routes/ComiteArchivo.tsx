import { useEffect, useState } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import PortalLayout from '../layout/PortalLayout';
import GestionMiembros from '../components/comite/GestionMiembros';
import FormularioActa from '../components/comite/FormularioActa';
import type { ComiteArchivo, ActaComite, User, MiembroComite } from '../types/types';

const MdPeople = (IconsMd as any).MdPeople;
const MdPictureAsPdf = (IconsMd as any).MdPictureAsPdf;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdEdit = (IconsMd as any).MdEdit;

export default function ComiteArchivo() {
  const auth = useAuth();
  const activeEmpresa = auth.getSelectedEmpresa();
  const [activeTab, setActiveTab] = useState<'comite' | 'actas'>('comite');
  const [comites, setComites] = useState<ComiteArchivo[]>([]);
  const [actas, setActas] = useState<ActaComite[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isEditingMiembros, setIsEditingMiembros] = useState(false);
  const [isEditingActa, setIsEditingActa] = useState(false);
  const [selectedActa, setSelectedActa] = useState<ActaComite | null>(null);

  useEffect(() => {
    if (activeEmpresa?.id) {
      cargarDatos();
    }
  }, [activeEmpresa]);

  async function cargarDatos() {
    try {
      const resCom = await auth.request<{ body: { comites: ComiteArchivo[] } }>('/comites');
      setComites(resCom.body.comites);
      const resAct = await auth.request<{ body: { actas: ActaComite[] } }>('/comites/actas');
      setActas(resAct.body.actas);
      const resUser = await auth.request<{ body: { usuarios: User[] } }>(`/empresas/${activeEmpresa?.id}/usuarios`);
      setUsuarios(resUser.body.usuarios);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleGuardarComiteMiembros(miembrosActualizados: MiembroComite[]) {
    try {
      const comite = comites[0];
      if (comite) {
        await auth.request<{ body: { comite: ComiteArchivo } }>(`/comites/${comite.id}`, {
          method: 'PUT',
          body: JSON.stringify({ miembros: miembrosActualizados })
        });
      } else {
        await auth.request<{ body: { comite: ComiteArchivo } }>('/comites', {
          method: 'POST',
          body: JSON.stringify({ nombre: 'Comité de Archivo de la Empresa', miembros: miembrosActualizados })
        });
      }
      setIsEditingMiembros(false);
      cargarDatos();
    } catch (e) {
      alert('Error al guardar el comité en el sistema.');
    }
  }

  async function handleGuardarActa(actaData: Partial<ActaComite>) {
    try {
      if (selectedActa) {
        await auth.request<{ body: { acta: ActaComite } }>(`/comites/actas/${selectedActa.id || selectedActa._id}`, {
          method: 'PUT',
          body: JSON.stringify(actaData)
        });
      } else {
        await auth.request<{ body: { acta: ActaComite } }>('/comites/actas', {
          method: 'POST',
          body: JSON.stringify(actaData)
        });
      }
      setIsEditingActa(false);
      setSelectedActa(null);
      cargarDatos();
    } catch (e) {
      const err = e as Error;
      alert(err.message || 'Error al guardar el acta correspondiente.');
    }
  }

  async function handleOficializarActa(actaId: string) {
    try {
      const blob = await auth.request<Blob>(`/comites/actas/${actaId}/oficializar`, {
        method: 'POST',
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `acta-oficializada-${actaId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      cargarDatos();
    } catch (e) {
      alert('Error al oficializar el acta del comité.');
    }
  }

  async function handleDescargarPDF(actaId: string) {
    try {
      const blob = await auth.request<Blob>(`/comites/actas/${actaId}/pdf`, {
        method: 'GET',
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `acta-comite-${actaId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error al descargar el archivo PDF del acta.');
    }
  }

  return (
    <PortalLayout>
      <div style={{ padding: '20px' }}>
        <h2><MdPeople /> Gestión del Comité de Archivo</h2>
        <p className="text-muted">Administración de actas, decisiones de disposición final y participantes del comité.</p>

        {/* Pestañas de navegación */}
        <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #ddd', margin: '20px 0 10px 0' }}>
          <button onClick={() => setActiveTab('comite')} className={`btn ${activeTab === 'comite' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '4px 4px 0 0' }}>Comité de Archivo</button>
          <button onClick={() => setActiveTab('actas')} className={`btn ${activeTab === 'actas' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', borderRadius: '4px 4px 0 0' }}>Actas del Comité</button>
        </div>

        {activeTab === 'comite' && (
          <div>
            {!isEditingMiembros ? (
              <div className="card" style={{ padding: '20px' }}>
                <h3>Comité Principal: {comites[0]?.nombre || 'Sin configurar'}</h3>
                <p>{comites[0]?.descripcion || 'Comité encargado de las políticas de archivo e inmutabilidad.'}</p>
                <button className="btn btn-secondary" onClick={() => setIsEditingMiembros(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}><MdEdit /> Configurar Integrantes</button>
              </div>
            ) : (
              <GestionMiembros miembrosIniciales={comites[0]?.miembros || []} usuariosEmpresa={usuarios} onGuardar={handleGuardarComiteMiembros} onCancelar={() => setIsEditingMiembros(false)} />
            )}
          </div>
        )}

        {activeTab === 'actas' && (
          <div>
            {!isEditingActa ? (
              <div>
                <button className="btn btn-primary" onClick={() => { setSelectedActa(null); setIsEditingActa(true); }} style={{ marginBottom: '15px' }}>Nueva Acta</button>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>No. Acta</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Fecha Reunión</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actas.map(a => (
                        <tr key={a.id || a._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{a.numeroActa}</td>
                          <td style={{ padding: '10px' }}>{new Date(a.fechaReunion).toLocaleDateString()}</td>
                          <td style={{ padding: '10px' }}>{a.tipo}</td>
                          <td style={{ padding: '10px' }}><span className="badge" style={{ background: a.estado === 'aprobada' ? '#e8f5e9' : '#fff3e0', color: a.estado === 'aprobada' ? '#2e7d32' : '#e65100', padding: '3px 8px', borderRadius: '4px' }}>{a.estado.toUpperCase()}</span></td>
                          <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            {a.estado === 'borrador' ? (
                              <>
                                <button className="btn btn-secondary" onClick={() => { setSelectedActa(a); setIsEditingActa(true); }}><MdEdit /> Editar</button>
                                <button className="btn btn-primary" onClick={() => handleOficializarActa((a.id || a._id)!)} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MdCheckCircle /> Oficializar</button>
                              </>
                            ) : (
                              <button className="btn btn-secondary" onClick={() => handleDescargarPDF((a.id || a._id)!)} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MdPictureAsPdf /> Descargar PDF</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <FormularioActa acta={selectedActa} comites={comites} usuarios={usuarios} onGuardar={handleGuardarActa} onCancelar={() => { setIsEditingActa(false); setSelectedActa(null); }} />
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
