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

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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

  const headCells = [
    { id: 'codigo', label: 'Código', width: 90 },
    { id: 'descricao', label: 'Descrição' },
    { id: 'codigoBarras', label: 'Cód. Barras', width: 150 },
    { id: 'valorVenda', label: 'Valor Venda', width: 130, align: 'right' },
    { id: 'pesoBruto', label: 'P. Bruto', width: 110, align: 'right' },
    { id: 'pesoLiquido', label: 'P. Líquido', width: 110, align: 'right' },
  ];

  const tableSx = {
    bgcolor: 'transparent',
    '& .MuiTableCell-head': {
      bgcolor: 'var(--surface-hover)',
      color: 'var(--text-secondary)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid var(--border)',
      py: 1.5,
    },
    '& .MuiTableCell-body': {
      color: 'var(--text-primary)',
      fontSize: 13.5,
      borderBottom: '1px solid var(--border)',
      py: 1.25,
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

      {/* Header */}
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
        {/* Search bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid var(--border)' }}>
          <TextField
            size="small"
            placeholder="Buscar por código, descrição ou cód. barras..."
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
              width: 340,
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
              <Skeleton key={i} height={48} sx={{ bgcolor: 'var(--surface-hover)', mb: 0.5, borderRadius: 1 }} />
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
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Chip
                        label={`#${p.codigo}`}
                        size="small"
                        sx={{
                          bgcolor: 'var(--primary-light)', color: 'var(--primary)',
                          fontWeight: 700, fontSize: 11, height: 22, borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{p.descricao}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {p.codigoBarras}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, color: 'var(--success)', fontSize: 13.5 }}>
                        {formatCurrency(p.valorVenda)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {p.pesoBruto.toFixed(3)} kg
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {p.pesoLiquido.toFixed(3)} kg
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => navigate(`/produtos/${p.id}`)}
                            sx={{ color: 'var(--secondary)', bgcolor: 'var(--secondary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { opacity: 0.8 } }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => navigate(`/produtos/${p.id}/editar`)}
                            sx={{ color: 'var(--primary)', bgcolor: 'var(--primary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { opacity: 0.8 } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteTarget(p)}
                            sx={{ color: 'var(--error)', bgcolor: 'var(--error-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { opacity: 0.8 } }}>
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
