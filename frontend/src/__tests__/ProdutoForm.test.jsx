import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProdutoForm from '../pages/Produtos/ProdutoForm';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  produtosService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function renderForm(route = '/produtos/novo') {
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/produtos/novo" element={<ProdutoForm />} />
          <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
          <Route path="/produtos" element={<div data-testid="list-page">List</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  return {
    ...utils,
    $codigo: () => utils.container.querySelector('input[name="codigo"]'),
    $descricao: () => utils.container.querySelector('input[name="descricao"]'),
    $codigoBarras: () => utils.container.querySelector('input[name="codigoBarras"]'),
    $valorVenda: () => utils.container.querySelector('input[name="valorVenda"]'),
    $pesoBruto: () => utils.container.querySelector('input[name="pesoBruto"]'),
    $pesoLiquido: () => utils.container.querySelector('input[name="pesoLiquido"]'),
  };
}

describe('ProdutoForm validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'User', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
  });

  it('renders form fields', () => {
    const { $codigo, $descricao, $codigoBarras, $valorVenda, $pesoBruto, $pesoLiquido } = renderForm();
    expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    expect($codigo()).toBeInTheDocument();
    expect($descricao()).toBeInTheDocument();
    expect($codigoBarras()).toBeInTheDocument();
    expect($valorVenda()).toBeInTheDocument();
    expect($pesoBruto()).toBeInTheDocument();
    expect($pesoLiquido()).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderForm();
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(screen.getByText('Código deve ser um número positivo')).toBeInTheDocument();
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Código de Barras é obrigatório')).toBeInTheDocument();
    });
  });

  it('shows codigo error for zero or negative', async () => {
    const user = userEvent.setup();
    const { $codigo } = renderForm();
    await user.type($codigo(), '0');
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(screen.getByText('Código deve ser um número positivo')).toBeInTheDocument();
    });
  });

  it('limits descricao to 60 chars via maxLength', async () => {
    const user = userEvent.setup({ delay: 10 });
    const { $descricao } = renderForm();
    await user.type($descricao(), 'A'.repeat(70));
    expect($descricao().value.length).toBe(60);
  }, 15000);

  it('limits codigoBarras to 14 chars via maxLength', async () => {
    const user = userEvent.setup();
    const { $codigoBarras } = renderForm();
    await user.type($codigoBarras(), '1'.repeat(20));
    expect($codigoBarras().value.length).toBe(14);
  });

  it('submits with valid data', async () => {
    api.produtosService.create.mockResolvedValue({ data: { id: 1 } });
    const user = userEvent.setup();
    const { $codigo, $descricao, $codigoBarras, $valorVenda, $pesoBruto, $pesoLiquido } = renderForm();
    await user.type($codigo(), '1');
    await user.type($descricao(), 'Produto Teste');
    await user.type($codigoBarras(), '7891234567890');
    await user.type($valorVenda(), '29.99');
    await user.type($pesoBruto(), '1.500');
    await user.type($pesoLiquido(), '1.200');
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(api.produtosService.create).toHaveBeenCalled();
    });
  });
});
