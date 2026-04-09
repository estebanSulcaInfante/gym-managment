import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wrapper for routes that require authentication.
 * @param {boolean} adminOnly - If true, also requires admin role.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl text-error">lock</span>
        <h2 className="text-2xl font-headline font-semibold">Acceso Restringido</h2>
        <p className="text-base">No tienes permisos de administrador para acceder a esta sección.</p>
      </div>
    );
  }

  return children;
}
