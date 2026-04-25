import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './StatisticsAdmin.css';

/* ─── PALETTE ────────────────────────────────────────────── */
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

/* ─── DATA ────────────────────────────────────────────────── */
const filieres = [
  { id: 1, nom: 'Informatique',       code: 'INFO', etudiants: 312, groupes: 8,  taux: 91.5, absences: 1420, eliminations: 12, alertes: 45, rank: 'r1' },
  { id: 2, nom: 'Génie Civil',        code: 'GC',   etudiants: 287, groupes: 7,  taux: 88.2, absences: 1680, eliminations: 15, alertes: 38, rank: 'r2' },
  { id: 3, nom: 'Télécommunications', code: 'TELEC',etudiants: 265, groupes: 7,  taux: 90.1, absences: 1290, eliminations: 8,  alertes: 35, rank: 'r3' },
  { id: 4, nom: 'Électronique',       code: 'ELEC', etudiants: 241, groupes: 6,  taux: 87.8, absences: 1580, eliminations: 18, alertes: 52, rank: 'rn' },
  { id: 5, nom: 'Mécanique',          code: 'MECA', etudiants: 228, groupes: 6,  taux: 85.3, absences: 1720, eliminations: 10, alertes: 41, rank: 'rn' },
  { id: 6, nom: 'Génie Industriel',   code: 'GI',   etudiants: 194, groupes: 5,  taux: 89.4, absences: 1050, eliminations: 7,  alertes: 29, rank: 'rn' },
  { id: 7, nom: 'Génie Électrique',   code: 'GE',   etudiants: 176, groupes: 5,  taux: 83.1, absences: 1890, eliminations: 22, alertes: 58, rank: 'rn' },
];

const monthlyTrend = [
  { mois: 'Sep', taux: 94.2, absences: 380,  eliminations: 2 },
  { mois: 'Oct', taux: 92.8, absences: 510,  eliminations: 5 },
  { mois: 'Nov', taux: 91.1, absences: 640,  eliminations: 8 },
  { mois: 'Déc', taux: 88.5, absences: 820,  eliminations: 14 },
  { mois: 'Jan', taux: 87.2, absences: 950,  eliminations: 19 },
  { mois: 'Fév', taux: 89.3, absences: 740,  eliminations: 16 },
  { mois: 'Mar', taux: 91.4, absences: 560,  eliminations: 11 },
];

const absencesByType = [
  { type: 'Cours', nombre: 3240 },
  { type: 'TD',    nombre: 2180 },
  { type: 'TP',    nombre: 1820 },
];

const justifStatus = [
  { name: 'Validés',     value: 312, color: C.success },
  { name: 'En attente',  value: 89,  color: C.warning },
  { name: 'Refusés',     value: 47,  color: C.danger },
];

const radarData = filieres.slice(0, 5).map(f => ({
  filiere: f.code,
  Assiduité: f.taux,
  Risque: Math.round(100 - f.taux + (f.alertes / f.etudiants) * 10),
}));

const studentsAtRisk = [
  { initials: 'SK', nom: 'Salma Khalil',     filiere: 'INFO', groupe: '2A-INFO', absences: 15, seuil: 10, level: 'critical' },
  { initials: 'OB', nom: 'Omar Bouzid',      filiere: 'INFO', groupe: '2A-INFO', absences: 13, seuil: 10, level: 'critical' },
  { initials: 'IG', nom: 'Ines Gharbi',      filiere: 'GC',   groupe: '3A-GC',   absences: 11, seuil: 10, level: 'critical' },
  { initials: 'MK', nom: 'Mehdi Khelifi',    filiere: 'GE',   groupe: '2A-GE',   absences: 10, seuil: 10, level: 'high' },
  { initials: 'AT', nom: 'Aymen Trabelsi',   filiere: 'MECA', groupe: '1A-MECA', absences: 9,  seuil: 10, level: 'high' },
  { initials: 'LB', nom: 'Leila Ben Salem',  filiere: 'ELEC', groupe: '2A-ELEC', absences: 9,  seuil: 10, level: 'high' },
];

