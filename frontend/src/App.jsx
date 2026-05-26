import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Bolsa from './pages/Bolsa.jsx';
import Emprendimientos from './pages/Emprendimientos.jsx';
import Publish from './pages/Publish.jsx';
import Unions from './pages/Unions.jsx';
import { Mensajes, Perfil, Pagos } from './pages/Placeholders.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminPendingListings from './pages/admin/PendingListings.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminUnions from './pages/admin/Unions.jsx';

function hasPermission(user, ...perms) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return perms.some((p) => user[p] === true);
}

function ProtectedRoute({ children, adminOnly = false, anyPermission }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  if (anyPermission && !hasPermission(user, ...anyPermission)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="bolsa" element={<Bolsa />} />
        <Route path="emprendimientos" element={<Emprendimientos />} />
        <Route path="publicar" element={<Publish />} />
        <Route path="sindicatos" element={<Unions />} />
        <Route path="mensajes" element={<Mensajes />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="pagos" element={<Pagos />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute anyPermission={['canModerate', 'canManageUsers']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/publicaciones"
          element={
            <ProtectedRoute anyPermission={['canModerate']}>
              <AdminPendingListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/usuarios"
          element={
            <ProtectedRoute anyPermission={['canManageUsers']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/sindicatos"
          element={
            <ProtectedRoute adminOnly>
              <AdminUnions />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
