import React from 'react';
import { MdMenu } from 'react-icons/md';

interface AppBarProps {
  onMenuClick: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  return (
    <div className="app-bar">
      <button className="icon-btn menu-btn" onClick={onMenuClick}>
        <MdMenu size={24} />
      </button>
      <div className="app-bar-title">Mi Aplicación</div>
      {/* Otros elementos como el avatar del usuario podrían ir aquí */}
    </div>
  );
};

export default AppBar;
