import React, { useState, useEffect, useRef } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import { Empresa } from '../types/types';
import { useNavigate } from 'react-router-dom';

const MdMenu = (IconsMd as any).MdMenu;
const MdBusiness = (IconsMd as any).MdBusiness;
const MdPerson = (IconsMd as any).MdPerson;
const MdKeyboardArrowDown = (IconsMd as any).MdKeyboardArrowDown;
const MdAdd = (IconsMd as any).MdAdd;
const MdAutoAwesome = (IconsMd as any).MdAutoAwesome;
const MdLogout = (IconsMd as any).MdLogout;

interface AppBarProps {
  onMenuClick: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const selectedEmpresa = auth.getSelectedEmpresa();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOnboardingPending = selectedEmpresa && !selectedEmpresa.onboardingCompleted && !selectedEmpresa.isPersonal;

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const json = await auth.request<any>("/empresas/mis-empresas");
        setEmpresas(json.body.empresas || []);
      } catch (error) {
        console.error("Error al cargar empresas:", error);
      }
    }

    if (auth.isAuthenticated) {
      fetchEmpresas();
    }
  }, [auth.isAuthenticated, auth]);

  async function handleSignOut() {
    if (!confirm("¿Deseas cerrar la sesión en SGDEA?")) return;
    try {
      await auth.request<any>("/signout", {
        method: "DELETE"
      });
      auth.signout();
    } catch (error) {
      console.log(error);
      auth.signout();
    }
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSwitch(empresa: Empresa) {
    auth.setSelectedEmpresa(empresa);
    setIsMenuOpen(false);
    // Forzar recarga de datos o redirigir
    navigate("/dashboard");
  }

  const personalSpace = empresas.find(e => e.isPersonal);
  const corporateEmpresas = empresas.filter(e => !e.isPersonal);

  return (
    <div className="app-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <button className="icon-btn menu-btn" onClick={onMenuClick}>
          <MdMenu size={24} />
        </button>
        
        <div className="app-bar-content" ref={menuRef}>
          <div className="app-bar-title" onClick={() => navigate("/dashboard")} style={{cursor: 'pointer'}}>
            SGDEA
          </div>

          {isOnboardingPending && (
            <button 
              className="btn btn-primary btn-sm" 
              style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: '#8e44ad', border: 'none' }}
              onClick={() => navigate("/onboarding")}
            >
              <MdAutoAwesome /> Asistente de Implementación
            </button>
          )}

          {selectedEmpresa && (
            <div className="context-indicator" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="separator">|</span>
              {selectedEmpresa.isPersonal ? (
                <MdPerson className="context-icon" />
              ) : (
                <MdBusiness className="context-icon" />
              )}
              <span className="context-name">{selectedEmpresa.razonSocial}</span>
              <MdKeyboardArrowDown className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`} />

              {isMenuOpen && (
                <div className="context-menu">
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
          )}
        </div>
      </div>

      <div className="app-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={handleSignOut} 
          title="Cerrar sesión en la plataforma"
          style={{ height: '36px', borderRadius: '18px', padding: '0 15px', gap: '5px', fontSize: '0.9rem', border: '1px solid rgba(60,64,67,0.12)' }}
        >
          <MdLogout />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AppBar;
