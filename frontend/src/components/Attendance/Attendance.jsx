// components/Attendance/Attendance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Attendance.css';

const Attendance = () => {
  const { seanceId } = useParams(); // ex: /appel/:seanceId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seance, setSeance] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!seanceId) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/enseignant/seance/${seanceId}/`);
        setSeance(response.data.seance);
        setStudents(response.data.students);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [seanceId]);

  const updateStatus = (studentId, newStatus) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
    );
  };

  const setAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const setAllAbsent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'absent' })));
  };

  const handleSave = async () => {
    const presences = students.map(s => ({
      etudiant_id: s.id,
      statut: s.status || 'absent'
    }));
    try {
      await axios.post('/api/enseignant/presences/bulk/', {
        seance_id: seanceId,
        presences
      });
      alert('Appel enregistré avec succès');
      navigate('/');
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!seance) return <div>Aucune séance trouvée</div>;

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const retardCount = students.filter(s => s.status === 'retard').length;
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm)
  );

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>
      <div className="container">
        <div className="back-btn" onClick={() => navigate(-1)}>← Retour</div>

        <div className="session-card">
          <div className="session-title">{seance.matiere} - {seance.type.toUpperCase()}</div>
          <div className="session-details">
            <div className="session-detail">
              <div className="detail-icon">📅</div>
              <div className="detail-text">
                <div className="detail-label">Date</div>
                <div className="detail-value">{new Date(seance.date).toLocaleDateString('fr-FR')}, {seance.heure_debut} - {seance.heure_fin}</div>
              </div>
            </div>
            <div className="session-detail">
              <div className="detail-icon">👥</div>
              <div className="detail-text">
                <div className="detail-label">Groupe</div>
                <div className="detail-value">{seance.groupe} - Salle {seance.salle}</div>
              </div>
            </div>
            <div className="session-detail">
              <div className="detail-icon">🎓</div>
              <div className="detail-text">
                <div className="detail-label">Total</div>
                <div className="detail-value">{students.length} étudiants inscrits</div>
              </div>
            </div>
          </div>
        </div>

        <div className="controls-bar">
          <div className="search-box">
            <input type="text" placeholder="Rechercher un étudiant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="bulk-actions">
            <button className="btn btn-success" onClick={setAllPresent}>✓ Tous présents</button>
            <button className="btn btn-danger" onClick={setAllAbsent}>✗ Tous absents</button>
          </div>
        </div>

        <div className="students-grid">
          {filteredStudents.map(student => (
            <div key={student.id} className={`student-card ${student.status}`}>
              <div className="student-avatar">{student.initials}</div>
              <div className="student-info">
                <h4>{student.name}</h4>
                <div className="student-meta">
                  <span>📋 {student.studentId}</span>
                </div>
              </div>
              <div className="status-badges">
                <button className={`status-btn ${student.status === 'present' ? 'active-present' : ''}`} onClick={() => updateStatus(student.id, 'present')}>✓</button>
                <button className={`status-btn ${student.status === 'absent' ? 'active-absent' : ''}`} onClick={() => updateStatus(student.id, 'absent')}>✗</button>
                <button className={`status-btn ${student.status === 'retard' ? 'active-retard' : ''}`} onClick={() => updateStatus(student.id, 'retard')}>⏰</button>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-footer">
          <div className="summary-stats">
            <div className="summary-item"><div className="summary-value green">{presentCount}</div><div className="summary-label">Présents</div></div>
            <div className="summary-item"><div className="summary-value red">{absentCount}</div><div className="summary-label">Absents</div></div>
            <div className="summary-item"><div className="summary-value orange">{retardCount}</div><div className="summary-label">Retards</div></div>
          </div>
          <button className="btn-save" onClick={handleSave}>💾 Enregistrer l'appel</button>
        </div>
      </div>
    </>
  );
};

export default Attendance;