import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { useNavigate } from 'react-router-dom';

// Interfaz para los datos del formulario de diagnóstico
interface DiagnosticoFormData {
  historiaInstitucional: string;
  organigramas: { descripcion: string, tipo?: string, archivoUrl?: string }[]; 
  fechasClave: { fecha: string, descripcion: string }[];
  
  // Cuantitativo
  conteo: { cajas: number, carpetas: number, tomos: number, otros: number };
  metrosLineales: number;
  insumosProyectados: { cajasX200: number, carpetasYute: number, ganchosLegajadores: number };
  estadoBiologico: { porcentajeHongos: number, porcentajeInsectos: number, porcentajePolvo: number };

  condicionFisica: string;
  temperatura: string;
  humedad: string;
  observacionesInfra: string;
  resumenCCDPropuesto: string; 
  observaciones: string;
}

export default function DiagnosticoAssistant() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DiagnosticoFormData>>({
    organigramas: [],
    fechasClave: [],
    conteo: { cajas: 0, carpetas: 0, tomos: 0, otros: 0 },
    metrosLineales: 0,
    insumosProyectados: { cajasX200: 0, carpetasYute: 0, ganchosLegajadores: 0 },
    estadoBiologico: { porcentajeHongos: 0, porcentajeInsectos: 0, porcentajePolvo: 0 }
  });
  const auth = useAuth();
  const navigate = useNavigate();

  // Auto-cálculo de métricas
  useEffect(() => {
    if (formData.conteo) {
        const { cajas, carpetas, tomos } = formData.conteo;
        // Fórmulas AGN aproximadas
        const ml = (Number(cajas) * 0.12) + (Number(carpetas) * 0.01) + (Number(tomos) * 0.03);
        
        // Proyección de Insumos para intervención
        const carpetasNecesarias = Math.ceil(ml * 100); // 100 expedientes por ML promedio si está suelto
        const cajasNecesarias = Math.ceil(ml / 0.12);
        
        setFormData(prev => ({
            ...prev,
            metrosLineales: parseFloat(ml.toFixed(2)),
            insumosProyectados: {
                cajasX200: cajasNecesarias,
                carpetasYute: carpetasNecesarias,
                ganchosLegajadores: carpetasNecesarias
            }
        }));
    }
  }, [formData.conteo?.cajas, formData.conteo?.carpetas, formData.conteo?.tomos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConteoChange = (field: keyof typeof formData.conteo, value: string) => {
      setFormData(prev => ({
          ...prev,
          conteo: { ...prev.conteo!, [field]: Number(value) }
      }));
  };

  const handleBioChange = (field: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          estadoBiologico: { ...prev.estadoBiologico!, [field]: Number(value) }
      }));
  };

  // ... (Funciones de Arrays organigramas/fechasClave se mantienen igual) ...
  // RE-INSERTAR LAS FUNCIONES DE ARRAYS AQUÍ SI SE PERDIERON O ASUMIR QUE EXISTEN
  // Para evitar errores, las re-declaro brevemente por si acaso el replace anterior las borró
  const addOrganigrama = () => setFormData(p => ({...p, organigramas: [...(p.organigramas||[]), {descripcion:''}]}));
  const handleOrganigramaChange = (i:number, v:string) => {const n=[...(formData.organigramas||[])]; n[i].descripcion=v; setFormData(p=>({...p, organigramas:n}))};
  const removeOrganigrama = (i:number) => setFormData(p=>({...p, organigramas: (p.organigramas||[]).filter((_,x)=>x!==i)}));
  
  const addFechaClave = () => setFormData(p => ({...p, fechasClave: [...(p.fechasClave||[]), {fecha:'', descripcion:''}]}));
  const handleFechaClaveChange = (i:number, f:string, v:string) => {const n=[...(formData.fechasClave||[])]; (n[i] as any)[f]=v; setFormData(p=>({...p, fechasClave:n}))};
  const removeFechaClave = (i:number) => setFormData(p=>({...p, fechasClave: (p.fechasClave||[]).filter((_,x)=>x!==i)}));


  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/diagnostico`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          historiaInstitucional: formData.historiaInstitucional,
          organigramas: formData.organigramas,
          fechasClave: formData.fechasClave,
          // Nuevos campos
          conteo: formData.conteo,
          metrosLineales: formData.metrosLineales,
          insumosProyectados: formData.insumosProyectados,
          estadoBiologico: formData.estadoBiologico,
          
          infraestructura: {
            condicionFisica: formData.condicionFisica,
            temperatura: formData.temperatura,
            humedad: formData.humedad,
            observaciones: formData.observacionesInfra,
          },
          resumenCCDPropuesto: (formData.resumenCCDPropuesto && formData.resumenCCDPropuesto.length > 0) ? [{ descripcion: formData.resumenCCDPropuesto }] : [],
          observaciones: formData.observaciones,
        }),
      });

      if (response.ok) {
        alert('Diagnóstico guardado con éxito!');
        navigate('/dashboard');
      } else {
        const err = await response.json();
        alert(`Error al guardar: ${err.body.error}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Ocurrió un error de conexión.");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Paso 1: Historia Institucional y Fechas Clave</h2>
            <p>Describa los hitos, reestructuraciones y momentos clave de la historia de la entidad.</p>
            <textarea name="historiaInstitucional" value={formData.historiaInstitucional || ''} onChange={handleChange} rows={10} style={{ width: '100%' }} /><br/>
            
            <h3>Fechas Clave</h3>
            {(formData.fechasClave || []).map((fc, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input type="date" value={fc.fecha} onChange={(e) => handleFechaClaveChange(index, 'fecha', e.target.value)} />
                <input type="text" placeholder="Evento" value={fc.descripcion} onChange={(e) => handleFechaClaveChange(index, 'descripcion', e.target.value)} style={{flex:1}}/>
                <button onClick={() => removeFechaClave(index)}>X</button>
              </div>
            ))}
            <button onClick={addFechaClave}>+ Fecha</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Paso 2: Organigrama y Estructura</h2>
            <p>Liste las dependencias o áreas principales.</p>
            {(formData.organigramas || []).map((org, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Dependencia" value={org.descripcion} onChange={(e) => handleOrganigramaChange(index, e.target.value)} style={{flex:1}}/>
                <button onClick={() => removeOrganigrama(index)}>X</button>
              </div>
            ))}
            <button onClick={addOrganigrama}>+ Organigrama</button>
          </div>
        );
      case 3: // NUEVO PASO CUANTITATIVO
        return (
            <div>
                <h2>Paso 3: Análisis Cuantitativo (Volumetría)</h2>
                <p>Ingrese las cantidades aproximadas para calcular el volumen documental.</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <label>Cantidad de Cajas (x200):</label>
                        <input type="number" value={formData.conteo?.cajas} onChange={(e) => handleConteoChange('cajas', e.target.value)} style={{width:'100%'}} />
                    </div>
                    <div>
                        <label>Cantidad de Carpetas/Legajos:</label>
                        <input type="number" value={formData.conteo?.carpetas} onChange={(e) => handleConteoChange('carpetas', e.target.value)} style={{width:'100%'}} />
                    </div>
                    <div>
                        <label>Cantidad de Tomos/Libros:</label>
                        <input type="number" value={formData.conteo?.tomos} onChange={(e) => handleConteoChange('tomos', e.target.value)} style={{width:'100%'}} />
                    </div>
                </div>

                <div style={{marginTop:'20px', padding:'15px', backgroundColor:'#e8f0fe', borderRadius:'8px'}}>
                    <h3>Resultados Proyectados:</h3>
                    <p style={{fontSize:'1.5em', fontWeight:'bold'}}>{formData.metrosLineales} Metros Lineales</p>
                    <ul>
                        <li>Cajas Necesarias: {formData.insumosProyectados?.cajasX200}</li>
                        <li>Carpetas y Ganchos: {formData.insumosProyectados?.carpetasYute}</li>
                    </ul>
                </div>

                <h3>Estado Biológico (Estimado %)</h3>
                <div style={{display:'flex', gap:'10px'}}>
                    <label>Hongos: <input type="number" value={formData.estadoBiologico?.porcentajeHongos} onChange={e => handleBioChange('porcentajeHongos', e.target.value)} style={{width:'60px'}}/>%</label>
                    <label>Insectos: <input type="number" value={formData.estadoBiologico?.porcentajeInsectos} onChange={e => handleBioChange('porcentajeInsectos', e.target.value)} style={{width:'60px'}}/>%</label>
                </div>
            </div>
        );
      case 4:
        return (
          <div>
            <h2>Paso 4: Infraestructura y Condiciones</h2>
            <input type="text" name="condicionFisica" placeholder="Condición Física" value={formData.condicionFisica || ''} onChange={handleChange} /><br />
            <input type="text" name="temperatura" placeholder="Temperatura" value={formData.temperatura || ''} onChange={handleChange} /><br />
            <input type="text" name="humedad" placeholder="Humedad" value={formData.humedad || ''} onChange={handleChange} /><br />
            <textarea name="observacionesInfra" placeholder="Observaciones" value={formData.observacionesInfra || ''} onChange={handleChange} />
          </div>
        );
      case 5:
        return (
          <div>
            <h2>Paso 5: Resumen y Finalización</h2>
            <textarea name="resumenCCDPropuesto" placeholder="Propuesta CCD" value={formData.resumenCCDPropuesto || ''} onChange={handleChange} rows={8} style={{ width: '100%' }} />
            <textarea name="observaciones" placeholder="Observaciones finales" value={formData.observaciones || ''} onChange={handleChange} rows={5} />
          </div>
        );
      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <PortalLayout>
      <div className="card" style={{ padding: '20px' }}>
        <h1>Asistente de Diagnóstico Archivístico</h1>
        <div style={{ margin: '20px 0' }}>{renderStepContent()}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn">Anterior</button>
          {step < 5 && <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">Siguiente</button>}
          {step === 5 && <button onClick={handleSubmit} className="btn btn-success">Finalizar y Guardar</button>}
        </div>
      </div>
    </PortalLayout>
  );
}
