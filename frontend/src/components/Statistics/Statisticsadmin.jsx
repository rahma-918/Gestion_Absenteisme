import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './StatisticsAdmin.css';

const C = {
  brand:   '#4479A3',
  brandLt: '#6c9dc6',
  success: '#18a76a',
  warning: '#e89b1a',
  danger:  '#e14b4b',
  muted:   '#8fa0b4',
  bg:      '#f4f6f9',
  divider: '#edf1f7',
  text:    '#1c2b3a',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e4eaf2', borderRadius: 8,
      padding: '0.6rem 0.85rem', boxShadow: '0 4px 16px rgba(28,43,58,0.1)',
      fontSize: '0.75rem', minWidth: 120,
    }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: p.color, fontWeight: 600 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: 'monospace' }}>{p.value}{p.name === 'taux' || p.name === 'Assiduité' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

const tauxColor = (t) => t >= 90 ? C.success : t >= 85 ? C.warning : C.danger;

const StatisticsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [annee, setAnnee]     = useState('2025-2026');
  const [semestre, setSemestre] = useState('Semestre 2');
  const [filiere, setFiliere]   = useState('Toutes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/admin/statistics/');
        setStatsData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportToPDF = async () => {
    const element = document.getElementById('statistics-content-admin');
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
      pdf.save(`statistiques_admin_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="loading">Chargement des statistiques...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const {
    kpis,
    monthly_trend,
    filieres,
    absences_by_type,
    justificatifs,
    radar_data,
    students_at_risk,
    weekly_attendance
  } = statsData;

  const totalEtudiants = kpis.total_etudiants;
  const tauxGlobal = kpis.taux_global;
  const totalAbsences = kpis.total_absences;
  const totalAlertes = kpis.total_alertes;
  const totalElims = kpis.eliminations_semestre;
  const totalJustifs = justificatifs.reduce((s, j) => s + j.value, 0);
  const weeklyData = weekly_attendance || [];

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="container">
          <div className="page-header">
            <div>
              <div className="breadcrumb">
                <span>GestionAbsence</span>
                <span className="breadcrumb-sep">›</span>
                <span className="breadcrumb-current">Statistiques globales</span>
              </div>
              <h1 className="page-title">Statistiques Globales</h1>
              <p className="page-subtitle">Analyse complète de l'assiduité par filière, département et période</p>
            </div>
            <div className="filters-bar">
              <select className="filter-select" value={annee} onChange={e => setAnnee(e.target.value)}>
                <option>2025-2026</option><option>2024-2025</option>
              </select>
              <select className="filter-select" value={semestre} onChange={e => setSemestre(e.target.value)}>
                <option>Semestre 2</option><option>Semestre 1</option><option>Année complète</option>
              </select>
              <select className="filter-select" value={filiere} onChange={e => setFiliere(e.target.value)}>
                <option>Toutes</option>
                {filieres.map((f, idx) => <option key={idx}>{f.nom}</option>)}
              </select>
              <button className="btn-export" onClick={exportToPDF} disabled={exporting}>
                {exporting ? 'Génération...' : '📥 Exporter PDF'}
              </button>
            </div>
          </div>

          <div id="statistics-content-admin">
            {/* KPI STRIP */}
            <div className="kpi-grid">
              <div className="kpi-card brand">
                <div className="kpi-icon">🎓</div>
                <div className="kpi-value">{totalEtudiants.toLocaleString()}</div>
                <div className="kpi-label">Étudiants inscrits</div>
                <div className="kpi-trend up">↑ +145 vs an dernier</div>
              </div>
              <div className="kpi-card success">
                <div className="kpi-icon">✓</div>
                <div className="kpi-value">{tauxGlobal}%</div>
                <div className="kpi-label">Taux de présence global</div>
                <div className="kpi-trend up">↑ +1.2% vs mois dernier</div>
              </div>
              <div className="kpi-card warning">
                <div className="kpi-icon">📋</div>
                <div className="kpi-value">{totalAbsences.toLocaleString()}</div>
                <div className="kpi-label">Absences enregistrées</div>
                <div className="kpi-trend warn">↓ -8% vs sem. précédent</div>
              </div>
              <div className="kpi-card danger">
                <div className="kpi-icon">⚠️</div>
                <div className="kpi-value">{totalAlertes}</div>
                <div className="kpi-label">Alertes actives</div>
                <div className="kpi-trend down">↑ +23 cette semaine</div>
              </div>
              <div className="kpi-card info">
                <div className="kpi-icon">🚫</div>
                <div className="kpi-value">{totalElims}</div>
                <div className="kpi-label">Éliminations ce semestre</div>
                <div className="kpi-trend neutral">7 filières concernées</div>
              </div>
            </div>

            {/* ROW 1 : Évolution mensuelle + Absences par type */}
            <div className="section-title">Évolution temporelle</div>
            <div className="charts-row charts-row-2" style={{ marginBottom: '1rem' }}>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Évolution du taux de présence</div>
                    <div className="chart-card-subtitle">Taux global mensuel — {annee}</div>
                  </div>
                  <span className="stat-chip">📈 Tendance</span>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthly_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[84, 96]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="taux" name="Taux de présence" stroke={C.brand} strokeWidth={2.5} dot={{ fill: C.brand, r: 4 }} activeDot={{ r: 6, fill: C.brand }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Absences & Éliminations</div>
                    <div className="chart-card-subtitle">Volumes mensuels cumulés</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthly_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="absences" name="Absences" fill={C.brandLt} radius={[4,4,0,0]} maxBarSize={24} />
                      <Bar dataKey="eliminations" name="Éliminations" fill={C.danger} radius={[4,4,0,0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.brandLt }}></div>Absences</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.danger }}></div>Éliminations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2 : Assiduité par filière (bar) + Justificatifs (pie) + Absences type (pie) */}
            <div className="section-title">Analyse par filière</div>
            <div className="charts-row charts-row-3" style={{ marginBottom: '1rem' }}>
              <div className="chart-card" style={{ gridColumn: '1 / 2' }}>
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Taux de présence par filière</div>
                    <div className="chart-card-subtitle">Comparaison inter-filières</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={filieres.map(f => ({ name: f.code, taux: f.taux, fill: tauxColor(f.taux) }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 95]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="taux" name="Taux" radius={[4,4,0,0]} maxBarSize={32}>
                        {filieres.map((f, i) => (<Cell key={i} fill={tauxColor(f.taux)} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.success }}></div>≥ 90%</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.warning }}></div>85–90%</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.danger }}></div>&lt; 85%</div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Justificatifs</div>
                    <div className="chart-card-subtitle">{totalJustifs} déposés</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={justificatifs} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                          {justificatifs.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v}`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <div className="donut-center-value">{totalJustifs}</div>
                      <div className="donut-center-label">total</div>
                    </div>
                  </div>
                  <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                    {justificatifs.map((j, i) => (<div key={i} className="legend-item"><div className="legend-dot" style={{ background: j.color }}></div>{j.name} ({j.value})</div>))}
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Absences par type</div>
                    <div className="chart-card-subtitle">Cours / TD / TP</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={absences_by_type} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="nombre">
                          {[C.brand, C.brandLt, '#a8c8e8'].map((c, i) => (<Cell key={i} fill={c} />))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v}`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <div className="donut-center-value">{absences_by_type.reduce((s, a) => s + a.nombre, 0).toLocaleString()}</div>
                      <div className="donut-center-label">total</div>
                    </div>
                  </div>
                  <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                    {absences_by_type.map((a, i) => (<div key={i} className="legend-item"><div className="legend-dot" style={{ background: [C.brand, C.brandLt, '#a8c8e8'][i] }}></div>{a.type} ({a.nombre.toLocaleString()})</div>))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3 : Tableau filières + Radar */}
            <div className="charts-row charts-row-2r" style={{ marginBottom: '1rem' }}>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Profil comparatif (Radar)</div>
                    <div className="chart-card-subtitle">Assiduité vs niveau de risque — top 5 filières</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radar_data} cx="50%" cy="50%" outerRadius={90}>
                      <PolarGrid stroke={C.divider} />
                      <PolarAngleAxis dataKey="filiere" tick={{ fontSize: 11, fill: C.muted }} />
                      <Radar name="Assiduité" dataKey="Assiduité" stroke={C.brand} fill={C.brand} fillOpacity={0.18} strokeWidth={2} />
                      <Radar name="Risque" dataKey="Risque" stroke={C.danger} fill={C.danger} fillOpacity={0.12} strokeWidth={2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="chart-legend" style={{ justifyContent: 'center' }}>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.brand }}></div>Assiduité</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.danger }}></div>Indice de risque</div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Détail par filière</div>
                    <div className="chart-card-subtitle">Classement par taux de présence</div>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="filiere-table">
                    <thead>
                      <tr><th style={{ width: 36 }}>#</th><th>Filière</th><th>Étudiants</th><th className="taux-bar-cell">Taux</th><th>⚠️</th><th>🚫</th></tr>
                    </thead>
                    <tbody>
                      {[...filieres].sort((a, b) => b.taux - a.taux).map((f, i) => (
                        <tr key={i}>
                          <td><span className={`rank-pill ${i < 3 ? `r${i+1}` : 'rn'}`}>{i + 1}</span></td>
                          <td><div className="filiere-name">{f.nom}</div><div className="filiere-meta">{f.groupes} groupes</div></td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{f.etudiants}</td>
                          <td className="taux-bar-cell">
                            <div className="taux-bar-wrap">
                              <div className="taux-mini-bar"><div className="taux-mini-fill" style={{ width: `${f.taux}%`, background: tauxColor(f.taux) }}></div></div>
                              <span className="taux-num" style={{ color: tauxColor(f.taux) }}>{f.taux}%</span>
                            </div>
                          </td>
                          <td><span style={{ color: C.warning, fontWeight: 700, fontSize: '0.78rem' }}>{f.alertes}</span></td>
                          <td><span style={{ color: C.danger, fontWeight: 700, fontSize: '0.78rem' }}>{f.eliminations}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ROW 4 : Évolution hebdo multi-filières + Étudiants à risque */}
            <div className="section-title">Suivi détaillé</div>
            <div className="charts-row charts-row-2">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Assiduité hebdomadaire par filière</div>
                    <div className="chart-card-subtitle">Suivi des 4 principales filières — S8</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="sem" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 97]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      {['INFO', 'GC', 'ELEC', 'MECA'].map((key, idx) => weeklyData.length && weeklyData[0][key] !== undefined ? <Line key={key} type="monotone" dataKey={key} stroke={[C.brand, C.success, C.warning, C.danger][idx]} strokeWidth={2} dot={false} strokeDasharray={idx >= 2 ? "4 2" : ""} /> : null)}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {weeklyData.length > 0 && ['INFO', 'GC', 'ELEC', 'MECA'].map((key, idx) => weeklyData[0][key] !== undefined ? <div key={key} className="legend-item"><div className="legend-dot" style={{ background: [C.brand, C.success, C.warning, C.danger][idx] }}></div>{key}</div> : null)}
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Étudiants à risque d'élimination</div>
                    <div className="chart-card-subtitle">{students_at_risk.length} cas critiques ou élevés</div>
                  </div>
                  <span className="stat-chip" style={{ color: '#e14b4b', borderColor: '#fdf0f0', background: '#fdf0f0' }}>🚨 Urgent</span>
                </div>
                <div className="risk-list">
                  {students_at_risk.map((s, i) => (
                    <div key={i} className="risk-item">
                      <div className="risk-avatar">{s.initials}</div>
                      <div className="risk-info">
                        <div className="risk-name">{s.nom}</div>
                        <div className="risk-sub">{s.filiere} · {s.groupe}</div>
                      </div>
                      <span className={`risk-badge ${s.level}`}>{s.level === 'critical' ? '🔴 Critique' : '🟠 Élevé'}</span>
                      <div className="risk-absences">{s.absences}/{s.seuil}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsAdmin;