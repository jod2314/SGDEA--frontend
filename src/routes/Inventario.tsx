import React, { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';
import { MdAdd } from 'react-icons/lib/md';

// Interfaz para la Unidad de Conservación
interface Unidad {
  _id: string;
  nombreCaja: string;
  descripcionContenido: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export default function Inventario() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [nombreCaja, setNombreCaja] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const auth = useAuth();

  // Cargar inventario inicial
  useEffect(() => {
    async function getInventario() {
      const response = await fetch(`${API_URL}/inventario`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (response.ok) {
        const json = await response.json();
        setUnidades(json.body.data);
      }
    }
    getInventario();
  }, [auth]);

  // Manejar la creación de una nueva unidad
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCaja) return;

    const response = await fetch(`${API_URL}/inventario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.getAccessToken()}`,
      },
      body: JSON.stringify({ nombreCaja, descripcionContenido: descripcion }),
    });

    const json = await response.json();

    if (response.ok) {
      setUnidades([...unidades, json.body.data]);
      setNombreCaja('');
      setDescripcion('');
    } else {
      alert(`Error: ${json.body.error}`);
    }
  };

  return (
    <PortalLayout>
      <h1>Inventario de Fondos Acumulados</h1>
      <p className="text-muted">
        Registre aquí las unidades de conservación (cajas, carpetas, etc.) que no están organizadas para luego poder valorarlas.
      </p>

      {/* Formulario para añadir nueva unidad */}
      <form onSubmit={handleSubmit} className="create-todo-form" style={{marginBottom: '30px'}}>
        <input
          type="text"
          placeholder="Nombre o código de la caja/unidad"
          value={nombreCaja}
          onChange={(e) => setNombreCaja(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción del contenido"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          <MdAdd size={24} />
        </button>
      </form>

      {/* Tabla con el inventario */}
      <div className='card' style={{padding: '0'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
                <tr style={{borderBottom: '1px solid rgba(60,64,67,0.12)'}}>
                    <th style={{padding: '16px', textAlign: 'left'}}>Nombre/Caja</th>
                    <th style={{padding: '16px', textAlign: 'left'}}>Descripción</th>
                    <th style={{padding: '16px', textAlign: 'left'}}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {unidades.map(unidad => (
                    <tr key={unidad._id} style={{borderBottom: '1px solid rgba(60,64,67,0.08)'}}>
                        <td style={{padding: '16px'}}>{unidad.nombreCaja}</td>
                        <td style={{padding: '16px'}}>{unidad.descripcionContenido}</td>
                        <td style={{padding: '16px'}}> {/* Botones de acción irán aquí */} </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </PortalLayout>
  );
}
