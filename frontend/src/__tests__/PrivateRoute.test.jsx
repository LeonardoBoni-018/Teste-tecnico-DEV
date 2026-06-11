import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function renderWithAuth(ui, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children when user is authenticated', async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nome: 'User', expiresAt: new Date(Date.now() + 3600000).toISOString() }));
    renderWithAuth(
      <PrivateRoute>
        <div data-testid="protected">Protected Content</div>
      </PrivateRoute>
    );
    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });

  it('redirects to /login when user is not authenticated', async () => {
    renderWithAuth(
      <PrivateRoute>
        <div data-testid="protected">Protected Content</div>
      </PrivateRoute>
    );
    await waitFor(() => {
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });
  });
});
