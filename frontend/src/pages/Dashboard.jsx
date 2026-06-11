import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { produtosService, clientesService } from '../services/api';
import { Grid, Card, CardContent, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ produtos: 0, clientes: 0 });

  useEffect(() => {
    Promise.all([
      produtosService.getAll(),
      clientesService.getAll()
    ]).then(([produtosRes, clientesRes]) => {
      setStats({
        produtos: produtosRes.data.length,
        clientes: clientesRes.data.length
      });
    }).catch(() => {});
  }, []);

  const total = stats.produtos + stats.clientes;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bem-vindo, {user?.nome}!</p>
      </div>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                bgcolor: 'var(--surface)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 'var(--shadow)',
                  borderColor: 'var(--primary)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <div className="dash-card-icon dash-icon-products" style={{ margin: '0 auto 12px' }}>
                  <InventoryIcon />
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {stats.produtos}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Produtos cadastrados
                </p>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                bgcolor: 'var(--surface)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 'var(--shadow)',
                  borderColor: 'var(--secondary)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <div className="dash-card-icon dash-icon-clients" style={{ margin: '0 auto 12px' }}>
                  <PeopleIcon />
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {stats.clientes}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Clientes cadastrados
                </p>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                bgcolor: 'var(--surface)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 'var(--shadow)',
                  borderColor: 'var(--text-muted)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <div className="dash-card-icon" style={{
                  margin: '0 auto 12px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {total}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Total de registros
                </p>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

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
