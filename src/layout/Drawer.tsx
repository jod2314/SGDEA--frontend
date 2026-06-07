import React from 'react';
import { NavLink } from 'react-router-dom';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';

const MdDashboard = (IconsMd as any).MdDashboard;
const MdPerson = (IconsMd as any).MdPerson;
const MdLogout = (IconsMd as any).MdLogout;
const MdDescription = (IconsMd as any).MdDescription || (IconsMd as any).MdInsertDriveFile;
const MdPeople = (IconsMd as any).MdPeople;
const MdSettings = (IconsMd as any).MdSettings;
const MdAccountTree = (IconsMd as any).MdAccountTree;
const MdLock = (IconsMd as any).MdLock;
const MdLibraryBooks = (IconsMd as any).MdLibraryBooks;
const MdHistory = (IconsMd as any).MdHistory;
const MdNumbers = (IconsMd as any).MdNumbers;
const MdFactCheck = (IconsMd as any).MdFactCheck;
const MdFolderSpecial = (IconsMd as any).MdFolderSpecial;
const MdSwapHoriz = (IconsMd as any).MdSwapHoriz;
const MdDeleteSweep = (IconsMd as any).MdDeleteSweep;
const MdPushPin = (IconsMd as any).MdPushPin;
const MdSecurity = (IconsMd as any).MdSecurity || (IconsMd as any).MdLock;

interface DrawerProps {
  isOpen: boolean;
  isPinned: boolean;
  onPinToggle: () => void;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, isPinned, onPinToggle, onLogout }) => {
  const auth = useAuth();
  const selectedEmpresa = auth.getSelectedEmpresa();
  const isOnboardingCompleted = selectedEmpresa?.onboardingCompleted || selectedEmpresa?.isPersonal;
  const [isHoverDisabled, setIsHoverDisabled] = React.useState(false);

  React.useEffect(() => {
    if (!isPinned) {
      // Deshabilitar temporalmente el hover al desfijar
      setIsHoverDisabled(true);
      const timer = setTimeout(() => {
        setIsHoverDisabled(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPinned]);

  return (
    <aside 
      className={`drawer ${isOpen ? 'open' : ''} ${isPinned ? 'pinned' : 'unpinned'} ${isHoverDisabled ? 'hover-disabled' : ''}`}
      onMouseLeave={() => setIsHoverDisabled(false)}
    >
      <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '5px' }}>
        <h3>SGDEA</h3>
        <button 
          className="icon-btn pin-btn" 
          onClick={onPinToggle} 
          title={isPinned ? "Desfijar barra lateral" : "Fijar barra lateral"}
          style={{ color: isPinned ? 'var(--primary)' : 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <MdPushPin style={{ transform: isPinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform 0.2s', fontSize: '1.1rem' }} />
        </button>
      </div>
      <nav>
        <ul className="drawer-menu">
          <li className="drawer-menu-title">Análisis</li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdDashboard />
                <span>Dashboard</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/dashboard">
                <MdDashboard />
                <span>Dashboard</span>
              </NavLink>
            )}
          </li>
        </ul>
        <div className="drawer-divider"></div>
        <ul className="drawer-menu">
          <li className="drawer-menu-title">Gestión Documental</li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdDescription />
                <span>Plantillas</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/plantillas">
                <MdDescription />
                <span>Plantillas</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdNumbers />
                <span>Consecutivos</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/consecutivos">
                <MdNumbers />
                <span>Consecutivos</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdLibraryBooks />
                <span>Series y Subseries</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/series-subseries">
                <MdLibraryBooks />
                <span>Series y Subseries</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdSettings />
                <span>Configuración TRD</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/configuracion-trd">
                <MdSettings />
                <span>Configuración TRD</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            <NavLink to="/estructura-organizacional">
              <MdAccountTree />
              <span>Estructura Org.</span>
            </NavLink>
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdFactCheck />
                <span>Datos Maestros</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/datos-maestros">
                <MdFactCheck />
                <span>Datos Maestros</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdFolderSpecial />
                <span>Expedientes</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/expedientes">
                <MdFolderSpecial />
                <span>Expedientes</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdSwapHoriz />
                <span>Transferencias</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/transferencias">
                <MdSwapHoriz />
                <span>Transferencias</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdDeleteSweep />
                <span>Disposición Final</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/disposicion">
                <MdDeleteSweep />
                <span>Disposición Final</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdPeople />
                <span>Terceros (Entidades)</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/entidades">
                <MdPeople />
                <span>Terceros (Entidades)</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdHistory />
                <span>Fondos Acumulados</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/fondos-acumulados">
                <MdHistory />
                <span>Fondos Acumulados</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdPeople />
                <span>Comité de Archivo</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/comite-archivo">
                <MdPeople />
                <span>Comité de Archivo</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdFactCheck />
                <span>Tablas Valoración (TVD)</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/tabla-valoracion">
                <MdFactCheck />
                <span>Tablas Valoración (TVD)</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdSecurity />
                <span>Matriz de Riesgos</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/matriz-riesgos">
                <MdSecurity />
                <span>Matriz de Riesgos</span>
              </NavLink>
            )}
          </li>
        </ul>
        <div className="drawer-divider"></div>
        <ul className="drawer-menu">
          <li className="drawer-menu-title">Cuenta</li>
          <li className="drawer-menu-item">
            <NavLink to="/me">
              <MdPerson />
              <span>Profile</span>
            </NavLink>
          </li>
          <li className="drawer-menu-item">
            <NavLink to="/auditoria">
              <MdHistory />
              <span>Auditoría</span>
            </NavLink>
          </li>
          <li className="drawer-menu-item">
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
              <MdLogout />
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>
      <style>{`
        .menu-link-locked {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          color: #999;
          cursor: not-allowed;
          gap: 10px;
          position: relative;
        }
        .lock-icon {
          margin-left: auto;
          font-size: 0.8rem;
          opacity: 0.6;
        }
      `}</style>
    </aside>
  );
};

export default Drawer;
