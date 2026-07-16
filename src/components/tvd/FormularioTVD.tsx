import { useState } from 'react';
import * as IconsMd from 'react-icons/md';
import type { TablaValoracionDocumental, SerieTVD } from '../../types/types';

const MdAdd = (IconsMd as any).MdAdd;
const MdDelete = (IconsMd as any).MdDelete;
const MdOutlineLightbulb = (IconsMd as any).MdOutlineLightbulb;

interface FormularioTVDProps {
  tvd: TablaValoracionDocumental | null;
  dependenciasDisponibles: any[];
  onGuardar: (data: Partial<TablaValoracionDocumental>) => void;
  onCancelar: () => void;
}

const SUGERENCIAS_SECTOR = {
  publico: [
    { codigo: '100.1', nombre: 'Actas de Consejo Directivo', retencionCentral: 10, disposicionFinal: 'CT', procedimiento: 'Conservar copia electrónica íntegra y digitalizar actas históricas.' },
    { codigo: '120.5', nombre: 'Resoluciones Administrativas', retencionCentral: 5, disposicionFinal: 'CT', procedimiento: 'Conservación total por valor legal.' },
    { codigo: '200.3', nombre: 'Informes de Control Interno', retencionCentral: 3, disposicionFinal: 'E', procedimiento: 'Eliminar previa acta de eliminación tras cumplirse los tiempos de retención.' },
    { codigo: '310.15', nombre: 'Contratos Estatales', retencionCentral: 20, disposicionFinal: 'S', procedimiento: 'Selección de muestra representativa para conservación histórica.' }
  ],
  privado: [
    { codigo: 'CON-01', nombre: 'Comprobantes de Contabilidad', retencionCentral: 10, disposicionFinal: 'E', procedimiento: 'Eliminar previa digitalización y certificación tributaria.' },
    { codigo: 'TAL-02', nombre: 'Historias Laborales de Empleados', retencionCentral: 20, disposicionFinal: 'CT', procedimiento: 'Conservación total para soporte pensional y aportes.' },
    { codigo: 'LEG-05', nombre: 'Contratos Comerciales', retencionCentral: 10, disposicionFinal: 'S', procedimiento: 'Selección para conservación del 10% del fondo acumulado.' }
  ]
};

