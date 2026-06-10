import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientesService } from '../../services/api';
import Toast from '../../components/Toast';

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

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditinging = window.location.pathname.endsWith('/editar');
  const isView = Boolean(id) && !isEditinging;

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    fantasia: '',
    documento: '',
    endereco: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      clientesService
        .getById(id)
        .then((response) => {
          const c = response.data;
          setFormData({
            codigo: c.codigo,
            nome: c.nome,
            fantasia: c.fantasia,
            documento: c.documento,
            endereco: c.endereco,
          });
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
    const newErrors = {};
    if (!formData.codigo || Number(formData.codigo) <= 0) newErrors.codigo = 'Código deve ser um número positivo';
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    else if (formData.nome.length > 60) newErrors.nome = 'Máximo 60 caracteres';
    if (!formData.fantasia.trim()) newErrors.fantasia = 'Fantasia é obrigatório';
    else if (formData.fantasia.length > 100) newErrors.fantasia = 'Máximo 100 caracteres';
    const docError = validateDocument(formData.documento);
    if (docError) newErrors.documento = docError;
    if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...formData,
      codigo: Number(formData.codigo),
      documento: formData.documento.replace(/\D/g, ''),
    };

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
      const message = err.response?.data?.message || 'Erro ao salvar cliente';
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
          <h1 className="page-title">{isView ? 'Visualizar' : isEditing ? 'Editar' : 'Novo'} Cliente</h1>
          <p className="page-subtitle">Preencha os dados do cliente</p>
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
              <label className="form-label">Documento (CPF/CNPJ)</label>
              <input
                type="text"
                name="documento"
                className={`form-input mono ${errors.documento ? 'input-error' : ''}`}
                value={formData.documento}
                onChange={handleChange}
                disabled={isView}
                maxLength={18}
                placeholder="000.000.000-00"
              />
              {errors.documento && <span className="field-error">{errors.documento}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              name="nome"
              className={`form-input ${errors.nome ? 'input-error' : ''}`}
              value={formData.nome}
              onChange={(e) => {
                if (e.target.value.length <= 60) handleChange(e);
              }}
              disabled={isView}
              maxLength={60}
            />
            <span className="char-counter">{formData.nome.length}/60</span>
            {errors.nome && <span className="field-error">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Fantasia</label>
            <input
              type="text"
              name="fantasia"
              className={`form-input ${errors.fantasia ? 'input-error' : ''}`}
              value={formData.fantasia}
              onChange={(e) => {
                if (e.target.value.length <= 100) handleChange(e);
              }}
              disabled={isView}
              maxLength={100}
            />
            <span className="char-counter">{formData.fantasia.length}/100</span>
            {errors.fantasia && <span className="field-error">{errors.fantasia}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Endereço</label>
            <textarea
              name="endereco"
              className={`form-input form-textarea ${errors.endereco ? 'input-error' : ''}`}
              value={formData.endereco}
              onChange={handleChange}
              disabled={isView}
              rows={3}
            />
            {errors.endereco && <span className="field-error">{errors.endereco}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/clientes')}>
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
