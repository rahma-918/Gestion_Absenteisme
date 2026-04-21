import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarEtudiant = () => {
    const { logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-brand">🎓 GestionAbsence - Étudiant</div>
      <div className="nav-links">
        <Link to="/dashboard-etudiant">Mon tableau de bord</Link>
        <Link to="/justificatifs-etudiant">Mes justificatifs</Link>
        <Link to="">Emploi du temps</Link>
      </div>
      <div className="nav-user">Ahmed Ben Ali</div>
      <button className="logout-button" onClick={logout}>Déconnexion</button>
    </nav>
  );
};

export default NavbarEtudiant;