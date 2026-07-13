import React, { useState, useEffect, useRef } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import { Empresa, ApiResponse, MisEmpresasResponse } from '../types/types';
import { useNavigate } from 'react-router-dom';

const MdBusiness = (IconsMd as any).MdBusiness;
const MdPerson = (IconsMd as any).MdPerson;
const MdKeyboardArrowDown = (IconsMd as any).MdKeyboardArrowDown;
const MdAdd = (IconsMd as any).MdAdd;

export const EmpresaDropdown: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const selectedEmpresa = auth.getSelectedEmpresa();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cargar las empresas del usuario
  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const json = await auth.request<ApiResponse<MisEmpresasResponse>>("/empresas/mis-empresas");
        setEmpresas(json.body.empresas || []);
      } catch (error) {
        // Silenciar error de carga de empresas para evitar ruidos en consola
      }
    }

    if (auth.isAuthenticated) {
      fetchEmpresas();
    }
  }, [auth.isAuthenticated, auth]);

  // Manejar cierre del menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cambiar el contexto de la empresa seleccionada
  function handleSwitch(empresa: Empresa) {
    auth.setSelectedEmpresa(empresa);
    setIsMenuOpen(false);
    navigate("/dashboard");
  }

  if (!selectedEmpresa) return null;

  const personalSpace = empresas.find(e => e.isPersonal);
  const corporateEmpresas = empresas.filter(e => !e.isPersonal);

  return (
    <div className="context-indicator" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
      <span className="separator">|</span>
      {selectedEmpresa.isPersonal ? (
        <MdPerson className="context-icon" />
      ) : (
        <MdBusiness className="context-icon" />
      )}
      <span className="context-name">{selectedEmpresa.razonSocial}</span>
      <MdKeyboardArrowDown className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`} />

      {isMenuOpen && (
        <div className="context-menu" onClick={(e) => e.stopPropagation()}>
          <div className="menu-section-title">Tu Espacio</div>
          {personalSpace && (
            <div 
              className={`menu-item ${selectedEmpresa.id === personalSpace.id ? 'active' : ''}`}
              onClick={() => handleSwitch(personalSpace)}
            >
              <div className="item-icon"><MdPerson /></div>
              <div className="item-info">
                <span className="item-name">Mi Área Personal</span>
                <span className="item-detail">Persona Natural</span>
              </div>
            </div>
          )}

          {corporateEmpresas.length > 0 && (
            <>
              <div className="menu-divider"></div>
              <div className="menu-section-title">Organizaciones</div>
              {corporateEmpresas.map(emp => (
                <div 
                  key={emp.id}
                  className={`menu-item ${selectedEmpresa.id === emp.id ? 'active' : ''}`}
                  onClick={() => handleSwitch(emp)}
                >
                  <div className="item-icon"><MdBusiness /></div>
                  <div className="item-info">
                    <span className="item-name">{emp.razonSocial}</span>
                    <span className="item-detail">NIT: {emp.nit} • {emp.rol}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="menu-divider"></div>
          <div className="menu-item" onClick={() => { setIsMenuOpen(false); navigate("/crear-empresa"); }}>
            <div className="item-icon"><MdAdd /></div>
            <div className="item-info">
              <span className="item-name">Registrar nueva empresa</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
