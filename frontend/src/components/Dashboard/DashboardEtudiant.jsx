import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './DashboardEtudiant.css';

const DashboardEtudiant = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const formatDateFrench = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/etudiant/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Chargement de votre tableau de bord...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const { stats, matieres, alertes, prochains_cours } = dashboardData;

  const handleDeposerJustificatif = () => console.log('Déposer justificatif');
  const handleVoirDetails = (matiere) => console.log('Voir détails:', matiere);

  return (
    <>
      {/* Header avec les infos utilisateur dynamiques */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user?.nom_complet || user?.email}</div>
            <div className="user-role">Étudiant</div>
          </div>
          <div className="user-avatar">{user?.nom_complet?.charAt(0) || user?.email?.charAt(0)}</div>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Mon Tableau de Bord</h1>
        <p className="page-subtitle">Suivi de votre assiduité et de vos présences</p>

        {/* Alertes */}
        {alertes.length > 0 && alertes.map((alerte, idx) => (
          <div className="alert-banner warning" key={idx}>
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>{alerte.matiere}</strong> - {alerte.message}
            </div>
            <button className="btn-alert" onClick={handleDeposerJustificatif}>
              Déposer un justificatif
            </button>
          </div>
        ))}

        {/* Statistiques */}
        <div className="stats-grid">
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

        {/* Grille principale */}
        <div className="content-grid">
          {/* Matières */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Mes Matières</h3>
            </div>
            <div className="matieres-list">
              {matieres.map((matiere, idx) => (
                <div className={`matiere-card ${matiere.status}`} key={idx}>
                  <div className="matiere-header">
                    <div>
                      <h4>{matiere.nom}</h4>
                      <span className="matiere-code">{matiere.code}</span>
                    </div>
                    <div className="matiere-taux">
                      <span className="taux-value">{matiere.taux}%</span>
                    </div>
                  </div>
                  <div className="matiere-details">
                    <div className="detail-item">
                      <span className="detail-label">Séances</span>
                      <span className="detail-value">{matiere.nbSeances}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Absences</span>
                      <span className="detail-value">{matiere.nbAbsences}/{matiere.seuil}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${matiere.status}`} style={{ width: `${matiere.taux}%` }}></div>
                  </div>
                  <button className="btn-details" onClick={() => handleVoirDetails(matiere)}>
                    Voir détails
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar : Prochains cours (uniquement) */}
          <div>
            <div className="card">
              <h3 className="card-title">Prochains cours</h3>
              <div className="prochains-cours">
                {prochains_cours.length === 0 ? (
                  <p>Aucune séance programmée.</p>
                ) : (
                  prochains_cours.map((cours, idx) => (
                    <div className="cours-item" key={idx}>
                      <div className="cours-icon">📅</div>
                      <div className="cours-info">
                        <h4>{cours.matiere}</h4>
                        <div className="cours-meta">
                          <span>{cours.type}</span> • <span>{formatDateFrench(cours.date_iso)}</span>
                        </div>
                        <div className="cours-details">{cours.heure} • {cours.salle}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardEtudiant;