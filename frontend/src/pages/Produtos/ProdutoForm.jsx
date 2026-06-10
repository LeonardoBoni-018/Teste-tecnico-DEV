import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { produtosService } from '../../services/api';
import Toast from '../../components/Toast';

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = window.location.pathname.endsWith('/editar');
  const isView = Boolean(id) && !isEditing;

  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    codigoBarras: '',
    valorVenda: '',
    pesoBruto: '',
    pesoLiquido: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      produtosService
        .getById(id)
        .then((response) => {
          const p = response.data;
          setFormData({
            codigo: p.codigo,
            descricao: p.descricao,
            codigoBarras: p.codigoBarras,
            valorVenda: p.valorVenda,
            pesoBruto: p.pesoBruto,
            pesoLiquido: p.pesoLiquido,
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

  const validate = () => {
    const newErrors = {};
    if (!formData.codigo || Number(formData.codigo) <= 0) newErrors.codigo = 'Código deve ser um número positivo';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    else if (formData.descricao.length > 60) newErrors.descricao = 'Máximo 60 caracteres';
    if (!formData.codigoBarras.trim()) newErrors.codigoBarras = 'Código de Barras é obrigatório';
    else if (formData.codigoBarras.length > 14) newErrors.codigoBarras = 'Máximo 14 caracteres';
    if (!formData.valorVenda || Number(formData.valorVenda) <= 0) newErrors.valorVenda = 'Valor deve ser maior que zero';
    if (!formData.pesoBruto || Number(formData.pesoBruto) <= 0) newErrors.pesoBruto = 'Peso deve ser maior que zero';
    if (!formData.pesoLiquido || Number(formData.pesoLiquido) <= 0) newErrors.pesoLiquido = 'Peso deve ser maior que zero';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const message = err.response?.data?.message || 'Erro ao salvar produto';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">{isView ? 'Visualizar' : isEditing ? 'Editar' : 'Novo'} Produto</h1>
          <p className="page-subtitle">Preencha os dados do produto</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código</label>
              <input
                type="number"
                name="codigo"
                className={`form-input ${errors.codigo ? 'input-error' : ''}`}
                value={formData.codigo}
                onChange={handleChange}
                disabled={isView}
                min="1"
              />
              {errors.codigo && <span className="field-error">{errors.codigo}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Código de Barras</label>
              <input
                type="text"
                name="codigoBarras"
                className={`form-input mono ${errors.codigoBarras ? 'input-error' : ''}`}
                value={formData.codigoBarras}
                onChange={(e) => {
                  if (e.target.value.length <= 14) handleChange(e);
                }}
                disabled={isView}
                maxLength={14}
              />
              {errors.codigoBarras && <span className="field-error">{errors.codigoBarras}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input
              type="text"
              name="descricao"
              className={`form-input ${errors.descricao ? 'input-error' : ''}`}
              value={formData.descricao}
              onChange={(e) => {
                if (e.target.value.length <= 60) handleChange(e);
              }}
              disabled={isView}
              maxLength={60}
            />
            <span className="char-counter">{formData.descricao.length}/60</span>
            {errors.descricao && <span className="field-error">{errors.descricao}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor de Venda (R$)</label>
              <input
                type="number"
                name="valorVenda"
                className={`form-input ${errors.valorVenda ? 'input-error' : ''}`}
                value={formData.valorVenda}
                onChange={handleChange}
                disabled={isView}
                step="0.01"
                min="0.01"
              />
              {errors.valorVenda && <span className="field-error">{errors.valorVenda}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Peso Bruto (kg)</label>
              <input
                type="number"
                name="pesoBruto"
                className={`form-input ${errors.pesoBruto ? 'input-error' : ''}`}
                value={formData.pesoBruto}
                onChange={handleChange}
                disabled={isView}
                step="0.001"
                min="0.001"
              />
              {errors.pesoBruto && <span className="field-error">{errors.pesoBruto}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Peso Líquido (kg)</label>
              <input
                type="number"
                name="pesoLiquido"
                className={`form-input ${errors.pesoLiquido ? 'input-error' : ''}`}
                value={formData.pesoLiquido}
                onChange={handleChange}
                disabled={isView}
                step="0.001"
                min="0.001"
              />
              {errors.pesoLiquido && <span className="field-error">{errors.pesoLiquido}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/produtos')}>
              Voltar
            </button>
            {!isView && (
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-sm" /> : isEditing ? 'Atualizar' : 'Cadastrar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
