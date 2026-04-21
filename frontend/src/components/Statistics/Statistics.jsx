import React, { useState } from 'react';
import './Statistics.css';

const Statistics = () => {
  // Données statiques (interface inchangée)
  const [periodFilter, setPeriodFilter] = useState('Ce mois');
  const [groupFilter, setGroupFilter] = useState('Tous les groupes');

  // Overview data
  const overview = {
    globalRate: 91.2,
    trendRate: '+2.3% vs mois dernier',
    sessionsCount: 48 ,
    totalAbsences: 142,
    absencesTrend: '-18 vs mois dernier',
    atRiskStudents: 12,
  };

  // Top students data
  const topStudents = [
    { rank: 1, name: 'Leila Mansouri', id: '20210267', rate: 98.5 },
    { rank: 2, name: 'Ahmed Ben Ali', id: '20210245', rate: 96.8 },
    { rank: 3, name: 'Yassine Trabelsi', id: '20210189', rate: 95.2 },
    { rank: 4, name: 'Nour Jebali', id: '20210334', rate: 94.1 },
    { rank: 5, name: 'Karim Saidi', id: '20210298', rate: 93.7 },
  ];

  // Group comparison data
  const groups = [
    { name: 'Groupe 2A-INFO', rate: 94.5, color: 'var(--success)' },
    { name: 'Groupe 1A-INFO', rate: 91.8, color: 'var(--success)' },
    { name: 'Groupe 3A-INFO', rate: 87.3, color: 'var(--warning)' },
    { name: 'Groupe 2B-INFO', rate: 82.1, color: 'var(--danger)' },
  ];

  // Alerts data
  const alerts = [
    {
      student: 'Salma Khalil (20210312)',
      message: 'Dépassement du seuil - 12 absences / 10 autorisées',
      severity: 'critical',
    },
    {
      student: 'Omar Bouzid (20210401)',
      message: 'Risque d\'élimination - 11 absences / 10 autorisées',
      severity: 'critical',
    },
    {
      student: 'Ines Gharbi (20210356)',
      message: 'Approche du seuil - 8 absences / 10 autorisées',
      severity: 'warning',
    },
    {
      student: 'Mehdi Khelifi (20210287)',
      message: 'Approche du seuil - 9 absences / 10 autorisées',
      severity: 'warning',
    },
  ];

  // Handlers
  const handlePeriodChange = (e) => {
    setPeriodFilter(e.target.value);
    console.log('Période filtrée:', e.target.value);
    // Ici, vous pouvez charger de nouvelles données via API
  };

  const handleGroupChange = (e) => {
    setGroupFilter(e.target.value);
    console.log('Groupe filtré:', e.target.value);
    // Ici, vous pouvez charger de nouvelles données via API
  };

  const handleExportPDF = () => {
    console.log('Exporter en PDF');
    // Implémenter l'export PDF
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  const getProgressColor = (rate) => {
    if (rate >= 90) return 'var(--success)';
    if (rate >= 80) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Statistiques & Rapports</h1>
          <div className="filter-group">
            <select
              className="filter-select"
              value={periodFilter}
              onChange={handlePeriodChange}
            >
              <option>Ce mois</option>
              <option>Ce semestre</option>
              <option>Cette année</option>
              <option>Personnalisé</option>
            </select>
            <select
              className="filter-select"
              value={groupFilter}
              onChange={handleGroupChange}
            >
              <option>Tous les groupes</option>
              <option>Groupe 2A-INFO</option>
              <option>Groupe 1A-INFO</option>
              <option>Groupe 3A-INFO</option>
            </select>
            <button className="btn-export" onClick={handleExportPDF}>
              📥 Exporter PDF
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-label">Taux de présence global</div>
            <div className="overview-value success">{overview.globalRate}%</div>
            <div className="overview-trend">{overview.trendRate}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${overview.globalRate}%` }}
              ></div>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-label">Séances effectuées</div>
            <div className="overview-value primary">{overview.sessionsCount}</div>
            <div className="overview-trend">Ce mois-ci</div>
          </div>

          <div className="overview-card">
            <div className="overview-label">Absences totales</div>
            <div className="overview-value warning">{overview.totalAbsences}</div>
            <div className="overview-trend">{overview.absencesTrend}</div>
          </div>

          <div className="overview-card">
            <div className="overview-label">Étudiants à risque</div>
            <div className="overview-value danger">{overview.atRiskStudents}</div>
            <div className="overview-trend">Dépassement &gt; 80% du seuil</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="card">
            <h3 className="card-title">Évolution de l'assiduité - Mars 2026</h3>
            <div className="chart-container">
              📈 Graphique linéaire (Chart.js/Recharts)
              <br />
              <small>Taux de présence par semaine</small>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">🏆 Top 5 - Meilleure assiduité</h3>
            <div className="top-students-list">
              {topStudents.map((student) => (
                <div className="student-rank-item" key={student.id}>
                  <div className={`rank-badge ${getRankBadgeClass(student.rank)}`}>
                    {student.rank}
                  </div>
                  <div className="student-rank-info">
                    <div className="student-rank-name">{student.name}</div>
                    <div className="student-rank-id">{student.id}</div>
                  </div>
                  <div className="attendance-percentage">{student.rate}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison by Group */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 className="card-title">Comparaison par groupe</h3>
          <div className="group-comparison">
            {groups.map((group, idx) => (
              <div className="group-bar" key={idx}>
                <div className="group-header">
                  <span className="group-name">{group.name}</span>
                  <span
                    className="group-rate"
                    style={{ color: getProgressColor(group.rate) }}
                  >
                    {group.rate}%
                  </span>
                </div>
                <div className="group-progress">
                  <div
                    className="group-progress-fill"
                    style={{
                      width: `${group.rate}%`,
                      background: getProgressColor(group.rate),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="alerts-section">
          <h3 className="card-title">⚠️ Alertes récentes</h3>
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div
                className={`alert-item ${
                  alert.severity === 'critical' ? 'alert-danger' : 'alert-warning'
                }`}
                key={idx}
              >
                <div className="alert-content">
                  <div className="alert-student">{alert.student}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <span
                  className={`alert-badge ${
                    alert.severity === 'critical' ? 'badge-critical' : 'badge-warning'
                  }`}
                >
                  {alert.severity === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;