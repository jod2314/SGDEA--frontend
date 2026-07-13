import React, { useState, useEffect } from 'react';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { EmpresaDropdown } from './EmpresaDropdown';
import { ApiResponse, SignOutResponse } from '../types/types';

const MdMenu = (IconsMd as any).MdMenu;
const MdAutoAwesome = (IconsMd as any).MdAutoAwesome;
const MdLogout = (IconsMd as any).MdLogout;
const MdSunny = (IconsMd as any).MdSunny;
const MdDarkMode = (IconsMd as any).MdDarkMode;
const MdFormatSize = (IconsMd as any).MdFormatSize;

interface AppBarProps {
  onMenuClick: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const selectedEmpresa = auth.getSelectedEmpresa();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<16 | 18 | 20>(16);

  const isOnboardingPending = selectedEmpresa && !selectedEmpresa.onboardingCompleted && !selectedEmpresa.isPersonal;

  // Cargar configuración de tema y tamaño de letra al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      document.documentElement.classList.toggle('dark-mode', defaultTheme === 'dark');
    }

    const savedFontSize = Number(localStorage.getItem('fontSize')) as 16 | 18 | 20 | null;
    if (savedFontSize && [16, 18, 20].includes(savedFontSize)) {
      setFontSize(savedFontSize);
      document.documentElement.style.setProperty('--font-size-base', `${savedFontSize}px`);
    }
  }, []);

  // Cambiar entre tema claro y oscuro
  function handleToggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    
    // Añadir clase temporal para animar la transición de forma controlada
    document.body.classList.add('theme-transitioning');
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark-mode', nextTheme === 'dark');

    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  // Cambiar secuencialmente el tamaño de la letra entre 16px, 18px y 20px
  function handleToggleFontSize() {
    let nextFontSize: 16 | 18 | 20 = 16;
    if (fontSize === 16) nextFontSize = 18;
    else if (fontSize === 18) nextFontSize = 20;
    else nextFontSize = 16;

    setFontSize(nextFontSize);
    localStorage.setItem('fontSize', String(nextFontSize));
    document.documentElement.style.setProperty('--font-size-base', `${nextFontSize}px`);
  }

  // Cerrar la sesión del usuario
  async function handleSignOut() {
    if (!confirm("¿Deseas cerrar la sesión en SGDEA?")) return;
    try {
      await auth.request<ApiResponse<SignOutResponse>>("/signout", {
        method: "DELETE"
      });
      auth.signout();
    } catch (error) {
      // Cierre de sesión silencioso ante errores de red o servidor
      auth.signout();
    }
  }

  return (
    <div className="app-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <button className="icon-btn menu-btn" onClick={onMenuClick}>
          <MdMenu size={24} />
        </button>
        
        <div className="app-bar-content">
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

          <EmpresaDropdown />
        </div>
      </div>

      <div className="app-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="icon-btn"
          onClick={handleToggleTheme}
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(60,64,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'light' ? <MdDarkMode size={20} /> : <MdSunny size={20} />}
        </button>

        <button
          className="icon-btn"
          onClick={handleToggleFontSize}
          title={`Cambiar tamaño de fuente (actual: ${fontSize}px)`}
          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(60,64,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
        >
          <MdFormatSize size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{fontSize}</span>
        </button>

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
