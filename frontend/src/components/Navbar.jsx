import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo size={32} />
      </div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/produtos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Produtos
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Clientes
        </NavLink>
      </div>
      <div className="navbar-actions">
        <button className="btn-icon" onClick={toggleTheme} title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}>
          {theme === 'light' ? '\u263E' : '\u2600'}
        </button>
        <span className="navbar-username">{user?.nome}</span>
        <button className="btn btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
}
