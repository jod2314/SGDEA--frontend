import React from 'react';
import { NavLink } from 'react-router-dom';
import * as IconsMd from 'react-icons/md';

const MdDashboard = IconsMd.MdDashboard as any;
const MdPerson = IconsMd.MdPerson as any;
const MdLogout = IconsMd.MdLogout as any;
const MdOutlineScience = IconsMd.MdOutlineScience as any;
const MdInventory = IconsMd.MdInventory as any;
const MdOutlineTableView = IconsMd.MdOutlineTableView as any;
const MdNoteAdd = IconsMd.MdNoteAdd as any;
const MdFolder = IconsMd.MdFolder as any;
const MdHistory = IconsMd.MdHistory as any;

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