export default function FormularioTVD({ tvd, dependenciasDisponibles, onGuardar, onCancelar }: FormularioTVDProps) {
  const [version, setVersion] = useState(tvd?.version || '1.0');
  const [nombre, setNombre] = useState(tvd?.nombre || '');
  const [descripcion, setDescripcion] = useState(tvd?.descripcion || '');
  const [series, setSeries] = useState<SerieTVD[]>(tvd?.series || []);

  // Formulario nueva serie
  const [codigo, setCodigo] = useState('');
  const [nombreSerie, setNombreSerie] = useState('');
  const [retCentral, setRetCentral] = useState<number>(5);
  const [dispFinal, setDispFinal] = useState<'CT' | 'E' | 'M' | 'S'>('E');
  const [procedimiento, setProcedimiento] = useState('');
  const [dependenciaId, setDependenciaId] = useState('');

  function handleAgregarSerie() {
    if (!codigo || !nombreSerie || !procedimiento) {
      alert('Por favor complete los campos obligatorios de la serie (Código, Nombre y Procedimiento).');
      return;
    }
    const nueva: SerieTVD = { 
      codigo, 
      nombre: nombreSerie, 
      retencionCentral: Number(retCentral), 
      disposicionFinal: dispFinal, 
      procedimiento,
      dependenciaId: dependenciaId || undefined
    };
    setSeries([...series, nueva]);
    setCodigo('');
    setNombreSerie('');
    setProcedimiento('');
    setDependenciaId('');
  }

  function cargarSugerencias(sector: 'publico' | 'privado') {
    const seleccionadas = SUGERENCIAS_SECTOR[sector] as SerieTVD[];
    setSeries([...series, ...seleccionadas]);
  }

  function handleGuardar() {
    if (!version || !nombre || series.length === 0) {
      alert('La versión, el nombre y al menos una serie documental son requeridos para la TVD.');
      return;
    }
    onGuardar({ version, nombre, descripcion, series });
  }

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h3>{tvd ? 'Editar Tabla de Valoración' : 'Nueva Tabla de Valoración (TVD)'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '15px', marginTop: '15px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Versión *</label>
          <input type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="Ej: 1.0" className="edit-input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Nombre *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: TVD Sección Financiera 1990-2005" className="edit-input" style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => cargarSugerencias('publico')} style={{ fontSize: '0.75rem', padding: '6px' }} title="Cargar sugerencias para Sector Público"><MdOutlineLightbulb /> Público</button>
            <button type="button" className="btn btn-secondary" onClick={() => cargarSugerencias('privado')} style={{ fontSize: '0.75rem', padding: '6px' }} title="Cargar sugerencias para Sector Privado"><MdOutlineLightbulb /> Privado</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Descripción / Justificación</label>
        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Breve contexto del fondo acumulado..." className="edit-input" style={{ width: '100%' }} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Series Documentales de la TVD</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 2fr auto', gap: '8px', alignItems: 'flex-end', background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Código *</label>
            <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="100.1" className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Nombre Serie *</label>
            <input type="text" value={nombreSerie} onChange={e => setNombreSerie(e.target.value)} placeholder="Actas de..." className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Dependencia Asociada</label>
            <select value={dependenciaId} onChange={e => setDependenciaId(e.target.value)} className="edit-input" style={{ width: '100%', padding: '4px' }}>
              <option value="">-- Ninguna --</option>
              {dependenciasDisponibles.map((d: any) => (
                <option key={d._id} value={d._id}>{d.nombreDependencia} ({d.codigoDependencia})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Ret. Central *</label>
            <input type="number" value={retCentral} onChange={e => setRetCentral(Number(e.target.value))} className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Disp. Final *</label>
            <select value={dispFinal} onChange={e => setDispFinal(e.target.value as 'CT' | 'E' | 'M' | 'S')} className="edit-input" style={{ width: '100%', padding: '4px' }}>
              <option value="CT">CT (Conservación)</option>
              <option value="E">E (Eliminación)</option>
              <option value="M">M (Medios)</option>
              <option value="S">S (Selección)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem' }}>Procedimiento *</label>
            <input type="text" value={procedimiento} onChange={e => setProcedimiento(e.target.value)} placeholder="Disposición..." className="edit-input" style={{ width: '100%', padding: '4px' }} />
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleAgregarSerie} style={{ padding: '6px 12px' }}><MdAdd /></button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#eee', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '6px', textAlign: 'left' }}>Código</th>
              <th style={{ padding: '6px', textAlign: 'left' }}>Nombre Serie</th>
              <th style={{ padding: '6px', textAlign: 'left' }}>Dependencia</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>Ret. Central</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>Disp. Final</th>
              <th style={{ padding: '6px', textAlign: 'left' }}>Procedimiento</th>
              <th style={{ padding: '6px', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {series.map((s, idx) => {
              const depObj = dependenciasDisponibles.find((d: any) => d._id === (s.dependenciaId?._id || s.dependenciaId));
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{s.codigo}</td>
                  <td style={{ padding: '6px' }}>{s.nombre}</td>
                  <td style={{ padding: '6px', color: '#1e40af', fontWeight: 500 }}>
                    {depObj ? `${depObj.nombreDependencia} (${depObj.codigoDependencia})` : '--'}
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.retencionCentral} años</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}><span className="badge" style={{ background: '#e1f5fe', color: '#01579b', padding: '2px 6px', borderRadius: '4px' }}>{s.disposicionFinal}</span></td>
                  <td style={{ padding: '6px', fontSize: '0.8rem', color: '#555' }}>{s.procedimiento}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <button type="button" className="btn btn-icon" onClick={() => setSeries(series.filter((_, i) => i !== idx))} style={{ color: 'red' }}><MdDelete /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={handleGuardar}>Guardar TVD</button>
      </div>
    </div>
  );
}
