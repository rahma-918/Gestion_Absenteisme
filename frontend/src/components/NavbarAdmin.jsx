import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const NavbarAdmin = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="navbar">
            <div className="nav-links">
                <Link to="/dashboard-admin">Tableau de bord admin</Link>
                <Link to="/statistiques-admin">Statistiques globales</Link>
                <Link to="/eliminations">Gérer éliminations</Link>
            </div>
            <div className="nav-user">
                {user?.nom_complet || user?.email} ({user?.role === 'admin' ? 'Admin' : user?.role})
            </div>
            <button className="logout-button" onClick={logout}>Déconnexion</button>
        </nav>
    );
};

export default NavbarAdmin;