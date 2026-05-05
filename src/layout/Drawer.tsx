import React from 'react';
import { NavLink } from 'react-router-dom';
import * as IconsMd from 'react-icons/md';
import { useAuth } from '../auth/AuthProvider';

const MdDashboard = IconsMd.MdDashboard as any;
const MdPerson = IconsMd.MdPerson as any;
const MdLogout = IconsMd.MdLogout as any;
const MdDescription = (IconsMd as any).MdDescription || (IconsMd as any).MdInsertDriveFile;
const MdPeople = (IconsMd as any).MdPeople;
const MdSettings = (IconsMd as any).MdSettings;
const MdAccountTree = (IconsMd as any).MdAccountTree;
const MdLock = (IconsMd as any).MdLock;
const MdLibraryBooks = (IconsMd as any).MdLibraryBooks;
const MdHistory = (IconsMd as any).MdHistory;

interface DrawerProps {
  isOpen: boolean;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onLogout }) => {
  const auth = useAuth();
  const selectedEmpresa = auth.getSelectedEmpresa();
  const isOnboardingCompleted = selectedEmpresa?.onboardingCompleted || selectedEmpresa?.isPersonal;

  return (
    <aside className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Maestro</h3>
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