const weeklyAttendance = [
  { sem: 'S1', INFO: 94, GC: 90, ELEC: 88, MECA: 86 },
  { sem: 'S2', INFO: 92, GC: 89, ELEC: 87, MECA: 84 },
  { sem: 'S3', INFO: 93, GC: 88, ELEC: 89, MECA: 85 },
  { sem: 'S4', INFO: 91, GC: 87, ELEC: 86, MECA: 83 },
  { sem: 'S5', INFO: 90, GC: 88, ELEC: 85, MECA: 84 },
  { sem: 'S6', INFO: 92, GC: 90, ELEC: 88, MECA: 86 },
  { sem: 'S7', INFO: 93, GC: 89, ELEC: 87, MECA: 85 },
  { sem: 'S8', INFO: 91, GC: 88, ELEC: 86, MECA: 83 },
];

/* ─── CUSTOM TOOLTIP ──────────────────────────────────────── */
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

/* ─── TAUX COLOR ──────────────────────────────────────────── */
const tauxColor = (t) => t >= 90 ? C.success : t >= 85 ? C.warning : C.danger;

/* ─── COMPONENT ───────────────────────────────────────────── */
const StatisticsAdmin = () => {
  const [annee, setAnnee]     = useState('2025-2026');
  const [semestre, setSemestre] = useState('Semestre 2');
  const [filiere, setFiliere]   = useState('Toutes');

  const totalEtudiants  = filieres.reduce((s, f) => s + f.etudiants, 0);
  const totalAbsences   = filieres.reduce((s, f) => s + f.absences, 0);
  const totalElims      = filieres.reduce((s, f) => s + f.eliminations, 0);
  const totalAlertes    = filieres.reduce((s, f) => s + f.alertes, 0);
  const tauxGlobal      = (filieres.reduce((s, f) => s + f.taux * f.etudiants, 0) / totalEtudiants).toFixed(1);
  const totalJustifs    = justifStatus.reduce((s, j) => s + j.value, 0);

  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Vue d\'ensemble' },
    { id: 'depts',     icon: '🏢', label: 'Départements' },
    { id: 'alertes',   icon: '⚠️', label: 'Alertes' },
    { id: 'elims',     icon: '🚫', label: 'Éliminations' },
    { id: 'justifs',   icon: '📄', label: 'Justificatifs' },
    { id: 'stats',     icon: '📊', label: 'Statistiques', active: true },
    { id: 'config',    icon: '⚙️', label: 'Configuration' },
  ];

  return (
    <>
      {/* ── HEADER ── */}
      <div className="header">
        <div className="logo">
          <div className="logo-icon">📚</div>
          <div>
            GestionAbsence
            <span className="logo-sub">Administration · ISSAT Sousse</span>
          </div>
        </div>
        <div className="header-right">
          <span className="header-badge">Admin</span>
          <div className="user-info">
            <div>
              <div className="user-name">Mme. Fatma Mansouri</div>
              <div className="user-role">Agent Administratif — Scolarité</div>
            </div>
            <div className="user-avatar admin">FM</div>
          </div>
        </div>
      </div>

      <div className="app-layout">


        {/* ── MAIN ── */}
        <div className="main-content">
          <div className="container">

            {/* Page header */}
            <div className="page-header">
              <div>
                <div className="breadcrumb">
                  <span>GestionAbsence</span>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-current">Statistiques globales</span>
                </div>
                <h1 className="page-title">Statistiques Globales</h1>
                <p className="page-subtitle">
                  Analyse complète de l'assiduité par filière, département et période
                </p>
              </div>
              <div className="filters-bar">
                <select className="filter-select" value={annee} onChange={e => setAnnee(e.target.value)}>
                  <option>2025-2026</option>
                  <option>2024-2025</option>
                </select>
                <select className="filter-select" value={semestre} onChange={e => setSemestre(e.target.value)}>
                  <option>Semestre 2</option>
                  <option>Semestre 1</option>
                  <option>Année complète</option>
                </select>
                <select className="filter-select" value={filiere} onChange={e => setFiliere(e.target.value)}>
                  <option>Toutes</option>
                  {filieres.map(f => <option key={f.id}>{f.nom}</option>)}
                </select>
                <button className="btn-export">📥 Exporter PDF</button>
              </div>
            </div>

            {/* ── KPI STRIP ── */}
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

            {/* ── ROW 1 : Évolution mensuelle + Absences par type ── */}
            <div className="section-title">Évolution temporelle</div>
            <div className="charts-row charts-row-2" style={{ marginBottom: '1rem' }}>

              {/* Line chart: taux mensuel */}
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
                    <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[84, 96]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey="taux" name="Taux de présence"
                        stroke={C.brand} strokeWidth={2.5} dot={{ fill: C.brand, r: 4 }}
                        activeDot={{ r: 6, fill: C.brand }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart: absences + éliminations par mois */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Absences & Éliminations</div>
                    <div className="chart-card-subtitle">Volumes mensuels cumulés</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="absences"     name="Absences"     fill={C.brandLt} radius={[4,4,0,0]} maxBarSize={24} />
                      <Bar dataKey="eliminations" name="Éliminations" fill={C.danger}  radius={[4,4,0,0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.brandLt }}></div>Absences</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.danger }}></div>Éliminations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 2 : Assiduité par filière (bar) + Justificatifs (pie) + Absences type (pie) ── */}
            <div className="section-title">Analyse par filière</div>
            <div className="charts-row charts-row-3" style={{ marginBottom: '1rem' }}>

              {/* Bar chart: taux par filière */}
              <div className="chart-card" style={{ gridColumn: '1 / 2' }}>
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Taux de présence par filière</div>
                    <div className="chart-card-subtitle">Comparaison inter-filières</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={filieres.map(f => ({ name: f.code, taux: f.taux, fill: tauxColor(f.taux) }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 95]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="taux" name="Taux" radius={[4,4,0,0]} maxBarSize={32}>
                        {filieres.map((f, i) => (
                          <Cell key={i} fill={tauxColor(f.taux)} />
                        ))}
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

              {/* Donut: justificatifs */}
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
                        <Pie
                          data={justifStatus} cx="50%" cy="50%"
                          innerRadius={48} outerRadius={72}
                          paddingAngle={3} dataKey="value"
                        >
                          {justifStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
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
                    {justifStatus.map((j, i) => (
                      <div key={i} className="legend-item">
                        <div className="legend-dot" style={{ background: j.color }}></div>
                        {j.name} ({j.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donut: type d'absence */}
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
                        <Pie
                          data={absencesByType} cx="50%" cy="50%"
                          innerRadius={48} outerRadius={72}
                          paddingAngle={3} dataKey="nombre"
                        >
                          {[C.brand, C.brandLt, '#a8c8e8'].map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v}`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <div className="donut-center-value">{absencesByType.reduce((s, a) => s + a.nombre, 0).toLocaleString()}</div>
                      <div className="donut-center-label">total</div>
                    </div>
                  </div>
                  <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                    {absencesByType.map((a, i) => (
                      <div key={i} className="legend-item">
                        <div className="legend-dot" style={{ background: [C.brand, C.brandLt, '#a8c8e8'][i] }}></div>
                        {a.type} ({a.nombre.toLocaleString()})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW 3 : Tableau filières + Radar ── */}
            <div className="charts-row charts-row-2r" style={{ marginBottom: '1rem' }}>

              {/* Radar */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Profil comparatif (Radar)</div>
                    <div className="chart-card-subtitle">Assiduité vs niveau de risque — top 5 filières</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                      <PolarGrid stroke={C.divider} />
                      <PolarAngleAxis dataKey="filiere" tick={{ fontSize: 11, fill: C.muted }} />
                      <Radar name="Assiduité" dataKey="Assiduité" stroke={C.brand}   fill={C.brand}   fillOpacity={0.18} strokeWidth={2} />
                      <Radar name="Risque"    dataKey="Risque"    stroke={C.danger}  fill={C.danger}  fillOpacity={0.12} strokeWidth={2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="chart-legend" style={{ justifyContent: 'center' }}>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.brand }}></div>Assiduité</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: C.danger }}></div>Indice de risque</div>
                  </div>
                </div>
              </div>

              {/* Tableau filières */}
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
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>Filière</th>
                        <th>Étudiants</th>
                        <th className="taux-bar-cell">Taux</th>
                        <th>⚠️</th>
                        <th>🚫</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filieres].sort((a, b) => b.taux - a.taux).map((f, i) => (
                        <tr key={f.id}>
                          <td>
                            <span className={`rank-pill ${i < 3 ? `r${i+1}` : 'rn'}`}>{i + 1}</span>
                          </td>
                          <td>
                            <div className="filiere-name">{f.nom}</div>
                            <div className="filiere-meta">{f.groupes} groupes</div>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                            {f.etudiants}
                          </td>
                          <td className="taux-bar-cell">
                            <div className="taux-bar-wrap">
                              <div className="taux-mini-bar">
                                <div className="taux-mini-fill" style={{ width: `${f.taux}%`, background: tauxColor(f.taux) }}></div>
                              </div>
                              <span className="taux-num" style={{ color: tauxColor(f.taux) }}>{f.taux}%</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: C.warning, fontWeight: 700, fontSize: '0.78rem' }}>{f.alertes}</span>
                          </td>
                          <td>
                            <span style={{ color: C.danger, fontWeight: 700, fontSize: '0.78rem' }}>{f.eliminations}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── ROW 4 : Évolution hebdo multi-filières + Étudiants à risque ── */}
            <div className="section-title">Suivi détaillé</div>
            <div className="charts-row charts-row-2">

              {/* Line multi-filières */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Assiduité hebdomadaire par filière</div>
                    <div className="chart-card-subtitle">Suivi des 4 principales filières — S8</div>
                  </div>
                </div>
                <div className="chart-card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyAttendance} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.divider} vertical={false} />
                      <XAxis dataKey="sem" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 97]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="INFO" stroke={C.brand}    strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="GC"   stroke={C.success}  strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ELEC" stroke={C.warning}  strokeWidth={2} dot={false} strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="MECA" stroke={C.danger}   strokeWidth={2} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {[['INFO', C.brand], ['GC', C.success], ['ELEC', C.warning], ['MECA', C.danger]].map(([n, c]) => (
                      <div key={n} className="legend-item">
                        <div className="legend-dot" style={{ background: c }}></div>{n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Étudiants à risque */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Étudiants à risque d'élimination</div>
                    <div className="chart-card-subtitle">{studentsAtRisk.length} cas critiques ou élevés</div>
                  </div>
                  <span className="stat-chip" style={{ color: '#e14b4b', borderColor: '#fdf0f0', background: '#fdf0f0' }}>
                    🚨 Urgent
                  </span>
                </div>
                <div className="risk-list">
                  {studentsAtRisk.map((s, i) => (
                    <div key={i} className="risk-item">
                      <div className="risk-avatar">{s.initials}</div>
                      <div className="risk-info">
                        <div className="risk-name">{s.nom}</div>
                        <div className="risk-sub">{s.filiere} · {s.groupe}</div>
                      </div>
                      <span className={`risk-badge ${s.level}`}>
                        {s.level === 'critical' ? '🔴 Critique' : '🟠 Élevé'}
                      </span>
                      <div className="risk-absences">{s.absences}/{s.seuil}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default StatisticsAdmin;