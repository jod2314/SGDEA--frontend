import React from 'react';
import { NavLink } from 'react-router-dom';
import * as IconsMd from 'react-icons/md';

const MdDashboard = IconsMd.MdDashboard as any;
const MdPerson = IconsMd.MdPerson as any;
const MdLogout = IconsMd.MdLogout as any;
const MdDescription = (IconsMd as any).MdDescription || (IconsMd as any).MdInsertDriveFile;
const MdPeople = (IconsMd as any).MdPeople;
const MdSettings = (IconsMd as any).MdSettings;

interface DrawerProps {
  isOpen: boolean;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onLogout }) => {

  return (
    <aside className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Maestro</h3>
      </div>
      <nav>
        <ul className="drawer-menu">
          <li className="drawer-menu-title">Análisis</li>
          <li className="drawer-menu-item">
            <NavLink to="/dashboard">
              <MdDashboard />
              <span>Dashboard</span>
            </NavLink>
          </li>
        </ul>
        <div className="drawer-divider"></div>
        <ul className="drawer-menu">
          <li className="drawer-menu-title">Gestión Documental</li>
          <li className="drawer-menu-item">
            <NavLink to="/plantillas">
              <MdDescription />
              <span>Plantillas</span>
            </NavLink>
          </li>
          <li className="drawer-menu-item">
            <NavLink to="/configuracion-trd">
              <MdSettings />
              <span>Configuración TRD</span>
            </NavLink>
          </li>
          <li className="drawer-menu-item">
            <NavLink to="/entidades">
              <MdPeople />
              <span>Terceros (Entidades)</span>
            </NavLink>
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
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>
              <MdLogout />
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Drawer;
