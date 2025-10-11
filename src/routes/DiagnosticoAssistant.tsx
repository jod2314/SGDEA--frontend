import React, { useState } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { useNavigate } from 'react-router-dom';

// Interfaz para los datos del formulario de diagnóstico
interface DiagnosticoFormData {
  historiaInstitucional: string;
  organigramas: string; // Simplificado a texto por ahora
  condicionFisica: string;
  temperatura: string;
  humedad: string;
  observacionesInfra: string;
  resumenCCDPropuesto: string; // Simplificado a texto
  observaciones: string;
}

export default function DiagnosticoAssistant() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DiagnosticoFormData>>({});
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/diagnosticos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          historiaInstitucional: formData.historiaInstitucional,
          organigramas: [{ descripcion: formData.organigramas }], // Adaptado a la estructura del schema
          infraestructura: {
            condicionFisica: formData.condicionFisica,
            temperatura: formData.temperatura,
            humedad: formData.humedad,
            observaciones: formData.observacionesInfra,
          },
          resumenCCDPropuesto: [{ descripcion: formData.resumenCCDPropuesto }], // Adaptado
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
            <h2>Paso 1: Historia Institucional</h2>
            <p>Describa los hitos, reestructuraciones y momentos clave de la historia de la entidad.</p>
            <textarea name="historiaInstitucional" value={formData.historiaInstitucional || ''} onChange={handleChange} rows={10} style={{ width: '100%' }} />
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Paso 2: Organigrama y Estructura</h2>
            <p>Liste las dependencias o áreas principales que ha tenido la empresa. (Por ahora, como texto plano).</p>
            <textarea name="organigramas" value={formData.organigramas || ''} onChange={handleChange} rows={10} style={{ width: '100%' }} />
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
