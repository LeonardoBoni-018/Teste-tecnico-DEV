import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ClienteForm from '../pages/Clientes/ClienteForm';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  clientesService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function renderForm(route = '/clientes/novo') {
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/clientes/novo" element={<ClienteForm />} />
          <Route path="/clientes/:id/editar" element={<ClienteForm />} />
          <Route path="/clientes" element={<div data-testid="list-page">List</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  return {
    ...utils,
    $codigo: () => utils.container.querySelector('input[name="codigo"]'),
    $nome: () => utils.container.querySelector('input[name="nome"]'),
    $fantasia: () => utils.container.querySelector('input[name="fantasia"]'),
    $documento: () => utils.container.querySelector('input[name="documento"]'),
    $endereco: () => utils.container.querySelector('textarea[name="endereco"]'),
  };
}

describe('ClienteForm validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'User', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
  });

  it('renders form fields', () => {
    const { $codigo, $nome, $fantasia, $documento, $endereco } = renderForm();
    expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    expect($codigo()).toBeInTheDocument();
    expect($nome()).toBeInTheDocument();
    expect($fantasia()).toBeInTheDocument();
    expect($documento()).toBeInTheDocument();
    expect($endereco()).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderForm();
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(screen.getByText('Código deve ser um número positivo')).toBeInTheDocument();
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Fantasia é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)')).toBeInTheDocument();
      expect(screen.getByText('Endereço é obrigatório')).toBeInTheDocument();
    });
  });

  it('shows document error for invalid CPF length', async () => {
    const user = userEvent.setup();
    const { $documento } = renderForm();
    await user.type($documento(), '123');
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(screen.getByText('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)')).toBeInTheDocument();
    });
  });

  it('limits nome to 60 chars via maxLength', async () => {
    const user = userEvent.setup();
    const { $nome } = renderForm();
    await user.type($nome(), 'A'.repeat(70));
    expect($nome().value.length).toBe(60);
  });

  it('limits fantasia to 100 chars via maxLength', async () => {
    const user = userEvent.setup({ delay: 15 });
    const { $fantasia } = renderForm();
    await user.type($fantasia(), 'A'.repeat(110));
    expect($fantasia().value.length).toBe(100);
  }, 15000);

  it('submits with valid data', async () => {
    api.clientesService.create.mockResolvedValue({ data: { id: 1 } });
    const user = userEvent.setup();
    const { $codigo, $nome, $fantasia, $documento, $endereco } = renderForm();
    await user.type($codigo(), '1');
    await user.type($nome(), 'Empresa Teste');
    await user.type($fantasia(), 'Teste');
    await user.type($documento(), '52998224725');
    await user.type($endereco(), 'Rua Teste, 123');
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(api.clientesService.create).toHaveBeenCalled();
    });
  });
});
