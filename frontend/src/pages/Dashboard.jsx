import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bem-vindo, {user?.nome}!</p>
      </div>
      <div className="dashboard-cards">
        <div className="dash-card" onClick={() => navigate('/produtos')}>
          <div className="dash-card-icon dash-icon-products">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="dash-card-content">
            <h3>Produtos</h3>
            <p>Gerenciar catálogo de produtos</p>
          </div>
        </div>
        <div className="dash-card" onClick={() => navigate('/clientes')}>
          <div className="dash-card-icon dash-icon-clients">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="dash-card-content">
            <h3>Clientes</h3>
            <p>Gerenciar cadastro de clientes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
