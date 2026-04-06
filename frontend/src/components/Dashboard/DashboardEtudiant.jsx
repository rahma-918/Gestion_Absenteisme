import React from 'react';
import './DashboardEtudiant.css';

const DashboardEtudiant = () => {
  // Données statiques
  const stats = [
    {
      value: '94.5%',
      label: 'Taux de présence global',
      icon: '✓',
      iconClass: 'green',
      trend: 'Excellent niveau d\'assiduité',
      trendClass: 'trend-up'
    },
    {
      value: '8',
      label: 'Matières suivies',
      icon: '📚',
      iconClass: 'blue',
      trend: 'Ce semestre',
      trendClass: 'trend-neutral'
    },
    {
      value: '142',
      label: 'Séances suivies',
      icon: '📅',
      iconClass: 'blue',
      trend: 'Depuis le début du semestre',
      trendClass: 'trend-neutral'
    },
    {
      value: '8',
      label: 'Absences totales',
      icon: '⚠️',
      iconClass: 'orange',
      trend: '2 absences restantes avant seuil',
      trendClass: 'trend-warning'
    }
  ];

  const matieres = [
    {
      nom: 'Algorithmique Avancée',
      code: 'INFO301',
      nbSeances: 24,
      nbAbsences: 2,
      seuil: 3,
      taux: 91.7,
      status: 'ok'
    },
    {
      nom: 'Base de Données',
      code: 'INFO302',
      nbSeances: 20,
      nbAbsences: 1,
      seuil: 3,
      taux: 95.0,
      status: 'ok'
    },
    {
      nom: 'Programmation Web',
      code: 'INFO303',
      nbSeances: 18,
      nbAbsences: 3,
      seuil: 3,
      taux: 83.3,
      status: 'warning'
    },
    {
      nom: 'Sécurité Informatique',
      code: 'INFO304',
      nbSeances: 16,
      nbAbsences: 0,
      seuil: 2,
      taux: 100.0,
      status: 'excellent'
    }
  ];

  const alertes = [
    {
      type: 'warning',
      matiere: 'Programmation Web',
      message: 'Vous avez atteint le seuil d\'absence (3/3)',
      date: 'Il y a 2 jours'
    }
  ];

  const prochaineCours = [
    {
      matiere: 'Algorithmique Avancée',
      type: 'TP',
      date: 'Demain',
      heure: '10:00 - 12:00',
      salle: 'B204'
    },
    {
      matiere: 'Base de Données',
      type: 'Cours',
      date: 'Jeudi 27 Mars',
      heure: '14:00 - 16:00',
      salle: 'Amphi A'
    }
  ];

  // Handlers
  const handleDeposerJustificatif = () => {
    console.log('Déposer justificatif');
  };

  const handleVoirDetails = (matiere) => {
    console.log('Voir détails:', matiere);
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">
          📚 GestionAbsence
        </div>
        <div className="user-info">
          <div>
            <div className="user-name">Ahmed Ben Ali</div>
            <div className="user-role">Étudiant - 2A INFO • 20210245</div>
          </div>
          <div className="user-avatar">AB</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="page-title">Mon Tableau de Bord</h1>
        <p className="page-subtitle">Suivi de votre assiduité et de vos présences</p>

        {/* Alertes */}
        {alertes.length > 0 && (
          <div className="alert-banner warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>{alertes[0].matiere}</strong> - {alertes[0].message}
            </div>
            <button className="btn-alert" onClick={handleDeposerJustificatif}>
              Déposer un justificatif
            </button>
          </div>
        )}

        {/* Stats Cards */}
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

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Mes Matières */}
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
                    <div 
                      className={`progress-fill ${matiere.status}`}
                      style={{ width: `${matiere.taux}%` }}
                    ></div>
                  </div>

                  <button 
                    className="btn-details"
                    onClick={() => handleVoirDetails(matiere)}
                  >
                    Voir détails
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Prochains Cours */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                Prochains cours
              </h3>
              <div className="prochains-cours">
                {prochaineCours.map((cours, idx) => (
                  <div className="cours-item" key={idx}>
                    <div className="cours-icon">📅</div>
                    <div className="cours-info">
                      <h4>{cours.matiere}</h4>
                      <div className="cours-meta">
                        <span>{cours.type}</span>
                        <span>•</span>
                        <span>{cours.date}</span>
                      </div>
                      <div className="cours-details">
                        {cours.heure} • {cours.salle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                Actions rapides
              </h3>
              <div className="quick-actions">
                <button className="action-btn">
                  <div className="action-icon">📄</div>
                  <div className="action-content">
                    <h4>Mes justificatifs</h4>
                    <p>Gérer mes demandes</p>
                  </div>
                </button>
                <button className="action-btn">
                  <div className="action-icon">📊</div>
                  <div className="action-content">
                    <h4>Mon relevé</h4>
                    <p>Télécharger en PDF</p>
                  </div>
                </button>
                <button className="action-btn">
                  <div className="action-icon">📅</div>
                  <div className="action-content">
                    <h4>Emploi du temps</h4>
                    <p>Voir le planning</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardEtudiant;