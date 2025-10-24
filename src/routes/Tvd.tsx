import { useState, useEffect } from 'react';
import PortalLayout from '../layout/PortalLayout';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../auth/authConstants';

// Interfaces para los datos
interface Unidad {
  _id: string;
  nombreCaja: string;
}
interface FilaTvd {
  _id?: string;
  unidadDocumental: string;
  disposicionFinal: string;
  procedimiento: string;
}

export default function Tvd() {
  const [filasTvd, setFilasTvd] = useState<FilaTvd[]>([]);
  const auth = useAuth();

  // Cargar datos iniciales (inventario y TVD existente)
  useEffect(() => {
    async function loadData() {
      let inventarioData = [];
      // Cargar inventario
      const invResponse = await fetch(`${API_URL}/inventario`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (invResponse.ok) {
        const invJson = await invResponse.json();
        inventarioData = invJson.body.data || [];
      }

      // Cargar TVD
      const tvdResponse = await fetch(`${API_URL}/tvd`, {
        headers: { Authorization: `Bearer ${auth.getAccessToken()}` },
      });
      if (tvdResponse.ok) {
        const tvdJson = await tvdResponse.json();
        const tvdData = tvdJson.body.data;
        // Inicializar las filas de la TVD basadas en el inventario
        const initialFilas = inventarioData.map((u: Unidad) => ({
          unidadDocumental: u.nombreCaja,
          disposicionFinal: 'Conservacion Total',
          procedimiento: ''
        }));
        setFilasTvd(tvdData && tvdData.filas.length > 0 ? tvdData.filas : initialFilas);
      }
    }
    loadData();
  }, [auth]);

  // Manejar cambios en las filas de la TVD
  const handleFilaChange = (index: number, field: keyof FilaTvd, value: string) => {
    const newFilas = [...filasTvd];
    (newFilas[index] as any)[field] = value;
    setFilasTvd(newFilas);
  };

  // Guardar la TVD
  const handleSaveTvd = async () => {
    await fetch(`${API_URL}/tvd`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.getAccessToken()}`,
      },
      body: JSON.stringify({ filas: filasTvd }),
    });
    alert('TVD Guardada');
  };

  return (
    <PortalLayout>
      <h1>Asistente de Tabla de Valoración Documental (TVD)</h1>
      <p className="text-muted">
        Valore las unidades de su inventario y defina su disposición final.
      </p>

      <div className='card' style={{padding: '0'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
                <tr style={{borderBottom: '1px solid rgba(60,64,67,0.12)'}}>
                    <th style={{padding: '16px', textAlign: 'left'}}>Unidad Documental</th>
                    <th style={{padding: '16px', textAlign: 'left'}}>Disposición Final</th>
                    <th style={{padding: '16px', textAlign: 'left'}}>Procedimiento / Justificación</th>
                </tr>
            </thead>
            <tbody>
                {filasTvd.map((fila, index) => (
                    <tr key={index} style={{borderBottom: '1px solid rgba(60,64,67,0.08)'}}>
                        <td style={{padding: '16px'}}>{fila.unidadDocumental}</td>
                        <td style={{padding: '16px'}}>
                            <select 
                                value={fila.disposicionFinal} 
                                onChange={(e) => handleFilaChange(index, 'disposicionFinal', e.target.value)}
                                style={{width: '100%', height: '40px'}}
                            >
                                <option>Conservacion Total</option>
                                <option>Eliminacion</option>
                                <option>Seleccion</option>
                                <option>Digitalizacion</option>
                            </select>
                        </td>
                        <td style={{padding: '16px'}}>
                            <input 
                                type="text" 
                                value={fila.procedimiento} 
                                onChange={(e) => handleFilaChange(index, 'procedimiento', e.target.value)}
                                style={{width: '100%', height: '40px'}}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
        <button onClick={handleSaveTvd} className="btn btn-primary">Guardar TVD</button>
      </div>
    </PortalLayout>
  );
}
