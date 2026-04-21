// pages/Signup.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant', // par défaut étudiant
    studentId: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.role === 'etudiant' && !formData.studentId) {
      setError('Veuillez entrer votre numéro d\'étudiant');
      return;
    }
    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        studentId: formData.role === 'etudiant' ? formData.studentId : undefined
      });
      // Redirection après inscription
      if (user.role === 'enseignant') navigate('/');
      else if (user.role === 'admin') navigate('/dashboard-admin');
      else navigate('/dashboard-etudiant');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>
        <p className="auth-subtitle">Créez votre compte ISSAT Sousse</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email institutionnel</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="admin">Agent administratif</option>
            </select>
          </div>
          {formData.role === 'etudiant' && (
            <div className="form-group">
              <label>Numéro d'étudiant</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-btn">S'inscrire</button>
        </form>
        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;