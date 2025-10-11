import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdPerson, MdLogout, MdOutlineScience, MdInventory, MdOutlineTableView, MdNoteAdd } from 'react-icons/md';

interface DrawerProps {
  isOpen: boolean;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onLogout }) => {

  return (
    <aside className={`drawer ${isOpen ? 'open' : ''}`}>
      <nav>
        <ul>
          <li>
            <NavLink to="/diagnostico">
              <MdOutlineScience />
              <span>Diagnóstico</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/diagnostico-assistant">
              <MdNoteAdd />
              <span>Nuevo Diagnóstico</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventario">
              <MdInventory />
              <span>Inventario</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/tvd">
              <MdOutlineTableView />
              <span>Asistente TVD</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard">
              <MdDashboard />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/me">
              <MdPerson />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
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
