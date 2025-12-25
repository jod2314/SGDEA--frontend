import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';

export default function Diagnostico() {
  const [historia, setHistoria] = useState('');
  const [estructura, setEstructura] = useState('');
  
  // Nuevos estados para conteo cuantitativo
  const [conteo, setConteo] = useState({ cajas: 0, carpetas: 0, tomos: 0, otros: 0 });
  const [metrosLineales, setMetrosLineales] = useState(0);
  const [insumos, setInsumos] = useState<any>(null);

  const [status, setStatus] = useState('');
  const auth = useAuth();

  useEffect(() => {
    async function getDiagnostico() {
      try {
        const response = await fetch(`${API_URL}/diagnostico`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });
        if (response.ok) {
          const json = await response.json();
          if (json.body.data) {
            setHistoria(json.body.data.historiaInstitucional || '');
            setEstructura(json.body.data.estructuraAnterior || '');
            setConteo(json.body.data.conteo || { cajas: 0, carpetas: 0, tomos: 0, otros: 0 });
            setMetrosLineales(json.body.data.metrosLineales || 0);
            setInsumos(json.body.data.insumosProyectados);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    getDiagnostico();
  }, [auth]);

  const handleConteoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConteo(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/diagnostico`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ 
          historiaInstitucional: historia, 
          estructuraAnterior: estructura,
          conteo // Enviamos el conteo para que el backend calcule
        }),
      });

      if (response.ok) {
        const json = await response.json();
        // Actualizamos estado con la respuesta del backend (que trae los cálculos)
        setMetrosLineales(json.body.data.metrosLineales);
        setInsumos(json.body.data.insumosProyectados);
        
        setStatus('Información guardada y calculada exitosamente.');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Error al guardar la información.');
      }
    } catch (error) {
      console.log(error);
      setStatus('Error de conexión con el servidor.');
    }
  };

  return (
    <PortalLayout>
      <h1>Diagnóstico Institucional</h1>
      <p className="text-muted">
        Este es el primer paso para construir su sistema. Recopile aquí la información sobre la historia de su empresa y el volumen documental físico.
      </p>
      
      <form onSubmit={handleSubmit} className="form" style={{maxWidth: '100%'}}>
        
        {/* Sección Cualitativa */}
        <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div>
                <label htmlFor="historia">Historia Institucional</label>
                <textarea
                  id="historia"
                  rows={8}
                  value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  placeholder="Describa la creación de la empresa, objetivos, fusiones..."
                />
            </div>
            <div>
                <label htmlFor="estructura">Estructuras Anteriores</label>
                <textarea
                  id="estructura"
                  rows={8}
                  value={estructura}
                  onChange={(e) => setEstructura(e.target.value)}
                  placeholder="Dependencias o áreas antiguas."
                />
            </div>
        </div>

        <hr style={{margin: '20px 0'}}/>

        {/* Sección Cuantitativa (Calculadora) */}
        <h3>Calculadora de Volumen Documental</h3>
        <p className="text-muted" style={{fontSize:'0.9em'}}>Ingrese las cantidades físicas aproximadas. El sistema calculará los Metros Lineales.</p>
        
        <div style={{display:'flex', gap:'20px', flexWrap:'wrap', backgroundColor:'#f8f9fa', padding:'20px', borderRadius:'8px'}}>
            <div style={{flex: 1}}>
                <label>No. Cajas X200</label>
                <input type="number" name="cajas" value={conteo.cajas} onChange={handleConteoChange} min="0" />
            </div>
            <div style={{flex: 1}}>
                <label>No. Carpetas Sueltas</label>
                <input type="number" name="carpetas" value={conteo.carpetas} onChange={handleConteoChange} min="0" />
            </div>
            <div style={{flex: 1}}>
                <label>No. Tomos/Libros</label>
                <input type="number" name="tomos" value={conteo.tomos} onChange={handleConteoChange} min="0" />
            </div>
            <div style={{flex: 1}}>
                <label>Otros</label>
                <input type="number" name="otros" value={conteo.otros} onChange={handleConteoChange} min="0" />
            </div>
        </div>

        {metrosLineales > 0 && (
            <div style={{marginTop: '20px', padding: '15px', border: '1px solid #cce5ff', backgroundColor: '#e8f0fe', borderRadius: '5px'}}>
                <h4 style={{marginTop:0, color: '#004085'}}>Resultados del Diagnóstico</h4>
                <p><strong>Volumen Total Estimado:</strong> <span style={{fontSize:'1.2em', fontWeight:'bold'}}>{metrosLineales} Metros Lineales</span></p>
                
                {insumos && (
                    <div style={{marginTop:'10px'}}>
                        <strong>Proyección de Insumos Nuevos:</strong>
                        <ul style={{marginBottom:0}}>
                            <li>Cajas X200 requeridas: {insumos.cajasX200}</li>
                            <li>Carpetas Yute: {insumos.carpetasYute}</li>
                            <li>Ganchos Legajadores: {insumos.ganchosLegajadores}</li>
                        </ul>
                    </div>
                )}
            </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px'}}>
            {status && <span style={{color: 'var(--primary)', marginRight:'10px'}}>{status}</span>}
            <button type="submit" className="btn btn-primary">
                Guardar y Calcular
            </button>
        </div>
      </form>
    </PortalLayout>
  );
}