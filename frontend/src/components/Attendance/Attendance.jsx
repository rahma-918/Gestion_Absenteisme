import React, { useState } from 'react';
import './Attendance.css';

const Attendance = () => {
  // Données initiales des étudiants (identiques à la maquette)
  const initialStudents = [
    {
      id: 1,
      name: 'Ahmed Ben Ali',
      initials: 'AB',
      studentId: '20210245',
      rate: '94.5%',
      status: 'present', // 'present', 'absent', 'retard'
    },
    {
      id: 2,
      name: 'Salma Khalil',
      initials: 'SK',
      studentId: '20210312',
      rate: '87.2%',
      status: 'absent',
    },
    {
      id: 3,
      name: 'Mohamed Hamza',
      initials: 'MH',
      studentId: '20210198',
      rate: '91.0%',
      status: 'retard',
    },
    {
      id: 4,
      name: 'Leila Mansouri',
      initials: 'LM',
      studentId: '20210267',
      rate: '96.8%',
      status: 'present',
    },
    {
      id: 5,
      name: 'Yassine Trabelsi',
      initials: 'YT',
      studentId: '20210189',
      rate: '88.5%',
      status: 'present',
    },
  ];

  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les étudiants en fonction de la recherche
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  // Calcul des statistiques
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const retardCount = students.filter(s => s.status === 'retard').length;

  // Mettre à jour le statut d'un étudiant
  const updateStatus = (studentId, newStatus) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, status: newStatus }
          : student
      )
    );
  };

  // Actions groupées
  const setAllPresent = () => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({ ...student, status: 'present' }))
    );
  };

  const setAllAbsent = () => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({ ...student, status: 'absent' }))
    );
  };

  // Gestionnaires d'événements
  const handleBack = () => {
    console.log('Retour au tableau de bord');
    // À connecter avec react-router ou navigation
  };

  const handleNote = (student) => {
    console.log(`Ajouter une note pour ${student.name}`);
    // Ouvrir un modal, etc.
  };

  const handleSave = () => {
    console.log('Enregistrer l\'appel', students);
    // Appel API pour sauvegarder les présences
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>

      <div className="container">
        {/* Back button */}
        <div className="back-btn" onClick={handleBack}>
          ← Retour au tableau de bord
        </div>

        {/* Session Info */}
        <div className="session-card">
          <div className="session-title">
            Algorithmique Avancée - Travaux Pratiques
          </div>
          <div className="session-details">
            <div className="session-detail">
              <div className="detail-icon">📅</div>
              <div className="detail-text">
                <div className="detail-label">Date</div>
                <div className="detail-value">
                  23 Mars 2026, 10:00 - 12:00
                </div>
              </div>
            </div>
            <div className="session-detail">
              <div className="detail-icon">👥</div>
              <div className="detail-text">
                <div className="detail-label">Groupe</div>
                <div className="detail-value">2A-INFO - Salle B204</div>
              </div>
            </div>
            <div className="session-detail">
              <div className="detail-icon">🎓</div>
              <div className="detail-text">
                <div className="detail-label">Total</div>
                <div className="detail-value">
                  {students.length} étudiants inscrits
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bulk-actions">
            <button className="btn btn-success" onClick={setAllPresent}>
              ✓ Tous présents
            </button>
            <button className="btn btn-danger" onClick={setAllAbsent}>
              ✗ Tous absents
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`student-card ${student.status}`}
            >
              <div className="student-avatar">{student.initials}</div>
              <div className="student-info">
                <h4>{student.name}</h4>
                <div className="student-meta">
                  <span>📋 {student.studentId}</span>
                  <span>📊 Taux: {student.rate}</span>
                </div>
              </div>
              <div className="status-badges">
                <button
                  className={`status-btn ${
                    student.status === 'present' ? 'active-present' : ''
                  }`}
                  onClick={() => updateStatus(student.id, 'present')}
                >
                  ✓
                </button>
                <button
                  className={`status-btn ${
                    student.status === 'absent' ? 'active-absent' : ''
                  }`}
                  onClick={() => updateStatus(student.id, 'absent')}
                >
                  ✗
                </button>
                <button
                  className={`status-btn ${
                    student.status === 'retard' ? 'active-retard' : ''
                  }`}
                  onClick={() => updateStatus(student.id, 'retard')}
                >
                  ⏰
                </button>
              </div>
              <button
                className="note-btn"
                onClick={() => handleNote(student)}
              >
                📝
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="summary-footer">
          <div className="summary-stats">
            <div className="summary-item">
              <div className="summary-value green">{presentCount}</div>
              <div className="summary-label">Présents</div>
            </div>
            <div className="summary-item">
              <div className="summary-value red">{absentCount}</div>
              <div className="summary-label">Absents</div>
            </div>
            <div className="summary-item">
              <div className="summary-value orange">{retardCount}</div>
              <div className="summary-label">Retards</div>
            </div>
          </div>
          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer l'appel
          </button>
        </div>
      </div>
    </>
  );
};

export default Attendance;