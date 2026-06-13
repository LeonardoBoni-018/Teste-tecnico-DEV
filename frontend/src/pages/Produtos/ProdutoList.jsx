import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { produtosService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, IconButton, Tooltip,
  InputAdornment, TextField, Chip, Typography, Button, Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import ScaleIcon from '@mui/icons-material/Scale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const headCells = [
  { id: 'codigo', label: 'Código', width: 100, align: 'center' },
  { id: 'descricao', label: 'Descrição', width: 'auto' },
  { id: 'codigoBarras', label: 'Código de Barras', width: 160, align: 'center' },
  { id: 'valorVenda', label: 'Valor de Venda', width: 150, align: 'right' },
  { id: 'pesoBruto', label: 'Peso Bruto', width: 130, align: 'right' },
  { id: 'pesoLiquido', label: 'Peso Líquido', width: 130, align: 'right' },
];

export default function ProdutoList() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('codigo');
  const navigate = useNavigate();

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await produtosService.getAll();
      setProdutos(response.data);
    } catch {
      setToast({ type: 'error', message: 'Erro ao carregar produtos' });
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await produtosService.getAll();
        setProdutos(response.data);
      } catch {
        setToast({ type: 'error', message: 'Erro ao carregar produtos' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await produtosService.delete(deleteTarget.id);
      setToast({ type: 'success', message: 'Produto excluído com sucesso!' });
      setDeleteTarget(null);
      fetchProdutos();
    } catch {
      setToast({ type: 'error', message: 'Erro ao excluir produto' });
    }
  };

  const handleSort = (col) => {
    setOrder(orderBy === col && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(col);
  };

  const filtered = produtos
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        String(p.codigo).includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        p.codigoBarras.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const va = a[orderBy]; const vb = b[orderBy];
      if (va < vb) return order === 'asc' ? -1 : 1;
      if (va > vb) return order === 'asc' ? 1 : -1;
      return 0;
    });

  const tableSx = {
    bgcolor: 'transparent',
    '& .MuiTableCell-head': {
      bgcolor: 'var(--surface-hover)',
      color: 'var(--text-secondary)',
      fontSize: 11.5,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      borderBottom: '2px solid var(--border)',
      py: 1.6,
    },
    '& .MuiTableCell-body': {
      color: 'var(--text-primary)',
      fontSize: 13.5,
      borderBottom: '1px solid var(--border)',
      py: 1.4,
    },
    '& .MuiTableRow-root:last-child .MuiTableCell-body': { borderBottom: 'none' },
    '& .MuiTableRow-root:hover .MuiTableCell-body': { bgcolor: 'var(--surface-hover)' },
    '& .MuiTableSortLabel-root': { color: 'var(--text-secondary)' },
    '& .MuiTableSortLabel-root.Mui-active': { color: 'var(--primary)' },
    '& .MuiTableSortLabel-icon': { color: 'var(--primary) !important' },
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir Produto"
          message={`Deseja realmente excluir o produto "${deleteTarget.descricao}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 24 }}>
            Produtos
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.5 }}>
            {produtos.length} produto(s) cadastrado(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/produtos/novo')}
          sx={{
            bgcolor: 'var(--primary)', color: '#fff', borderRadius: '10px',
            textTransform: 'none', fontWeight: 600, fontSize: 14, px: 2.5,
            boxShadow: 'none',
            '&:hover': { bgcolor: 'var(--primary-hover)', boxShadow: 'none' },
          }}
        >
          Novo Produto
        </Button>
      </Box>

      <Card sx={{
        bgcolor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
          <TextField
            size="small"
            placeholder="Buscar por código, descrição ou código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 380,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--surface-hover)',
                borderRadius: '8px',
                fontSize: 13,
                color: 'var(--text-primary)',
                '& fieldset': { borderColor: 'var(--border)' },
                '&:hover fieldset': { borderColor: 'var(--border-focus)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
              },
              '& input::placeholder': { color: 'var(--text-muted)' },
            }}
          />
          {search && (
            <Typography component="span" sx={{ ml: 2, fontSize: 12, color: 'var(--text-muted)' }}>
              {filtered.length} resultado(s)
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={52} sx={{ bgcolor: 'var(--surface-hover)', mb: 0.5, borderRadius: 1 }} />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <InventoryIcon sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 1.5 }} />
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14, mb: 2 }}>
              {search ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto cadastrado.'}
            </Typography>
            {!search && (
              <Button
                variant="outlined"
                onClick={() => navigate('/produtos/novo')}
                sx={{
                  borderColor: 'var(--primary)', color: 'var(--primary)',
                  borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'var(--primary-light)', borderColor: 'var(--primary)' },
                }}
              >
                Cadastrar primeiro produto
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={tableSx}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((h) => (
                    <TableCell key={h.id} align={h.align || 'left'} sx={{ width: h.width }}>
                      <TableSortLabel
                        active={orderBy === h.id}
                        direction={orderBy === h.id ? order : 'asc'}
                        onClick={() => handleSort(h.id)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ width: 130 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell align="center">
                      <Chip
                        label={`#${p.codigo}`}
                        size="small"
                        sx={{
                          bgcolor: 'var(--primary-light)', color: 'var(--primary)',
                          fontWeight: 700, fontSize: 11.5, height: 24, borderRadius: '6px',
                          minWidth: 52,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: 13.5 }}>{p.descricao}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontFamily: 'Consolas, monospace', fontSize: 12.5, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                        {p.codigoBarras}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <AttachMoneyIcon sx={{ fontSize: 14, color: 'var(--success)', opacity: 0.7 }} />
                        <Typography sx={{ fontWeight: 600, color: 'var(--success)', fontSize: 13.5 }}>
                          {formatCurrency(p.valorVenda)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <ScaleIcon sx={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.5 }} />
                        <Typography sx={{ fontFamily: 'Consolas, monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {p.pesoBruto.toFixed(3)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <ScaleIcon sx={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.5 }} />
                        <Typography sx={{ fontFamily: 'Consolas, monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {p.pesoLiquido.toFixed(3)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => navigate(`/produtos/${p.id}`)}
                            sx={{ color: 'var(--secondary)', bgcolor: 'var(--secondary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { bgcolor: 'var(--secondary)', color: '#fff' } }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => navigate(`/produtos/${p.id}/editar`)}
                            sx={{ color: 'var(--primary)', bgcolor: 'var(--primary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { bgcolor: 'var(--primary)', color: '#fff' } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteTarget(p)}
                            sx={{ color: 'var(--error)', bgcolor: 'var(--error-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { bgcolor: 'var(--error)', color: '#fff' } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}
