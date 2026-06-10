import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">SL</span>
        <span className="navbar-title">SoftLine</span>
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
      <div className="navbar-user">
        <span className="navbar-username">{user?.nome}</span>
        <button className="btn btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
}
