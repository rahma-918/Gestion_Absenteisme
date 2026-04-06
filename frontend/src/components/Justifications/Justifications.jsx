import React, { useState } from 'react';
import './Justifications.css';

const Justifications = () => {
  // Données initiales des justificatifs
  const initialJustifications = [
    {
      id: 1,
      studentName: 'Salma Khalil',
      studentId: '20210312',
      group: 'Groupe 2A-INFO',
      initials: 'SK',
      status: 'pending', // pending, approved, rejected
      absenceDate: '23 Mars 2026, 10:00',
      course: 'Algorithmique Avancée - TP',
      submittedAt: '23 Mars, 15:30',
      message:
        "Bonjour Professeur, je vous prie de bien vouloir justifier mon absence à la séance de TP d'aujourd'hui. J'étais malade avec de la fièvre et je n'ai pas pu me présenter. Vous trouverez ci-joint le certificat médical.",
      document: {
        name: 'Certificat_Medical_Khalil.pdf',
        size: '245 KB',
        type: 'PDF Document',
      },
    },
    {
      id: 2,
      studentName: 'Mohamed Hamza',
      studentId: '20210198',
      group: 'Groupe 2A-INFO',
      initials: 'MH',
      status: 'pending',
      absenceDate: '22 Mars 2026, 14:00',
      course: 'Base de Données - Cours',
      submittedAt: '22 Mars, 19:45',
      message:
        "Cher Professeur, j'ai été absent au cours de Base de Données en raison d'un rendez-vous médical urgent. Je vous prie de trouver ci-joint l'attestation du cabinet médical.",
      document: {
        name: 'Attestation_Medical.pdf',
        size: '189 KB',
        type: 'PDF Document',
      },
    },
    {
      id: 3,
      studentName: 'Ines Gharbi',
      studentId: '20210356',
      group: 'Groupe 1A-INFO',
      initials: 'IG',
      status: 'pending',
      absenceDate: '20 Mars 2026, 08:00',
      course: 'Programmation Web - TD',
      submittedAt: '21 Mars, 10:15',
      message:
        "Bonjour Professeur, suite à un problème familial urgent, je n'ai pas pu assister au TD de Programmation Web. Vous trouverez ci-joint une attestation justifiant mon absence.",
      document: {
        name: 'Justificatif_Gharbi.pdf',
        size: '156 KB',
        type: 'PDF Document',
      },
    },
  ];

  // État pour les justificatifs
  const [justifications, setJustifications] = useState(initialJustifications);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'

  // Fonction pour obtenir les compteurs
  const getCounts = () => {
    const pending = justifications.filter(j => j.status === 'pending').length;
    const approved = justifications.filter(j => j.status === 'approved').length;
    const rejected = justifications.filter(j => j.status === 'rejected').length;
    return { pending, approved, rejected };
  };

  const counts = getCounts();

  // Filtrer selon l'onglet actif
  const filteredJustifications = justifications.filter(j => j.status === activeTab);

  // Gestionnaires
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleApprove = (id) => {
    setJustifications(prev =>
      prev.map(j => (j.id === id ? { ...j, status: 'approved' } : j))
    );
    console.log(`Justificatif ${id} approuvé`);
  };

  const handleReject = (id) => {
    setJustifications(prev =>
      prev.map(j => (j.id === id ? { ...j, status: 'rejected' } : j))
    );
    console.log(`Justificatif ${id} refusé`);
  };

  const handleComment = (id) => {
    console.log(`Ajouter un commentaire pour le justificatif ${id}`);
    // Ici ouvrir un modal ou une zone de texte
  };

  const handleDownload = (docName) => {
    console.log(`Télécharger ${docName}`);
    // Implémenter le téléchargement réel
  };

  // Obtenir la classe de statut pour le badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ En attente';
      case 'approved': return '✓ Validé';
      case 'rejected': return '✗ Refusé';
      default: return '';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📄 Justificatifs d'Absence</h1>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            En attente
            {counts.pending > 0 && (
              <span className="tab-badge">{counts.pending}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => handleTabChange('approved')}
          >
            Validés ({counts.approved})
          </button>
          <button
            className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => handleTabChange('rejected')}
          >
            Refusés ({counts.rejected})
          </button>
        </div>

        {/* Justifications List */}
        <div className="justifications-list">
          {filteredJustifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <div className="empty-text">Aucun justificatif dans cet onglet</div>
            </div>
          ) : (
            filteredJustifications.map((j) => (
              <div
                key={j.id}
                className={`justification-card ${
                  j.status === 'pending' ? 'pending' : ''
                }`}
              >
                <div className="justification-header">
                  <div className="student-info-block">
                    <div className="student-avatar">{j.initials}</div>
                    <div className="student-details">
                      <h4>{j.studentName}</h4>
                      <div className="student-meta">
                        {j.studentId} • {j.group}
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(j.status)}`}>
                    {getStatusText(j.status)}
                  </span>
                </div>

                <div className="justification-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div>
                        <div className="detail-label">Absence</div>
                        <div className="detail-value">{j.absenceDate}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">📚</div>
                      <div>
                        <div className="detail-label">Matière</div>
                        <div className="detail-value">{j.course}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">🕐</div>
                      <div>
                        <div className="detail-label">Déposé le</div>
                        <div className="detail-value">{j.submittedAt}</div>
                      </div>
                    </div>
                  </div>

                  <div className="justification-message">
                    <div className="message-label">Motif de l'absence</div>
                    <div className="message-text">{j.message}</div>
                  </div>

                  <div
                    className="attached-document"
                    onClick={() => handleDownload(j.document.name)}
                  >
                    <div className="doc-icon">📄</div>
                    <div className="doc-info">
                      <div className="doc-name">{j.document.name}</div>
                      <div className="doc-size">
                        {j.document.size} • {j.document.type}
                      </div>
                    </div>
                    <button
                      className="btn-download"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(j.document.name);
                      }}
                    >
                      📥 Télécharger
                    </button>
                  </div>
                </div>

                {/* Boutons d'action (uniquement pour les en attente) */}
                {j.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleComment(j.id)}
                    >
                      💬 Ajouter un commentaire
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleReject(j.id)}
                    >
                      ✗ Refuser
                    </button>
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(j.id)}
                    >
                      ✓ Valider
                    </button>
                  </div>
                )}

                {/* Pour les validés/refusés, on peut afficher un bouton "Détails" si souhaité */}
                {j.status !== 'pending' && (
                  <div className="action-buttons">
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      Aucune action disponible
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Justifications;