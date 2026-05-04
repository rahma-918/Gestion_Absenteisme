import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarEnseignant = () => {
    const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Tableau de bord</Link>
        <Link to="/statistiques">Statistiques</Link>
        <Link to="/justificatifs">Justificatifs reçus</Link>
      </div>
      <div className="nav-user">
        {user?.nom_complet || user?.email} ({user?.role})
      </div>
        <button className="logout-button" onClick={logout}>Déconnexion</button>
    </nav>
  );
};

export default NavbarEnseignant;