import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProdutoList from './pages/Produtos/ProdutoList';
import ProdutoForm from './pages/Produtos/ProdutoForm';
import ClienteList from './pages/Clientes/ClienteList';
import ClienteForm from './pages/Clientes/ClienteForm';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <div className="page-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <PrivateRoute>
                <AppLayout><ProdutoList /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos/novo"
            element={
              <PrivateRoute>
                <AppLayout><ProdutoForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos/:id"
            element={
              <PrivateRoute>
                <AppLayout><ProdutoForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos/:id/editar"
            element={
              <PrivateRoute>
                <AppLayout><ProdutoForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <AppLayout><ClienteList /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes/novo"
            element={
              <PrivateRoute>
                <AppLayout><ClienteForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes/:id"
            element={
              <PrivateRoute>
                <AppLayout><ClienteForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes/:id/editar"
            element={
              <PrivateRoute>
                <AppLayout><ClienteForm /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
