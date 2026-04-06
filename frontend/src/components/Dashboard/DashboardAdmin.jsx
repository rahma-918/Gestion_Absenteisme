import React from 'react';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
  // Données statistiques globales
  const stats = [
    {
      value: '12',
      label: 'Départements',
      icon: '🏢',
      iconClass: 'blue',
      trend: 'Vue d\'ensemble',
      trendClass: 'trend-neutral'
    },
    {
      value: '156',
      label: 'Groupes actifs',
      icon: '👥',
      iconClass: 'blue',
      trend: 'Année 2025-2026',
      trendClass: 'trend-neutral'
    },
    {
      value: '4,523',
      label: 'Étudiants inscrits',
      icon: '🎓',
      iconClass: 'green',
      trend: '+145 vs année dernière',
      trendClass: 'trend-up'
    },
    {
      value: '89.3%',
      label: 'Taux de présence global',
      icon: '✓',
      iconClass: 'success',
      trend: '+1.2% vs mois dernier',
      trendClass: 'trend-up'
    },
    {
      value: '248',
      label: 'Alertes actives',
      icon: '⚠️',
      iconClass: 'orange',
      trend: '142 étudiants à risque',
      trendClass: 'trend-warning'
    },
    {
      value: '67',
      label: 'Éliminations',
      icon: '🚫',
      iconClass: 'red',
      trend: 'Ce semestre',
      trendClass: 'trend-danger'
    }
  ];

  const departementsStats = [
    { nom: 'Informatique', taux: 91.5, alertes: 45, eliminations: 12 },
    { nom: 'Génie Civil', taux: 88.2, alertes: 38, eliminations: 15 },
    { nom: 'Électronique', taux: 87.8, alertes: 52, eliminations: 18 },
    { nom: 'Mécanique', taux: 85.3, alertes: 41, eliminations: 10 },
    { nom: 'Télécommunications', taux: 90.1, alertes: 35, eliminations: 8 }
  ];

  const alertesCritiques = [
    {
      etudiant: 'Salma Khalil',
      numero: '20210312',
      departement: 'Informatique',
      nbAbsences: 15,
      seuil: 10,
      matiere: 'Algorithmique Avancée'
    },
    {
      etudiant: 'Omar Bouzid',
      numero: '20210401',
      departement: 'Informatique',
      nbAbsences: 13,
      seuil: 10,
      matiere: 'Base de Données'
    },
    {
      etudiant: 'Ines Gharbi',
      numero: '20210356',
      departement: 'Génie Civil',
      nbAbsences: 11,
      seuil: 10,
      matiere: 'Résistance des Matériaux'
    }
  ];

  const justificatifsEnAttente = [
    {
      etudiant: 'Mohamed Trabelsi',
      numero: '20210298',
      matiere: 'Programmation Web',
      dateDepot: '23 Mars 2026',
      departement: 'Informatique'
    },
    {
      etudiant: 'Leila Ben Salem',
      numero: '20210334',
      matiere: 'Électronique de Puissance',
      dateDepot: '22 Mars 2026',
      departement: 'Électronique'
    }
  ];

  // Handlers
  const handleVoirDepartement = (dept) => {
    console.log('Voir département:', dept);
  };

  const handleGererElimination = (etudiant) => {
    console.log('Gérer élimination:', etudiant);
  };

  const handleVoirJustificatif = (justif) => {
    console.log('Voir justificatif:', justif);
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">Mme. Fatma Mansouri</div>
            <div className="user-role">Agent Administratif - Scolarité</div>
          </div>
          <div className="user-avatar admin">FM</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="page-title">Tableau de Bord Administratif</h1>
        <p className="page-subtitle">Vue d'ensemble de l'absentéisme dans l'établissement</p>

        {/* Stats Grid */}
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

        {/* Content Grid */}
        <div className="admin-content-grid">
          {/* Départements Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Statistiques par Département</h3>
              <button className="btn-primary">📥 Exporter rapport</button>
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

          {/* Sidebar */}
          <div>
            {/* Alertes Critiques */}
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
                      <p className="absences-count">
                        {alerte.nbAbsences}/{alerte.seuil} absences
                      </p>
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

            {/* Justificatifs en attente */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  📄 Justificatifs en attente
                  <span className="count-badge">{justificatifsEnAttente.length}</span>
                </h3>
              </div>
              <div className="justifs-list">
                {justificatifsEnAttente.map((justif, idx) => (
                  <div className="justif-item" key={idx}>
                    <div className="justif-info">
                      <h4>{justif.etudiant}</h4>
                      <p>{justif.numero}</p>
                      <p className="justif-matiere">{justif.matiere}</p>
                      <p className="justif-date">Déposé le {justif.dateDepot}</p>
                    </div>
                    <button 
                      className="btn-view"
                      onClick={() => handleVoirJustificatif(justif)}
                    >
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
            ⚡ Actions rapides
          </h3>
          <div className="quick-actions-grid">
            <button className="quick-action-card">
              <div className="qa-icon">📊</div>
              <h4>Générer rapport global</h4>
              <p>Statistiques de l'établissement</p>
            </button>
            <button className="quick-action-card">
              <div className="qa-icon">🚫</div>
              <h4>Gérer les éliminations</h4>
              <p>67 cas en attente</p>
            </button>
            <button className="quick-action-card">
              <div className="qa-icon">⚙️</div>
              <h4>Configurer les seuils</h4>
              <p>Par matière ou global</p>
            </button>
            <button className="quick-action-card">
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