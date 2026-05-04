// components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionListRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/enseignant/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    const fetchChartData = async () => {
      try {
        const response = await axios.get('/api/enseignant/attendance-evolution/');
        setChartData(response.data);
      } catch (err) {
        console.error("Erreur chargement graphique", err);
        setChartData({ labels: [], values: [] });
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Taux de présence (%)",
        data: chartData.values,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
      },
    },
  };

  const handleNewSession = () => {
    console.log('Nouvelle séance');
  };

  const handleSessionClick = (session) => {
    if (session && session.id) {
      navigate(`/appel/${session.id}`);
    } else {
      console.error('ID de séance manquant', session);
    }
  };

  const handleAction = (action) => {
    if (action.title === "Faire l'appel") {
      if (sessionListRef.current) {
        sessionListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sessionListRef.current.style.transition = 'background-color 0.5s';
        sessionListRef.current.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
          if (sessionListRef.current) sessionListRef.current.style.backgroundColor = '';
        }, 1500);
      }
    } else if (action.link) {
      navigate(action.link);
    }
  };

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const { stats, sessions, quickActions, enseignant, justificatifsRecents } = dashboardData;

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">{enseignant.nom_complet}</div>
            <div className="user-role">Enseignant - {enseignant.specialite || 'Département'}</div>
          </div>
          <div className="user-avatar">{enseignant.nom_complet.charAt(0)}</div>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-subtitle">Vue d'ensemble de vos groupes et statistiques d'assiduité</p>

        {/* KPI cards */}
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

        {/* Main 2‑column layout */}
        <div className="content-grid">
          {/* Left column : Sessions récentes */}
          <div className="card" ref={sessionListRef}>
            <div className="card-header">
              <h3 className="card-title">Séances récentes</h3>
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

          {/* Right column : Actions rapides + Justificatifs en attente */}
          <div>
            {/* Actions rapides */}
            <div className="card">
              <h3 className="card-title">Actions rapides</h3>
              <div className="quick-actions">
                {quickActions.map((action, idx) => (
                  <button
                    className="action-btn"
                    key={idx}
                    onClick={() => handleAction(action)}
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

            {/* Justificatifs en attente (nouvelle section) */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">
                  📄 Justificatifs en attente
                  <span className="count-badge">{justificatifsRecents?.length || 0}</span>
                </h3>
              </div>
              <div className="justifs-list">
                {justificatifsRecents && justificatifsRecents.length > 0 ? (
                  justificatifsRecents.map((justif, idx) => (
                    <div className="justif-item" key={idx}>
                      <div className="justif-info">
                        <h4>{justif.etudiant}</h4>
                        <p>{justif.numero}</p>
                        <p className="justif-matiere">{justif.matiere}</p>
                        <p className="justif-date">Déposé le {justif.dateDepot}</p>
                      </div>
                      <button
                        className="btn-view"
                        onClick={() => navigate('/justificatifs')}
                      >
                        Voir
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Aucun justificatif en attente</div>
                )}
                <div className="view-all" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <button
                    className="btn-link"
                    onClick={() => navigate('/justificatifs')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer' }}
                  >
                    Voir tous les justificatifs →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique évolution assiduité */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Évolution de l'assiduité (taux de présence hebdomadaire)
          </h3>
          <div className="chart-container" style={{ height: '300px' }}>
            {chartLoading ? (
              <div>Chargement du graphique...</div>
            ) : chartData.labels.length === 0 ? (
              <div>Aucune donnée disponible pour le moment.</div>
            ) : (
              <Line data={chartDataConfig} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;