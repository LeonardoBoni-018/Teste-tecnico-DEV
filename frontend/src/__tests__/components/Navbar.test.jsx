import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';

function renderNavbar() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders brand name', () => {
    renderNavbar();
    expect(screen.getByText('NovaGest')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  it('shows user name when authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'João', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
    renderNavbar();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'João', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
    renderNavbar();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });
});
