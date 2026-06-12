import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderLogin();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
  });

  it('shows error when submitting empty login form', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('shows error when submitting empty register form', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('Registrar-se'));
    await waitFor(() => {
      expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Criar Acesso'));
    await waitFor(() => {
      expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('shows error when register password is less than 8 chars', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('Registrar-se'));
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'Test User');
    await user.type(screen.getByPlaceholderText('Escolha um usuário'), 'testuser');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Ab@1');
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Ab@1');
    fireEvent.click(screen.getByText('Criar Acesso'));
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('Registrar-se'));
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'Test User');
    await user.type(screen.getByPlaceholderText('Escolha um usuário'), 'testuser');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Admin@123');
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Admin@456');
    fireEvent.click(screen.getByText('Criar Acesso'));
    await waitFor(() => {
      expect(screen.getByText('As senhas informadas não conferem')).toBeInTheDocument();
    });
  });

  it('shows error when password lacks complexity requirements', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('Registrar-se'));
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'Test User');
    await user.type(screen.getByPlaceholderText('Escolha um usuário'), 'testuser');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'abcdefgh');
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'abcdefgh');
    fireEvent.click(screen.getByText('Criar Acesso'));
    await waitFor(() => {
      expect(screen.getByText('Senha deve conter letra maiúscula, minúscula, número e caractere especial')).toBeInTheDocument();
    });
  });

  it('switches between login and register modes', () => {
    renderLogin();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Registrar-se'));
    expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    expect(screen.getByText('Já tem acesso?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fazer login'));
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
  });

  it('calls authService.login on valid form submission', async () => {
    api.authService.login.mockResolvedValue({ data: { token: 'abc', nome: 'User', expiresAt: new Date(Date.now() + 3600000).toISOString() } });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin@email.com');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Admin@123');
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(api.authService.login).toHaveBeenCalledWith({ username: 'admin@email.com', password: 'Admin@123' });
    });
  });

  it('displays server error message on login failure', async () => {
    api.authService.login.mockRejectedValue({ response: { data: { message: 'Usuário ou senha inválidos' } } });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'admin@email.com');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'wrong');
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText('Usuário ou senha inválidos')).toBeInTheDocument();
    });
  });

  it('calls authService.register on valid registration submission', async () => {
    api.authService.register.mockResolvedValue({ data: { token: 'abc', nome: 'New User', expiresAt: new Date(Date.now() + 3600000).toISOString() } });
    const user = userEvent.setup();
    renderLogin();
    fireEvent.click(screen.getByText('Registrar-se'));
    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'New User');
    await user.type(screen.getByPlaceholderText('Escolha um usuário'), 'newuser');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Admin@123');
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Admin@123');
    fireEvent.click(screen.getByText('Criar Acesso'));
    await waitFor(() => {
      expect(api.authService.register).toHaveBeenCalledWith({ username: 'newuser', password: 'Admin@123', nome: 'New User' });
    });
  });
});
