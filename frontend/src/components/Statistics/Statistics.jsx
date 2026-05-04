// components/Statistics/Statistics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Statistics.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('Ce mois');
  const [groupFilter, setGroupFilter] = useState('Tous les groupes');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/enseignant/statistics/');
        setStatsData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getProgressColor = (rate) => {
    if (rate >= 90) return 'var(--success)';
    if (rate >= 80) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  const exportToPDF = async () => {
    const element = document.getElementById('statistics-content');
    if (!element) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`statistiques_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const { overview, topStudents, groupComparison, alerts, evolution } = statsData;

  const chartDataConfig = {
    labels: evolution.labels,
    datasets: [
      {
        label: "Taux de présence (%)",
        data: evolution.values,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        title: { display: true, text: "Taux de présence (%)" },
      },
      x: {
        title: { display: true, text: "Semaines" },
      },
    },
  };

  const handlePeriodChange = (e) => setPeriodFilter(e.target.value);
  const handleGroupChange = (e) => setGroupFilter(e.target.value);

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Statistiques & Rapports</h1>
          <div className="filter-group">
            <select className="filter-select" value={periodFilter} onChange={handlePeriodChange}>
              <option>Ce mois</option>
              <option>Ce semestre</option>
              <option>Cette année</option>
              <option>Personnalisé</option>
            </select>
            <select className="filter-select" value={groupFilter} onChange={handleGroupChange}>
              <option>Tous les groupes</option>
              {groupComparison && groupComparison.map(g => <option key={g.name}>{g.name}</option>)}
            </select>
            <button className="btn-export" onClick={exportToPDF} disabled={exporting}>
              {exporting ? 'Génération...' : '📥 Exporter PDF'}
            </button>
          </div>
        </div>

        <div id="statistics-content">
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-label">Taux de présence global</div>
              <div className="overview-value success">{overview.globalRate}%</div>
              <div className="overview-trend">{overview.trendRate}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${overview.globalRate}%` }}></div>
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

          <div className="charts-grid">
            <div className="card">
              <h3 className="card-title">Évolution de l'assiduité</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {evolution.labels.length === 0 ? (
                  <div>Aucune donnée disponible</div>
                ) : (
                  <Line data={chartDataConfig} options={chartOptions} />
                )}
              </div>
            </div>
            <div className="card">
              <h3 className="card-title">🏆 Top 5 - Meilleure assiduité</h3>
              <div className="top-students-list">
                {topStudents.map((student) => (
                  <div className="student-rank-item" key={student.id}>
                    <div className={`rank-badge ${getRankBadgeClass(student.rank)}`}>{student.rank}</div>
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

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title">Comparaison par groupe</h3>
            <div className="group-comparison">
              {groupComparison.map((group, idx) => (
                <div className="group-bar" key={idx}>
                  <div className="group-header">
                    <span className="group-name">{group.name}</span>
                    <span className="group-rate" style={{ color: getProgressColor(group.rate) }}>{group.rate}%</span>
                  </div>
                  <div className="group-progress">
                    <div className="group-progress-fill" style={{ width: `${group.rate}%`, background: getProgressColor(group.rate) }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="card-title">⚠️ Alertes récentes</h3>
            <div className="alerts-list">
              {alerts.map((alert, idx) => (
                <div className={`alert-item alert-${alert.severity === 'critical' ? 'danger' : 'warning'}`} key={idx}>
                  <div className="alert-content">
                    <div className="alert-student">{alert.student}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                  <span className={`alert-badge badge-${alert.severity === 'critical' ? 'critical' : 'warning'}`}>
                    {alert.severity === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;