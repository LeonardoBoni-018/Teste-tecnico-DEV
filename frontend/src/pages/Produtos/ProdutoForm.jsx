import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { produtosService } from '../../services/api';
import Toast from '../../components/Toast';
import {
  Box, Card, Typography, Button, TextField, InputAdornment,
  Divider, CircularProgress, Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import TagIcon from '@mui/icons-material/Tag';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScaleIcon from '@mui/icons-material/Scale';

const fieldSx = (hasError) => ({
  '& .MuiOutlinedInput-root': {
    bgcolor: 'var(--surface-hover)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: 14,
    '& fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--border)' },
    '&:hover fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--border-focus)' },
    '&.Mui-focused fieldset': { borderColor: hasError ? 'var(--error)' : 'var(--primary)', borderWidth: 2 },
    '&.Mui-disabled': { bgcolor: 'var(--surface)', opacity: 0.7 },
  },
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)', fontSize: 13 },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary)' },
  '& .MuiFormHelperText-root': { color: hasError ? 'var(--error)' : 'var(--text-muted)', fontSize: 11.5, mx: 0 },
  '& .MuiInputAdornment-root svg': { color: 'var(--text-muted)', fontSize: 18 },
});

function FieldDisplay({ label, icon, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {icon && <Box sx={{ color: 'var(--text-muted)', fontSize: 16, display: 'flex' }}>{icon}</Box>}
        <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {label}
        </Typography>
      </Box>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Typography sx={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
          {children}
        </Typography>
      ) : children}
    </Box>
  );
}
export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = window.location.pathname.endsWith('/editar');
  const isView = Boolean(id) && !isEditing;

  const [formData, setFormData] = useState({
    codigo: '', descricao: '', codigoBarras: '',
    valorVenda: '', pesoBruto: '', pesoLiquido: '',
  });
  const [loading, setLoading] = useState(() => !!id);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      produtosService.getById(id)
        .then((res) => {
          const p = res.data;
          setFormData({
            codigo: p.codigo, descricao: p.descricao, codigoBarras: p.codigoBarras,
            valorVenda: p.valorVenda, pesoBruto: p.pesoBruto, pesoLiquido: p.pesoLiquido,
          });
        })
        .catch(() => setToast({ type: 'error', message: 'Erro ao carregar produto' }))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const decimalPlaces = (value) => String(value).split('.')[1]?.length || 0;

  const validate = () => {
    const e = {};
    if (!formData.codigo || Number(formData.codigo) <= 0) e.codigo = 'Código deve ser um número positivo';
    if (!formData.descricao.trim()) e.descricao = 'Descrição é obrigatória';
    else if (formData.descricao.length > 60) e.descricao = 'Máximo 60 caracteres';
    if (!formData.codigoBarras.trim()) e.codigoBarras = 'Código de Barras é obrigatório';
    else if (formData.codigoBarras.length > 14) e.codigoBarras = 'Máximo 14 caracteres';
    else if (!/^\d+$/.test(formData.codigoBarras)) e.codigoBarras = 'Código de Barras deve conter apenas números';
    if (!formData.valorVenda || Number(formData.valorVenda) <= 0) e.valorVenda = 'Valor deve ser maior que zero';
    else if (decimalPlaces(formData.valorVenda) > 2) e.valorVenda = 'Valor deve ter no máximo 2 casas decimais';
    if (!formData.pesoBruto || Number(formData.pesoBruto) <= 0) e.pesoBruto = 'Peso deve ser maior que zero';
    else if (decimalPlaces(formData.pesoBruto) > 3) e.pesoBruto = 'Peso deve ter no máximo 3 casas decimais';
    if (!formData.pesoLiquido || Number(formData.pesoLiquido) <= 0) e.pesoLiquido = 'Peso deve ser maior que zero';
    else if (decimalPlaces(formData.pesoLiquido) > 3) e.pesoLiquido = 'Peso deve ter no máximo 3 casas decimais';
    else if (Number(formData.pesoBruto) > 0 && Number(formData.pesoLiquido) > Number(formData.pesoBruto)) {
      e.pesoLiquido = 'Peso Líquido não pode ser maior que o Peso Bruto';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      ...formData,
      codigo: Number(formData.codigo),
      valorVenda: Number(formData.valorVenda),
      pesoBruto: Number(formData.pesoBruto),
      pesoLiquido: Number(formData.pesoLiquido),
    };
    setSaving(true);
    try {
      if (isEditing) {
        await produtosService.update(id, data);
        setToast({ type: 'success', message: 'Produto atualizado com sucesso!' });
      } else {
        await produtosService.create(data);
        setToast({ type: 'success', message: 'Produto cadastrado com sucesso!' });
      }
      setTimeout(() => navigate('/produtos'), 1000);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Erro ao salvar produto' });
    } finally {
      setSaving(false);
    }
  };

  const modeLabel = isView ? 'Visualizar' : isEditing ? 'Editar' : 'Novo';
  const modeColor = isView ? 'var(--secondary)' : isEditing ? 'var(--warning)' : 'var(--primary)';

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtos')}
          sx={{
            color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 500, fontSize: 13,
            '&:hover': { color: 'var(--primary)', bgcolor: 'var(--primary-light)' },
          }}
        >
          Produtos
        </Button>
        <Typography sx={{ color: 'var(--text-muted)' }}>/</Typography>
        <Typography sx={{ fontSize: 13, color: modeColor, fontWeight: 600 }}>{modeLabel}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 24 }}>
            {modeLabel} Produto
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', mt: 0.5 }}>
            {isView ? 'Visualizando dados do produto' : 'Preencha os dados do produto abaixo'}
          </Typography>
        </Box>
        {isView && (
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/produtos/${id}/editar`)}
            variant="outlined"
            sx={{
              borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: '10px',
              textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: 'var(--primary-light)', borderColor: 'var(--primary)' },
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
      ) : isView ? (
        <Card sx={{
          bgcolor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
        }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border)' }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Identificação
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <FieldDisplay label="Código" icon={<TagIcon />}>{formData.codigo}</FieldDisplay>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
              <FieldDisplay label="Código de Barras" icon={<QrCodeIcon />}>{formData.codigoBarras}</FieldDisplay>
              <FieldDisplay label="Descrição">{formData.descricao}</FieldDisplay>
            </Box>
            <Divider sx={{ borderColor: 'var(--border)', mb: 3 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
              Valores e Pesos
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
              <FieldDisplay label="Valor de Venda" icon={<AttachMoneyIcon />}>
                <Typography sx={{ fontWeight: 600, color: 'var(--success)', fontSize: 15 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.valorVenda)}
                </Typography>
              </FieldDisplay>
              <FieldDisplay label="Peso Bruto (kg)" icon={<ScaleIcon />}>
                <Typography sx={{ fontFamily: 'Consolas, monospace', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {Number(formData.pesoBruto).toFixed(3)}
                </Typography>
              </FieldDisplay>
              <FieldDisplay label="Peso Líquido (kg)" icon={<ScaleIcon />}>
                <Typography sx={{ fontFamily: 'Consolas, monospace', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {Number(formData.pesoLiquido).toFixed(3)}
                </Typography>
              </FieldDisplay>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2.5, borderTop: '1px solid var(--border)' }}>
              <Button
                onClick={() => navigate('/produtos')}
                sx={{
                  color: 'var(--text-secondary)', borderRadius: '10px', textTransform: 'none',
                  fontWeight: 600, border: '1px solid var(--border)', px: 2.5,
                  '&:hover': { bgcolor: 'var(--surface-hover)' },
                }}
              >
                Voltar
              </Button>
            </Box>
          </Box>
        </Card>
      ) : (
        <Card sx={{
          bgcolor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
        }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border)' }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Identificação
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>
              <TextField
                label="Código"
                name="codigo"
                type="number"
                value={formData.codigo}
                onChange={handleChange}
                error={Boolean(errors.codigo)}
                helperText={errors.codigo}
                inputProps={{ min: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon /></InputAdornment> }}
                sx={fieldSx(errors.codigo)}
              />
              <TextField
                label="Código de Barras"
                name="codigoBarras"
                value={formData.codigoBarras}
                onChange={(e) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 14) handleChange(e); }}
                error={Boolean(errors.codigoBarras)}
                helperText={errors.codigoBarras || `${formData.codigoBarras.length}/14 caracteres`}
                inputProps={{ maxLength: 14 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeIcon /></InputAdornment> }}
                sx={fieldSx(errors.codigoBarras)}
              />
            </Box>

            <TextField
              fullWidth
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={(e) => { if (e.target.value.length <= 60) handleChange(e); }}
              error={Boolean(errors.descricao)}
              helperText={errors.descricao || `${formData.descricao.length}/60 caracteres`}
              inputProps={{ maxLength: 60 }}
              sx={{ ...fieldSx(errors.descricao), mb: 2.5 }}
            />

            <Divider sx={{ borderColor: 'var(--border)', mb: 2.5 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2.5 }}>
              Valores e Pesos
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2.5 }}>
              <TextField
                label="Valor de Venda (R$)"
                name="valorVenda"
                type="number"
                value={formData.valorVenda}
                onChange={handleChange}
                error={Boolean(errors.valorVenda)}
                helperText={errors.valorVenda}
                inputProps={{ step: 0.01, min: 0.01 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon /></InputAdornment> }}
                sx={fieldSx(errors.valorVenda)}
              />
              <TextField
                label="Peso Bruto (kg)"
                name="pesoBruto"
                type="number"
                value={formData.pesoBruto}
                onChange={handleChange}
                error={Boolean(errors.pesoBruto)}
                helperText={errors.pesoBruto}
                inputProps={{ step: 0.001, min: 0.001 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><ScaleIcon /></InputAdornment> }}
                sx={fieldSx(errors.pesoBruto)}
              />
              <TextField
                label="Peso Líquido (kg)"
                name="pesoLiquido"
                type="number"
                value={formData.pesoLiquido}
                onChange={handleChange}
                error={Boolean(errors.pesoLiquido)}
                helperText={errors.pesoLiquido}
                inputProps={{ step: 0.001, min: 0.001 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><ScaleIcon /></InputAdornment> }}
                sx={fieldSx(errors.pesoLiquido)}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5, pt: 2.5, borderTop: '1px solid var(--border)' }}>
              <Button
                onClick={() => navigate('/produtos')}
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
                    bgcolor: 'var(--primary)', color: '#fff', borderRadius: '10px',
                    textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none',
                    '&:hover': { bgcolor: 'var(--primary-hover)', boxShadow: 'none' },
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
