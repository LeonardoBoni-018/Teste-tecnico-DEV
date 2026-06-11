import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export function renderWithProviders(ui, { initialEntries = ['/'], ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
  return { ...options, wrapper: Wrapper };
}
