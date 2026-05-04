// components/NavbarEtudiant.jsx
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarEtudiant = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/dashboard-etudiant">Mon tableau de bord</Link>
        <Link to="/justificatifs-etudiant">Mes justificatifs</Link>
      </div>
      <div className="nav-user">
        {user?.nom_complet || user?.email} ({user?.role})
      </div>
      <button className="logout-button" onClick={logout}>Déconnexion</button>
    </nav>
  );
};

export default NavbarEtudiant;  // ← ligne ajoutée