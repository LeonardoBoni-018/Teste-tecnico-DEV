import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export default function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchClientes = useCallback(async () => {
    try {
      const response = await clientesService.getAll();
      setClientes(response.data);
    } catch {
      setToast({ type: 'error', message: 'Erro ao carregar clientes' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

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

  const formatDoc = (doc) => {
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/clientes/novo')}>
          + Novo Cliente
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum cliente cadastrado</p>
          <button className="btn btn-primary" onClick={() => navigate('/clientes/novo')}>
            Cadastrar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Fantasia</th>
                <th>Documento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.codigo}</td>
                  <td>{c.nome}</td>
                  <td>{c.fantasia}</td>
                  <td className="mono">{formatDoc(c.documento)}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-view" title="Visualizar" onClick={() => navigate(`/clientes/${c.id}`)}>
                      👁
                    </button>
                    <button className="btn btn-sm btn-edit" title="Editar" onClick={() => navigate(`/clientes/${c.id}/editar`)}>
                      ✏
                    </button>
                    <button className="btn btn-sm btn-delete" title="Excluir" onClick={() => setDeleteTarget(c)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
