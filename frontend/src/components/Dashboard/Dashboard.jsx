import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Données statiques (interface inchangée)
  const stats = [
    {
      value: '4',
      label: 'Groupes assignés',
      icon: '👥',
      iconClass: 'blue',
      trend: '↑ 2 nouveaux ce semestre',
      trendClass: 'trend-up'
    },
    {
      value: '156',
      label: 'Étudiants total',
      icon: '🎓',
      iconClass: 'green',
      trend: '↑ +8 depuis début du semestre',
      trendClass: 'trend-up'
    },
    {
      value: '91.2%',
      label: 'Taux de présence moyen',
      icon: '✓',
      iconClass: 'green',
      trend: '↑ +2.3% vs mois dernier',
      trendClass: 'trend-up'
    },
    {
      value: '12',
      label: 'Alertes actives',
      icon: '⚠️',
      iconClass: 'orange',
      trend: '↓ -3 depuis la semaine dernière',
      trendClass: 'trend-down'
    }
  ];

  const sessions = [
    {
      title: 'Algorithmique Avancée - TP',
      date: '📅 Aujourd\'hui, 10:00 - 12:00',
      group: '👥 Groupe 2A-INFO',
      students: '👤 38 étudiants',
      badge: 'success',
      badgeText: 'Appel effectué'
    },
    {
      title: 'Base de Données - Cours',
      date: '📅 Hier, 14:00 - 16:00',
      group: '👥 Groupe 1A-INFO',
      students: '👤 42 étudiants',
      badge: 'success',
      badgeText: 'Appel effectué'
    },
    {
      title: 'Programmation Web - TD',
      date: '📅 22 Mars, 08:00 - 10:00',
      group: '👥 Groupe 3A-INFO',
      students: '👤 35 étudiants',
      badge: 'warning',
      badgeText: 'En attente'
    },
    {
      title: 'Sécurité Informatique - Cours',
      date: '📅 21 Mars, 10:00 - 12:00',
      group: '👥 Groupe 2A-INFO',
      students: '👤 41 étudiants',
      badge: 'success',
      badgeText: 'Appel effectué'
    }
  ];

  const quickActions = [
    {
      icon: '✓',
      title: 'Faire l\'appel',
      description: 'Enregistrer les présences'
    },
    {
      icon: '📊',
      title: 'Statistiques',
      description: 'Voir les rapports détaillés'
    },
    {
      icon: '📄',
      title: 'Justificatifs',
      description: '8 en attente de validation'
    },
    {
      icon: '⚠️',
      title: 'Alertes',
      description: '12 étudiants à risque'
    }
  ];

  // Handlers (à connecter plus tard)
  const handleNewSession = () => {
    console.log('Nouvelle séance');
  };

  const handleAction = (action) => {
    console.log(`Action: ${action}`);
  };

  const handleSessionClick = (session) => {
    console.log('Séance cliquée:', session.title);
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
            <div className="user-name">Dr. Ahmed Ben Salem</div>
            <div className="user-role">Enseignant - Département Informatique</div>
          </div>
          <div className="user-avatar">AB</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-subtitle">Vue d'ensemble de vos groupes et statistiques d'assiduité</p>

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
          {/* Recent Sessions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Séances récentes</h3>
              <button className="btn-primary" onClick={handleNewSession}>
                + Nouvelle séance
              </button>
            </div>
            <div className="session-list">
              {sessions.map((session, idx) => (
                <div 
                  className="session-item" 
                  key={idx}
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="session-info">
                    <h4>{session.title}</h4>
                    <div className="session-meta">
                      <span>{session.date}</span>
                      <span>{session.group}</span>
                      <span>{session.students}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${session.badge}`}>
                    {session.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                Actions rapides
              </h3>
              <div className="quick-actions">
                {quickActions.map((action, idx) => (
                  <button 
                    className="action-btn" 
                    key={idx}
                    onClick={() => handleAction(action.title)}
                  >
                    <div className="action-icon">{action.icon}</div>
                    <div className="action-content">
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Évolution de l'assiduité - Mars 2026
          </h3>
          <div className="chart-container">
            📈 Graphique d'évolution hebdomadaire (à implémenter avec Chart.js ou Recharts)
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;