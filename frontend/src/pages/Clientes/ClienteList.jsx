import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, IconButton, Tooltip,
  InputAdornment, TextField, Chip, Typography, Button, Skeleton, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const formatDoc = (doc) => {
  if (!doc) return '—';
  const d = doc.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
};

const getInitials = (name) =>
  name ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() : '?';

const avatarColor = (name) => {
  const colors = ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (name.charCodeAt(i) + h * 31) % colors.length;
  return colors[h];
};

export default function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('codigo');
  const navigate = useNavigate();

  const fetchClientes = useCallback(async () => {
    try {
      const response = await clientesService.getAll();
      setClientes(response.data);
    } catch {
      setToast({ type: 'error', message: 'Erro ao carregar clientes' });
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await clientesService.getAll();
        setClientes(response.data);
      } catch {
        setToast({ type: 'error', message: 'Erro ao carregar clientes' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await clientesService.delete(deleteTarget.id);
      setToast({ type: 'success', message: 'Cliente excluído com sucesso!' });
      setDeleteTarget(null);
      fetchClientes();
    } catch {
      setToast({ type: 'error', message: 'Erro ao excluir cliente' });
    }
  };

  const handleSort = (col) => {
    setOrder(orderBy === col && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(col);
  };

  const filtered = clientes
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        String(c.codigo).includes(q) ||
        c.nome.toLowerCase().includes(q) ||
        c.fantasia.toLowerCase().includes(q) ||
        c.documento.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
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
    { id: 'nome', label: 'Nome / Fantasia' },
    { id: 'documento', label: 'Documento', width: 170 },
    { id: 'endereco', label: 'Endereço' },
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
    '& .MuiTableSortLabel-root.Mui-active': { color: 'var(--secondary)' },
    '& .MuiTableSortLabel-icon': { color: 'var(--secondary) !important' },
  };

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir Cliente"
          message={`Deseja realmente excluir o cliente "${deleteTarget.nome}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 24 }}>
            Clientes
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.5 }}>
            {clientes.length} cliente(s) cadastrado(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clientes/novo')}
          sx={{
            bgcolor: 'var(--secondary)', color: '#fff', borderRadius: '10px',
            textTransform: 'none', fontWeight: 600, fontSize: 14, px: 2.5,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#00a38d', boxShadow: 'none' },
          }}
        >
          Novo Cliente
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
            placeholder="Buscar por código, nome, fantasia ou documento..."
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
                '&.Mui-focused fieldset': { borderColor: 'var(--secondary)' },
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
            <PeopleAltIcon sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 1.5 }} />
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: 14, mb: 2 }}>
              {search ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
            </Typography>
            {!search && (
              <Button
                variant="outlined"
                onClick={() => navigate('/clientes/novo')}
                sx={{
                  borderColor: 'var(--secondary)', color: 'var(--secondary)',
                  borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'var(--secondary-light)', borderColor: 'var(--secondary)' },
                }}
              >
                Cadastrar primeiro cliente
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={tableSx}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((h) => (
                    <TableCell key={h.id} sx={{ width: h.width }}>
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
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Chip
                        label={`#${c.codigo}`}
                        size="small"
                        sx={{
                          bgcolor: 'var(--secondary-light)', color: 'var(--secondary)',
                          fontWeight: 700, fontSize: 11, height: 22, borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                          width: 32, height: 32, fontSize: 12, fontWeight: 700,
                          bgcolor: avatarColor(c.nome), flexShrink: 0,
                        }}>
                          {getInitials(c.nome)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.2 }}>{c.nome}</Typography>
                          {c.fantasia && (
                            <Typography sx={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.2 }}>{c.fantasia}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {formatDoc(c.documento)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 260,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.endereco}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => navigate(`/clientes/${c.id}`)}
                            sx={{ color: 'var(--secondary)', bgcolor: 'var(--secondary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { opacity: 0.8 } }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => navigate(`/clientes/${c.id}/editar`)}
                            sx={{ color: 'var(--primary)', bgcolor: 'var(--primary-light)', borderRadius: '8px', p: '6px',
                              '&:hover': { opacity: 0.8 } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteTarget(c)}
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
