import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdPerson, MdLogout } from 'react-icons/md';

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
