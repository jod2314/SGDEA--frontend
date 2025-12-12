import React, { useState } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { useNavigate } from 'react-router-dom';

// Interfaz para los datos del formulario de diagnóstico
interface DiagnosticoFormData {
  historiaInstitucional: string;
  organigramas: { descripcion: string, tipo?: string, archivoUrl?: string }[]; // Ahora es un array de objetos
  fechasClave: { fecha: string, descripcion: string }[]; // Añadido para gestionar hitos
  condicionFisica: string;
  temperatura: string;
  humedad: string;
  observacionesInfra: string;
  resumenCCDPropuesto: string; // Simplificado a texto
  observaciones: string;
}

export default function DiagnosticoAssistant() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DiagnosticoFormData>>({
    organigramas: [],
    fechasClave: [],
  });
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Funciones para Organigramas ---
  const addOrganigrama = () => {
    setFormData(prev => ({
      ...prev,
      organigramas: [...(prev.organigramas || []), { descripcion: '' }],
    }));
  };

  const handleOrganigramaChange = (index: number, value: string) => {
    const newOrganigramas = [...(formData.organigramas || [])];
    newOrganigramas[index].descripcion = value;
    setFormData(prev => ({ ...prev, organigramas: newOrganigramas }));
  };

  const removeOrganigrama = (index: number) => {
    const newOrganigramas = (formData.organigramas || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, organigramas: newOrganigramas }));
  };

  // --- Funciones para Fechas Clave ---
  const addFechaClave = () => {
    setFormData(prev => ({
      ...prev,
      fechasClave: [...(prev.fechasClave || []), { fecha: '', descripcion: '' }],
    }));
  };

  const handleFechaClaveChange = (index: number, field: keyof ({ fecha: string, descripcion: string }), value: string) => {
    const newFechasClave = [...(formData.fechasClave || [])];
    (newFechasClave[index] as any)[field] = value; // Type assertion as field is dynamic
    setFormData(prev => ({ ...prev, fechasClave: newFechasClave }));
  };

  const removeFechaClave = (index: number) => {
    const newFechasClave = (formData.fechasClave || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fechasClave: newFechasClave }));
  };

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
          organigramas: formData.organigramas, // Ahora es un array de objetos
          fechasClave: formData.fechasClave,   // Ahora es un array de objetos
          infraestructura: {
            condicionFisica: formData.condicionFisica,
            temperatura: formData.temperatura,
            humedad: formData.humedad,
            observaciones: formData.observacionesInfra,
          },
          resumenCCDPropuesto: (formData.resumenCCDPropuesto && formData.resumenCCDPropuesto.length > 0) ? [{ descripcion: formData.resumenCCDPropuesto }] : [], // Si hay texto, se convierte a array de objeto
          observaciones: formData.observaciones,
        }),
      });

      if (response.ok) {
        alert('Diagnóstico guardado con éxito!');
        navigate('/dashboard'); // Redirigir al dashboard o a una lista de diagnósticos
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
                <input
                  type="date"
                  value={fc.fecha}
                  onChange={(e) => handleFechaClaveChange(index, 'fecha', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Descripción del evento"
                  value={fc.descripcion}
                  onChange={(e) => handleFechaClaveChange(index, 'descripcion', e.target.value)}
                  style={{ flex: 2 }}
                />
                <button type="button" onClick={() => removeFechaClave(index)} className="btn" style={{ minWidth: 'unset', padding: '5px 10px' }}>X</button>
              </div>
            ))}
            <button type="button" onClick={addFechaClave} className="btn btn-secondary">Añadir Fecha Clave</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Paso 2: Organigrama y Estructura</h2>
            <p>Liste las dependencias o áreas principales que ha tenido la empresa.</p>
            {(formData.organigramas || []).map((org, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Descripción del Organigrama/Estructura"
                  value={org.descripcion}
                  onChange={(e) => handleOrganigramaChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeOrganigrama(index)} className="btn" style={{ minWidth: 'unset', padding: '5px 10px' }}>X</button>
              </div>
            ))}
            <button type="button" onClick={addOrganigrama} className="btn btn-secondary">Añadir Organigrama</button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Paso 3: Infraestructura y Condiciones</h2>
            <p>Describa el estado actual de la infraestructura física donde se almacenan los archivos.</p>
            <input type="text" name="condicionFisica" placeholder="Condición Física (ej: Buena, Regular)" value={formData.condicionFisica || ''} onChange={handleChange} /><br />
            <input type="text" name="temperatura" placeholder="Temperatura (°C)" value={formData.temperatura || ''} onChange={handleChange} /><br />
            <input type="text" name="humedad" placeholder="Humedad (%)" value={formData.humedad || ''} onChange={handleChange} /><br />
            <textarea name="observacionesInfra" placeholder="Observaciones de infraestructura" value={formData.observacionesInfra || ''} onChange={handleChange} rows={5} style={{ width: '100%' }} />
          </div>
        );
      case 4:
        return (
          <div>
            <h2>Paso 4: Resumen y Observaciones Finales</h2>
            <p>Proponga una estructura inicial de clasificación (CCD) y añada observaciones generales.</p>
            <textarea name="resumenCCDPropuesto" placeholder="Propuesta de Cuadro de Clasificación Documental" value={formData.resumenCCDPropuesto || ''} onChange={handleChange} rows={8} style={{ width: '100%' }} />
            <textarea name="observaciones" placeholder="Observaciones generales del diagnóstico" value={formData.observaciones || ''} onChange={handleChange} rows={5} style={{ width: '100%' }} />
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
          {step < 4 && <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">Siguiente</button>}
          {step === 4 && <button onClick={handleSubmit} className="btn btn-success">Finalizar y Guardar</button>}
        </div>
      </div>
    </PortalLayout>
  );
}
