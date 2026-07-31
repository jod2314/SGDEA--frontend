import React from 'react';
import { NavLink } from 'react-router-dom';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';

const MdDashboard = (IconsMd as any).MdDashboard;
const MdPerson = (IconsMd as any).MdPerson;
const MdLogout = (IconsMd as any).MdLogout;
const MdLock = (IconsMd as any).MdLock;
const MdHistory = (IconsMd as any).MdHistory;
const MdPushPin = (IconsMd as any).MdPushPin;
const MdFolderSpecial = (IconsMd as any).MdFolderSpecial;

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
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdFolderSpecial />
                <span>Gestión Documental (SGD)</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/sgd">
                <MdFolderSpecial />
                <span>Gestión Documental (SGD)</span>
              </NavLink>
            )}
          </li>
          <li className="drawer-menu-item">
            {!isOnboardingCompleted ? (
              <div className="menu-link-locked">
                <MdFolderSpecial />
                <span>Fondos Acumulados (FDA)</span>
                <MdLock className="lock-icon" />
              </div>
            ) : (
              <NavLink to="/fondos-acumulados">
                <MdFolderSpecial />
                <span>Fondos Acumulados (FDA)</span>
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
