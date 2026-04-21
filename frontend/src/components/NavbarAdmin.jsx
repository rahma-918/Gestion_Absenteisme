import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarAdmin = () => {
    const { logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-brand">🏛️ GestionAbsence - Administration</div>
      <div className="nav-links">
        <Link to="/dashboard-admin">Tableau de bord admin</Link>
        <Link to="/statistiques">Statistiques globales</Link>
        <Link to="/eliminations">Gérer éliminations</Link>
      </div>
      <div className="nav-user">Mme. Fatma Mansouri</div>
      <button className="logout-button" onClick={logout}>Déconnexion</button>
    </nav>
  );
};

export default NavbarAdmin;