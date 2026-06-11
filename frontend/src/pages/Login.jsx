import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !nome.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({ username, password, nome });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo"><Logo size={72} showText={false} /></div>
          <h1 className="login-title">Sistema de Gerenciamento</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Faça login para continuar' : 'Crie sua conta'}
          </p>
        </div>

        {mode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin} noValidate>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="username">Usuário</label>
              <input id="username" type="text" className="form-input" value={username}
                onChange={(e) => setUsername(e.target.value)} placeholder="Digite seu usuário" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <input id="password" type="password" className="form-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Entrar'}
            </button>
            <p className="login-switch">
              Não tem conta?{' '}
              <button type="button" className="link-btn" onClick={switchMode}>
                Registrar-se
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister} noValidate>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nome">Nome</label>
              <input id="reg-nome" type="text" className="form-input" value={nome}
                onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Usuário</label>
              <input id="reg-username" type="text" className="form-input" value={username}
                onChange={(e) => setUsername(e.target.value)} placeholder="Escolha um usuário" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Senha</label>
              <input id="reg-password" type="password" className="form-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Criar Acesso'}
            </button>
            <p className="login-switch">
              Já tem acesso?{' '}
              <button type="button" className="link-btn" onClick={switchMode}>
                Fazer login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
