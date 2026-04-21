// pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      // Redirection selon le rôle
      if (user.role === 'enseignant') navigate('/');
      else if (user.role === 'admin') navigate('/dashboard-admin');
      else if (user.role === 'etudiant') navigate('/dashboard-etudiant');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        <p className="auth-subtitle">Accédez à votre espace ISSAT Sousse</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email institutionnel</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@issatso.rnu.tn"
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn">Se connecter</button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ? <Link to="/signup">Inscrivez-vous</Link>
        </p>
        <div className="demo-accounts">
          <p>Comptes de démonstration :</p>
          <ul>
            <li>Enseignant : prof@issatso.rnu.tn / prof123</li>
            <li>Admin : admin@issatso.rnu.tn / admin123</li>
            <li>Étudiant : etudiant@issatso.rnu.tn / etudiant123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;