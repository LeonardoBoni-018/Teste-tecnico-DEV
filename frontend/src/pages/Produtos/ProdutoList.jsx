import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { produtosService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export default function ProdutoList() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await produtosService.getAll();
      setProdutos(response.data);
    } catch {
      setToast({ type: 'error', message: 'Erro ao carregar produtos' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

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

      <div className="page-header">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">{produtos.length} produto(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/produtos/novo')}>
          + Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : produtos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum produto cadastrado</p>
          <button className="btn btn-primary" onClick={() => navigate('/produtos/novo')}>
            Cadastrar Primeiro Produto
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Cód. Barras</th>
                <th>Valor Venda</th>
                <th>Peso Bruto</th>
                <th>Peso Líquido</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.descricao}</td>
                  <td className="mono">{p.codigoBarras}</td>
                  <td className="mono">R$ {p.valorVenda.toFixed(2)}</td>
                  <td className="mono">{p.pesoBruto.toFixed(3)} kg</td>
                  <td className="mono">{p.pesoLiquido.toFixed(3)} kg</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-view" title="Visualizar" onClick={() => navigate(`/produtos/${p.id}`)}>
                      👁
                    </button>
                    <button className="btn btn-sm btn-edit" title="Editar" onClick={() => navigate(`/produtos/${p.id}/editar`)}>
                      ✏
                    </button>
                    <button className="btn btn-sm btn-delete" title="Excluir" onClick={() => setDeleteTarget(p)}>
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
