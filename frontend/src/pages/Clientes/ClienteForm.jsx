import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientesService } from '../../services/api';
import Toast from '../../components/Toast';
import {
  Box, Card, Typography, Button, TextField, InputAdornment,
  Divider, CircularProgress, Skeleton, Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import TagIcon from '@mui/icons-material/Tag';
import BadgeIcon from '@mui/icons-material/Badge';
import StoreIcon from '@mui/icons-material/Store';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function maskDocument(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }
  return cleaned
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

function validateDocument(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11 || cleaned.length === 14) return '';
  return 'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)';
}

const getInitials = (name) =>
  name ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() : '?';

const avatarColor = (name) => {
  const colors = ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (name.charCodeAt(i) + h * 31) % colors.length;
  return colors[h];
};

const fieldSx = (hasError) => ({
  '& .MuiOutlinedInput-root': {
    bgcolor: 'var(--surface-hover)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: 14,
    '& fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--border)' },
    '&:hover fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--border-focus)' },
    '&.Mui-focused fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--secondary)', borderWidth: 2 },
    '&.Mui-disabled': { bgcolor: 'var(--surface)', opacity: 0.7 },
  },
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)', fontSize: 13 },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--secondary)' },
  '& .MuiFormHelperText-root': { color: hasError ? 'var(--error)' : 'var(--text-muted)', fontSize: 11.5, mx: 0 },
  '& .MuiInputAdornment-root svg': { color: 'var(--text-muted)', fontSize: 18 },
});

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = window.location.pathname.endsWith('/editar');
  const isView = Boolean(id) && !isEditing;

  const [formData, setFormData] = useState({
    codigo: '', nome: '', fantasia: '', documento: '', endereco: '',
  });
  const [loading, setLoading] = useState(() => !!id);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      clientesService.getById(id)
        .then((res) => {
          const c = res.data;
          setFormData({ codigo: c.codigo, nome: c.nome, fantasia: c.fantasia, documento: c.documento, endereco: c.endereco });
        })
        .catch(() => setToast({ type: 'error', message: 'Erro ao carregar cliente' }))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documento') {
      setFormData((prev) => ({ ...prev, documento: maskDocument(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.codigo || Number(formData.codigo) <= 0) e.codigo = 'Código deve ser um número positivo';
    if (!formData.nome.trim()) e.nome = 'Nome é obrigatório';
    else if (formData.nome.length > 60) e.nome = 'Máximo 60 caracteres';
    if (!formData.fantasia.trim()) e.fantasia = 'Fantasia é obrigatório';
    else if (formData.fantasia.length > 100) e.fantasia = 'Máximo 100 caracteres';
    const docError = validateDocument(formData.documento);
    if (docError) e.documento = docError;
    if (!formData.endereco.trim()) e.endereco = 'Endereço é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...formData, codigo: Number(formData.codigo), documento: formData.documento.replace(/\D/g, '') };
    setSaving(true);
    try {
      if (isEditing) {
        await clientesService.update(id, data);
        setToast({ type: 'success', message: 'Cliente atualizado com sucesso!' });
      } else {
        await clientesService.create(data);
        setToast({ type: 'success', message: 'Cliente cadastrado com sucesso!' });
      }
      setTimeout(() => navigate('/clientes'), 1000);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Erro ao salvar cliente' });
    } finally {
      setSaving(false);
    }
  };

  const modeLabel = isView ? 'Visualizar' : isEditing ? 'Editar' : 'Novo';
  const modeColor = isView ? 'var(--secondary)' : isEditing ? 'var(--warning)' : 'var(--secondary)';

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clientes')}
          sx={{
            color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 500, fontSize: 13,
            '&:hover': { color: 'var(--secondary)', bgcolor: 'var(--secondary-light)' },
          }}
        >
          Clientes
        </Button>
        <Typography sx={{ color: 'var(--text-muted)' }}>/</Typography>
        <Typography sx={{ fontSize: 13, color: modeColor, fontWeight: 600 }}>{modeLabel}</Typography>
      </Box>

      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {(isView || isEditing) && formData.nome && (
            <Avatar sx={{ width: 44, height: 44, bgcolor: avatarColor(formData.nome), fontWeight: 700, fontSize: 16 }}>
              {getInitials(formData.nome)}
            </Avatar>
          )}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 24 }}>
              {(isView || isEditing) && formData.nome ? formData.nome : `${modeLabel} Cliente`}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.5 }}>
              {isView ? 'Visualizando dados do cliente' : 'Preencha os dados do cliente abaixo'}
            </Typography>
          </Box>
        </Box>
        {isView && (
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clientes/${id}/editar`)}
            variant="outlined"
            sx={{
              borderColor: 'var(--secondary)', color: 'var(--secondary)', borderRadius: '10px',
              textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: 'var(--secondary-light)', borderColor: 'var(--secondary)' },
            }}
          >
            Editar
          </Button>
        )}
      </Box>

      {loading ? (
        <Card sx={{ bgcolor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', p: 3 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} height={56} sx={{ bgcolor: 'var(--surface-hover)', mb: 1.5, borderRadius: 1 }} />)}
        </Card>
      ) : (
        <Card sx={{
          bgcolor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Section header */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border)' }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Identificação
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
            {/* Row 1: Código + Documento */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>
              <TextField
                label="Código"
                name="codigo"
                type="number"
                value={formData.codigo}
                onChange={handleChange}
                disabled={isView}
                error={Boolean(errors.codigo)}
                helperText={errors.codigo}
                inputProps={{ min: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon /></InputAdornment> }}
                sx={fieldSx(errors.codigo)}
              />
              <TextField
                label="Documento (CPF/CNPJ)"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                disabled={isView}
                error={Boolean(errors.documento)}
                helperText={errors.documento || 'CPF: 000.000.000-00 · CNPJ: 00.000.000/0000-00'}
                inputProps={{ maxLength: 18 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><FingerprintIcon /></InputAdornment> }}
                sx={fieldSx(errors.documento)}
              />
            </Box>

            {/* Row 2: Nome + Fantasia */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>
              <TextField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={(e) => { if (e.target.value.length <= 60) handleChange(e); }}
                disabled={isView}
                error={Boolean(errors.nome)}
                helperText={errors.nome || `${formData.nome.length}/60 caracteres`}
                inputProps={{ maxLength: 60 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
                sx={fieldSx(errors.nome)}
              />
              <TextField
                label="Nome Fantasia"
                name="fantasia"
                value={formData.fantasia}
                onChange={(e) => { if (e.target.value.length <= 100) handleChange(e); }}
                disabled={isView}
                error={Boolean(errors.fantasia)}
                helperText={errors.fantasia || `${formData.fantasia.length}/100 caracteres`}
                inputProps={{ maxLength: 100 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><StoreIcon /></InputAdornment> }}
                sx={fieldSx(errors.fantasia)}
              />
            </Box>

            <Divider sx={{ borderColor: 'var(--border)', mb: 2.5 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
              Localização
            </Typography>

            <TextField
              fullWidth
              label="Endereço"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              disabled={isView}
              multiline
              rows={3}
              error={Boolean(errors.endereco)}
              helperText={errors.endereco}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><LocationOnIcon /></InputAdornment> }}
              sx={fieldSx(errors.endereco)}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5, pt: 2.5, borderTop: '1px solid var(--border)' }}>
              <Button
                onClick={() => navigate('/clientes')}
                sx={{
                  color: 'var(--text-secondary)', borderRadius: '10px', textTransform: 'none',
                  fontWeight: 600, border: '1px solid var(--border)', px: 2.5,
                  '&:hover': { bgcolor: 'var(--surface-hover)' },
                }}
              >
                Voltar
              </Button>
              {!isView && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{
                    bgcolor: 'var(--secondary)', color: '#fff', borderRadius: '10px',
                    textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none',
                    '&:hover': { bgcolor: '#00a38d', boxShadow: 'none' },
                    '&:disabled': { opacity: 0.7 },
                  }}
                >
                  {saving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
                </Button>
              )}
            </Box>
          </Box>
        </Card>
      )}
    </div>
  );
}
