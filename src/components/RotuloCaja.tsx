import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { MdPrint, MdClose } from 'react-icons/md';

interface RotuloProps {
  data: {
    empresa: string;
    unidadAdministrativa: string; // Oficina productora
    serie: string;
    subserie: string;
    asunto: string;
    fechas: string;
    noCaja: string;
    noCarpeta: string;
    noFolios: number;
  };
  onClose: () => void;
}

const RotuloCaja: React.FC<RotuloProps> = ({ data, onClose }) => {
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <h3>Vista Previa Rótulo</h3>
            <div>
                <button onClick={handlePrint} className="btn btn-primary" style={{marginRight:'10px'}}><MdPrint/> Imprimir</button>
                <button onClick={onClose} className="btn btn-secondary"><MdClose/></button>
            </div>
        </div>

        {/* Área Imprimible - Diseñada para sticker de 10x10 aprox */}
        <div ref={componentRef} style={printAreaStyle}>
            <div style={headerStyle}>
                <h4 style={{margin:0, textTransform:'uppercase'}}>{data.empresa || 'NOMBRE EMPRESA'}</h4>
                <small>TABLA DE RETENCIÓN DOCUMENTAL</small>
            </div>
            
            <table style={tableStyle}>
                <tbody>
                    <tr>
                        <td style={labelStyle}>FONDO:</td>
                        <td style={valueStyle}>{data.empresa}</td>
                    </tr>
                    <tr>
                        <td style={labelStyle}>SECCIÓN:</td>
                        <td style={valueStyle}>{data.unidadAdministrativa}</td>
                    </tr>
                    <tr>
                        <td style={labelStyle}>SERIE:</td>
                        <td style={valueStyle}>{data.serie}</td>
                    </tr>
                    <tr>
                        <td style={labelStyle}>SUBSERIE:</td>
                        <td style={valueStyle}>{data.subserie}</td>
                    </tr>
                    <tr>
                        <td style={labelStyle}>CONTENIDO:</td>
                        <td style={valueStyle}>{data.asunto}</td>
                    </tr>
                    <tr>
                        <td style={labelStyle}>FECHAS:</td>
                        <td style={valueStyle}>{data.fechas}</td>
                    </tr>
                </tbody>
            </table>

            <div style={footerGridStyle}>
                <div style={boxItemStyle}>
                    <span style={labelSmallStyle}>No. CAJA</span>
                    <strong style={{fontSize:'1.5em'}}>{data.noCaja}</strong>
                </div>
                <div style={boxItemStyle}>
                    <span style={labelSmallStyle}>No. CARPETA</span>
                    <strong>{data.noCarpeta}</strong>
                </div>
                <div style={boxItemStyle}>
                    <span style={labelSmallStyle}>FOLIOS</span>
                    <strong>{data.noFolios}</strong>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Estilos
const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '20px', borderRadius: '8px',
    maxWidth: '500px', width: '100%'
};

// Estilos de Impresión (Simulación de sticker)
const printAreaStyle: React.CSSProperties = {
    width: '10cm', height: '10cm', 
    border: '2px solid black', padding: '10px',
    fontFamily: 'Arial, sans-serif', backgroundColor: 'white',
    margin: '0 auto' // Centrado en la vista previa
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center', borderBottom: '2px solid black', 
    paddingBottom: '5px', marginBottom: '5px'
};

const tableStyle: React.CSSProperties = {
    width: '100%', fontSize: '10px', borderCollapse: 'collapse'
};

const labelStyle: React.CSSProperties = {
    fontWeight: 'bold', width: '30%', padding: '2px', borderBottom: '1px solid #ccc'
};

const valueStyle: React.CSSProperties = {
    padding: '2px', borderBottom: '1px solid #ccc'
};

const footerGridStyle: React.CSSProperties = {
    display: 'flex', marginTop: '10px', borderTop: '2px solid black', paddingTop: '5px'
};

const boxItemStyle: React.CSSProperties = {
    flex: 1, textAlign: 'center', borderRight: '1px solid black'
};

const labelSmallStyle: React.CSSProperties = {
    display: 'block', fontSize: '8px', fontWeight: 'bold'
};

export default RotuloCaja;
