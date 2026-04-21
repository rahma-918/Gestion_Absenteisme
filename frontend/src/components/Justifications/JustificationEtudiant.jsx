import React, { useState } from 'react';
import './JustificationEtudiant.css';

const JustificatifsEtudiant = () => {
  const [activeTab, setActiveTab] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  // Absences non justifiées
  const absencesNonJustifiees = [
    {
      id: 1,
      matiere: 'Algorithmique Avancée',
      type: 'TP',
      date: '2026-03-23',
      heure: '10:00',
      enseignant: 'Dr. Ahmed Ben Salem'
    },
    {
      id: 2,
      matiere: 'Programmation Web',
      type: 'TD',
      date: '2026-03-20',
      heure: '08:00',
      enseignant: 'Dr. Leila Mansouri'
    }
  ];

  // Justificatifs déposés
  const justificatifs = [
    {
      id: 1,
      matiere: 'Base de Données',
      type: 'Cours',
      date: '2026-03-15',
      heure: '14:00',
      dateDepot: '2026-03-15',
      motif: 'Visite médicale urgente suite à un malaise',
      fichier: 'certificat_medical.pdf',
      statut: 'EN_ATTENTE',
      commentaire: null
    },
    {
      id: 2,
      matiere: 'Sécurité Informatique',
      type: 'TP',
      date: '2026-03-10',
      heure: '10:00',
      dateDepot: '2026-03-11',
      motif: 'Problème familial urgent',
      fichier: 'attestation.pdf',
      statut: 'VALIDE',
      commentaire: 'Justificatif accepté'
    },
    {
      id: 3,
      matiere: 'Réseaux',
      type: 'Cours',
      date: '2026-03-05',
      heure: '14:00',
      dateDepot: '2026-03-06',
      motif: 'Certificat médical insuffisant',
      fichier: 'justificatif.pdf',
      statut: 'REFUSE',
      commentaire: 'Le certificat ne couvre pas la date d\'absence'
    }
  ];

  const handleDeposerJustificatif = (absence) => {
    setSelectedAbsence(absence);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAbsence(null);
  };

  const handleSubmitJustificatif = (e) => {
    e.preventDefault();
    console.log('Justificatif soumis pour:', selectedAbsence);
    handleCloseModal();
  };

  const getStatutBadge = (statut) => {
    const badges = {
      EN_ATTENTE: { class: 'pending', text: '⏳ En attente', icon: '⏳' },
      VALIDE: { class: 'approved', text: '✓ Validé', icon: '✓' },
      REFUSE: { class: 'rejected', text: '✗ Refusé', icon: '✗' }
    };
    return badges[statut] || badges.EN_ATTENTE;
  };

  const filteredJustificatifs = activeTab === 'tous' 
    ? justificatifs 
    : justificatifs.filter(j => j.statut === activeTab);

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">Ahmed Ben Ali</div>
            <div className="user-role">Étudiant - 2A INFO • 20210245</div>
          </div>
          <div className="user-avatar">AB</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="page-title">📄 Mes Justificatifs</h1>
        <p className="page-subtitle">Gérer mes absences et justifications</p>

        {/* Absences non justifiées */}
        {absencesNonJustifiees.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h3 className="card-title">
                ⚠️ Absences à justifier ({absencesNonJustifiees.length})
              </h3>
            </div>
            <div className="absences-list">
              {absencesNonJustifiees.map((absence) => (
                <div className="absence-card" key={absence.id}>
                  <div className="absence-info">
                    <h4>{absence.matiere} - {absence.type}</h4>
                    <div className="absence-meta">
                      <span>📅 {absence.date} à {absence.heure}</span>
                      <span>👤 {absence.enseignant}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => handleDeposerJustificatif(absence)}
                  >
                    Déposer un justificatif
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'tous' ? 'active' : ''}`}
            onClick={() => setActiveTab('tous')}
          >
            Tous ({justificatifs.length})
          </button>
          <button 
            className={`tab ${activeTab === 'EN_ATTENTE' ? 'active' : ''}`}
            onClick={() => setActiveTab('EN_ATTENTE')}
          >
            En attente ({justificatifs.filter(j => j.statut === 'EN_ATTENTE').length})
          </button>
          <button 
            className={`tab ${activeTab === 'VALIDE' ? 'active' : ''}`}
            onClick={() => setActiveTab('VALIDE')}
          >
            Validés ({justificatifs.filter(j => j.statut === 'VALIDE').length})
          </button>
          <button 
            className={`tab ${activeTab === 'REFUSE' ? 'active' : ''}`}
            onClick={() => setActiveTab('REFUSE')}
          >
            Refusés ({justificatifs.filter(j => j.statut === 'REFUSE').length})
          </button>
        </div>

        {/* Justificatifs List */}
        <div className="justificatifs-list">
          {filteredJustificatifs.map((justif) => {
            const badge = getStatutBadge(justif.statut);
            return (
              <div className={`justificatif-card ${badge.class}`} key={justif.id}>
                <div className="justif-header">
                  <div>
                    <h4>{justif.matiere} - {justif.type}</h4>
                    <div className="justif-meta">
                      <span>📅 Absence du {justif.date} à {justif.heure}</span>
                      <span>📤 Déposé le {justif.dateDepot}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="justif-body">
                  <div className="justif-motif">
                    <strong>Motif :</strong>
                    <p>{justif.motif}</p>
                  </div>

                  <div className="justif-fichier">
                    <div className="fichier-icon">📄</div>
                    <div className="fichier-info">
                      <span className="fichier-nom">{justif.fichier}</span>
                      <span className="fichier-size">PDF Document</span>
                    </div>
                    <button className="btn-download">📥 Télécharger</button>
                  </div>

                  {justif.commentaire && (
                    <div className={`justif-commentaire ${badge.class}`}>
                      <strong>Commentaire de l'enseignant :</strong>
                      <p>{justif.commentaire}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Dépôt Justificatif */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Déposer un justificatif</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="absence-details">
                <h4>{selectedAbsence?.matiere} - {selectedAbsence?.type}</h4>
                <p>📅 {selectedAbsence?.date} à {selectedAbsence?.heure}</p>
              </div>

              <form onSubmit={handleSubmitJustificatif}>
                <div className="form-group">
                  <label>Motif de l'absence *</label>
                  <textarea 
                    rows="4" 
                    required
                    placeholder="Expliquez la raison de votre absence..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Document justificatif *</label>
                  <div className="file-upload">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    <p className="file-help">
                      Formats acceptés : PDF, JPG, PNG (Max 5 MB)
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Déposer le justificatif
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JustificatifsEtudiant;