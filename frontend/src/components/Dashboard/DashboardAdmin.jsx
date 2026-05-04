import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const { stats, departementsStats, alertesCritiques } = dashboardData;

  const handleVoirDepartement = (dept) => {
    // Exemple : redirection vers statistiques avec filtre département (optionnel)
    navigate('/statistiques-admin');
  };

  const handleGererElimination = (alerte) => {
    navigate('/eliminations');
  };

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user?.nom_complet || user?.email}</div>
            <div className="user-role">Agent Administratif - Scolarité</div>
          </div>
          <div className="user-avatar admin">{user?.nom_complet?.charAt(0) || 'A'}</div>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Tableau de Bord Administratif</h1>
        <p className="page-subtitle">Vue d'ensemble de l'absentéisme dans l'établissement</p>

        <div className="stats-grid-admin">
          {stats.map((stat, idx) => (
            <div className="stat-card" key={idx}>
              <div className="stat-header">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
              </div>
              <div className={`stat-trend ${stat.trendClass}`}>{stat.trend}</div>
            </div>
          ))}
        </div>

        <div className="admin-content-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Statistiques par Département</h3>
            </div>
            <div className="departements-list">
              {departementsStats.map((dept, idx) => (
                <div className="departement-item" key={idx}>
                  <div className="dept-info">
                    <h4>{dept.nom}</h4>
                    <div className="dept-meta">
                      <span className={`taux ${dept.taux >= 90 ? 'excellent' : dept.taux >= 85 ? 'good' : 'warning'}`}>
                        {dept.taux}% présence
                      </span>
                      <span>⚠️ {dept.alertes} alertes</span>
                      <span>🚫 {dept.eliminations} éliminations</span>
                    </div>
                  </div>
                  <button
                    className="btn-details"
                    onClick={() => handleVoirDepartement(dept)}
                  >
                    Voir détails →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">🚨 Alertes Critiques</h3>
              </div>
              <div className="alertes-list">
                {alertesCritiques.map((alerte, idx) => (
                  <div className="alerte-item critical" key={idx}>
                    <div className="alerte-header">
                      <h4>{alerte.etudiant}</h4>
                      <span className="badge-critical">CRITIQUE</span>
                    </div>
                    <div className="alerte-details">
                      <p>{alerte.numero} • {alerte.departement}</p>
                      <p><strong>{alerte.matiere}</strong></p>
                      <p className="absences-count">{alerte.nbAbsences}/{alerte.seuil} absences</p>
                    </div>
                    <button
                      className="btn-action-alert"
                      onClick={() => handleGererElimination(alerte)}
                    >
                      Gérer l'élimination
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>⚡ Actions rapides</h3>
          <div className="quick-actions-grid">
            <button
              className="quick-action-card"
              onClick={() => navigate('/statistiques-admin')}
            >
              <div className="qa-icon">📊</div>
              <h4>Générer rapport global</h4>
              <p>Statistiques de l'établissement</p>
            </button>
            <button
              className="quick-action-card"
              onClick={() => navigate('/eliminations')}
            >
              <div className="qa-icon">🚫</div>
              <h4>Gérer les éliminations</h4>
              <p>Cas en attente</p>
            </button>
            <button
              className="quick-action-card"
              onClick={() => navigate('/eliminations')}
            >
              <div className="qa-icon">📧</div>
              <h4>Notifications</h4>
              <p>Envoyer alertes groupées</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;