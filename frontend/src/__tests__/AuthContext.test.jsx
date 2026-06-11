import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TestComponent() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.nome : 'null'}</span>
      <button data-testid="login-btn" onClick={() => login({ token: 'abc', nome: 'Test User', expiresAt: new Date(Date.now() + 3600000).toISOString() })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no user', () => {
    renderWithAuth();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('sets user after login', () => {
    renderWithAuth();
    act(() => screen.getByTestId('login-btn').click());
    expect(screen.getByTestId('user').textContent).toBe('Test User');
    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored.nome).toBe('Test User');
  });

  it('clears user after logout', () => {
    renderWithAuth();
    act(() => screen.getByTestId('login-btn').click());
    act(() => screen.getByTestId('logout-btn').click());
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('restores user from localStorage on mount', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'Stored', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
    renderWithAuth();
    expect(screen.getByTestId('user').textContent).toBe('Stored');
  });

  it('ignores expired token from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'Expired', expiresAt: new Date(Date.now() - 1000).toISOString() }));
    renderWithAuth();
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('ignores invalid JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid-json');
    renderWithAuth();
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('user')).toBeNull();
  });
});
