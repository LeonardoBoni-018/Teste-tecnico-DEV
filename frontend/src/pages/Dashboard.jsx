import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { produtosService, clientesService } from '../services/api';
import { Grid, Card, CardContent, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentProdutos, setRecentProdutos] = useState([]);
  const [recentClientes, setRecentClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [produtosRes, clientesRes] = await Promise.all([
          produtosService.getAll(),
          clientesService.getAll()
        ]);
        const produtos = produtosRes.data;
        const clientes = clientesRes.data;
        setRecentProdutos([...produtos].slice(-5).reverse());
        setRecentClientes([...clientes].slice(-5).reverse());
      } catch { /* empty */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDoc = (doc) => {
    if (!doc) return '—';
    const d = doc.replace(/\D/g, '');
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const sectionLabel = (text) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 0.5 }}>
      <Box sx={{ width: 3, height: 18, borderRadius: 2, background: 'var(--primary)' }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {text}
      </span>
    </Box>
  );

  const cardSx = {
    bgcolor: 'var(--surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{greeting()}, {user?.nome}!</p>
        </div>
      </div>

      {sectionLabel('Acesso Rápido')}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[
            { icon: <InventoryIcon sx={{ fontSize: 24 }} />, title: 'Produtos', desc: 'Gerenciar catálogo de produtos', path: '/produtos', color: 'var(--primary)', bg: 'var(--primary-light)' },
            { icon: <ListAltIcon sx={{ fontSize: 24 }} />, title: 'Clientes', desc: 'Gerenciar cadastro de clientes', path: '/clientes', color: 'var(--secondary)', bg: 'var(--secondary-light)' },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Card
                onClick={() => navigate(item.path)}
                sx={{
                  ...cardSx, cursor: 'pointer',
                  '&:hover': { boxShadow: 'var(--shadow)', borderColor: item.color, transform: 'translateY(-2px)' },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, px: 3 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 12, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{item.desc}</p>
                  </Box>
                  <Box sx={{ color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>→</Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {sectionLabel('Atividade Recente')}
      <div className="dash-recent-grid">
        <div className="dash-recent-card">
          <div className="dash-recent-header">
            <div className="dash-card-icon dash-icon-products" style={{ width: 36, height: 36, borderRadius: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="dash-recent-title">Produtos</h3>
            <button className="dash-recent-link" onClick={() => navigate('/produtos')}>Ver todos →</button>
          </div>
          <div className="dash-recent-list">
            {loading ? (
              <p className="dash-empty">Carregando...</p>
            ) : recentProdutos.length === 0 ? (
              <p className="dash-empty">Nenhum produto cadastrado.</p>
            ) : recentProdutos.map((p) => (
              <div key={p.id} className="dash-recent-item">
                <div className="dash-recent-item-info">
                  <span className="dash-recent-item-name">{p.descricao}</span>
                  <span className="dash-recent-item-sub">Cód. {p.codigo} · {p.codigoBarras}</span>
                </div>
                <span className="dash-recent-item-badge dash-badge-primary">
                  {formatCurrency(p.valorVenda)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-recent-card">
          <div className="dash-recent-header">
            <div className="dash-card-icon dash-icon-clients" style={{ width: 36, height: 36, borderRadius: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="dash-recent-title">Clientes</h3>
            <button className="dash-recent-link" onClick={() => navigate('/clientes')}>Ver todos →</button>
          </div>
          <div className="dash-recent-list">
            {loading ? (
              <p className="dash-empty">Carregando...</p>
            ) : recentClientes.length === 0 ? (
              <p className="dash-empty">Nenhum cliente cadastrado.</p>
            ) : recentClientes.map((c) => (
              <div key={c.id} className="dash-recent-item">
                <div className="dash-recent-item-info">
                  <span className="dash-recent-item-name">{c.nome}</span>
                  <span className="dash-recent-item-sub">{c.fantasia && `${c.fantasia} · `}{formatDoc(c.documento)}</span>
                </div>
                <span className="dash-recent-item-badge dash-badge-secondary">
                  Cód. {c.codigo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
