import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarEnseignant = () => {
    const { logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-brand">📚 GestionAbsence - Enseignant</div>
      <div className="nav-links">
        <Link to="/">Tableau de bord</Link>
        <Link to="/appel">Faire l'appel</Link>
        <Link to="/statistiques">Statistiques</Link>
        <Link to="/justificatifs">Justificatifs reçus</Link>
      </div>
      <div className="nav-user">Dr. Ahmed Ben Salem</div>
        <button className="logout-button" onClick={logout}>Déconnexion</button>
    </nav>
  );
};

export default NavbarEnseignant;