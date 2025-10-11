import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';

export default function Diagnostico() {
  const [historia, setHistoria] = useState('');
  const [estructura, setEstructura] = useState('');
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
                }
              }      } catch (error) {
        console.log(error);
      }
    }
    getDiagnostico();
  }, [auth]);

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
          estructuraAnterior: estructura 
        }),
      });

      if (response.ok) {
        setStatus('Información guardada exitosamente.');
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
        Este es el primer paso para construir su sistema. Recopile aquí la información sobre la historia de su empresa, sus estructuras administrativas pasadas y sus hitos más importantes.
      </p>
      
      <form onSubmit={handleSubmit} className="form" style={{maxWidth: '100%'}}>
        <label htmlFor="historia">Historia Institucional</label>
        <textarea
          id="historia"
          rows={8}
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          placeholder="Describa la creación de la empresa, sus objetivos iniciales, fusiones, cambios de nombre, etc."
        />

        <label htmlFor="estructura">Estructuras Orgánicas Anteriores</label>
        <textarea
          id="estructura"
          rows={8}
          value={estructura}
          onChange={(e) => setEstructura(e.target.value)}
          placeholder="Liste las dependencias o áreas que existieron en el pasado y ya no están vigentes."
        />

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {status && <p style={{color: 'var(--primary)'}}>{status}</p>}
            <button type="submit" className="btn btn-primary">
                Guardar Diagnóstico
            </button>
        </div>
      </form>
    </PortalLayout>
  );
}