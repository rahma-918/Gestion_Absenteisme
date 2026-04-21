// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le tableau de bord approprié selon son rôle
    if (user.role === 'enseignant') return <Navigate to="/" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard-admin" replace />;
    if (user.role === 'etudiant') return <Navigate to="/dashboard-etudiant" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;