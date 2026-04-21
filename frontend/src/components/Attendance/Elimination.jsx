import React, { useState } from 'react';
import './Elimination.css';

const Eliminations = () => {
  const [activeTab, setActiveTab] = useState('en-cours');
  const [showModal, setShowModal] = useState(false);
  const [selectedElimination, setSelectedElimination] = useState(null);

  // Éliminations en cours
  const eliminationsEnCours = [
    {
      id: 1,
      etudiant: {
        nom: 'Salma Khalil',
        numero: '20210312',
        photo: 'SK',
        departement: 'Informatique',
        groupe: '2A-INFO'
      },
      matiere: 'Algorithmique Avancée',
      code: 'INFO301',
      nbAbsences: 15,
      seuil: 10,
      tauxAbsence: 62.5,
      dateDetection: '2026-03-20',
      statut: 'EN_COURS'
    },
    {
      id: 2,
      etudiant: {
        nom: 'Omar Bouzid',
        numero: '20210401',
        photo: 'OB',
        departement: 'Informatique',
        groupe: '2A-INFO'
      },
      matiere: 'Base de Données',
      code: 'INFO302',
      nbAbsences: 13,
      seuil: 10,
      tauxAbsence: 65.0,
      dateDetection: '2026-03-18',
      statut: 'EN_COURS'
    }
  ];

  // Éliminations confirmées
  const eliminationsConfirmees = [
    {
      id: 3,
      etudiant: {
        nom: 'Mehdi Khelifi',
        numero: '20210287',
        photo: 'MK',
        departement: 'Génie Civil',
        groupe: '3A-GC'
      },
      matiere: 'Résistance des Matériaux',
      code: 'GC401',
      nbAbsences: 12,
      seuil: 10,
      dateElimination: '2026-03-15',
      motif: 'Dépassement du seuil d\'absence réglementaire'
    }
  ];

  const handleMarquerElimine = (elimination) => {
    setSelectedElimination(elimination);
    setShowModal(true);
  };

  const handleAnnulerElimination = (id) => {
    console.log('Annuler élimination:', id);
  };

  const handleConfirmElimination = (e) => {
    e.preventDefault();
    console.log('Confirmation élimination:', selectedElimination);
    setShowModal(false);
  };

  const getStatutBadge = (statut) => {
    if (statut === 'EN_COURS') {
      return { class: 'warning', text: '⏳ En cours', icon: '⏳' };
    }
    return { class: 'confirmed', text: '✓ Confirmée', icon: '✓' };
  };

  const dataToShow = activeTab === 'en-cours' ? eliminationsEnCours : eliminationsConfirmees;

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">Mme. Fatma Mansouri</div>
            <div className="user-role">Agent Administratif - Scolarité</div>
          </div>
          <div className="user-avatar admin">FM</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="page-title">🚫 Gestion des Éliminations</h1>
        <p className="page-subtitle">Suivi et gestion des éliminations pour absentéisme</p>

        {/* Stats rapides */}
        <div className="elim-stats">
          <div className="elim-stat-card">
            <div className="stat-value">{eliminationsEnCours.length}</div>
            <div className="stat-label">En cours de traitement</div>
          </div>
          <div className="elim-stat-card">
            <div className="stat-value">{eliminationsConfirmees.length}</div>
            <div className="stat-label">Confirmées ce semestre</div>
          </div>
          <div className="elim-stat-card">
            <div className="stat-value">67</div>
            <div className="stat-label">Total année académique</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'en-cours' ? 'active' : ''}`}
            onClick={() => setActiveTab('en-cours')}
          >
            En cours de traitement
            {eliminationsEnCours.length > 0 && (
              <span className="tab-badge">{eliminationsEnCours.length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'confirmees' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmees')}
          >
            Confirmées ({eliminationsConfirmees.length})
          </button>
        </div>

        {/* Eliminations List */}
        <div className="eliminations-list">
          {dataToShow.map((elim) => {
            const badge = getStatutBadge(elim.statut || 'CONFIRMEE');
            const isEnCours = activeTab === 'en-cours';

            return (
              <div className={`elimination-card ${badge.class}`} key={elim.id}>
                <div className="elim-header">
                  <div className="etudiant-info">
                    <div className="etudiant-avatar">{elim.etudiant.photo}</div>
                    <div className="etudiant-details">
                      <h4>{elim.etudiant.nom}</h4>
                      <div className="etudiant-meta">
                        <span>{elim.etudiant.numero}</span>
                        <span>•</span>
                        <span>{elim.etudiant.groupe}</span>
                        <span>•</span>
                        <span>{elim.etudiant.departement}</span>
                      </div>
                    </div>
                  </div>
                  {isEnCours && (
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  )}
                </div>

                <div className="elim-body">
                  <div className="matiere-section">
                    <div className="matiere-header">
                      <h5>{elim.matiere}</h5>
                      <span className="matiere-code">{elim.code}</span>
                    </div>
                  </div>

                  <div className="absences-details">
                    <div className="detail-box critical">
                      <div className="detail-icon">🚫</div>
                      <div>
                        <div className="detail-value">
                          {elim.nbAbsences} / {elim.seuil}
                        </div>
                        <div className="detail-label">Absences</div>
                      </div>
                    </div>

                    {isEnCours && (
                      <div className="detail-box">
                        <div className="detail-icon">📊</div>
                        <div>
                          <div className="detail-value">{elim.tauxAbsence}%</div>
                          <div className="detail-label">Taux d'absence</div>
                        </div>
                      </div>
                    )}

                    <div className="detail-box">
                      <div className="detail-icon">📅</div>
                      <div>
                        <div className="detail-value">
                          {isEnCours ? elim.dateDetection : elim.dateElimination}
                        </div>
                        <div className="detail-label">
                          {isEnCours ? 'Détecté le' : 'Éliminé le'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isEnCours && elim.motif && (
                    <div className="motif-box">
                      <strong>Motif :</strong>
                      <p>{elim.motif}</p>
                    </div>
                  )}
                </div>

                <div className="elim-actions">
                  {isEnCours ? (
                    <>
                      <button className="btn-secondary">
                        📧 Notifier l'étudiant
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleMarquerElimine(elim)}
                      >
                        🚫 Marquer comme éliminé
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary">
                        📄 Télécharger PV
                      </button>
                      <button 
                        className="btn-warning"
                        onClick={() => handleAnnulerElimination(elim.id)}
                      >
                        ↺ Annuler l'élimination
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {dataToShow.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>Aucune élimination {activeTab === 'en-cours' ? 'en cours' : 'confirmée'}</h3>
            <p>Tout est en ordre pour le moment</p>
          </div>
        )}
      </div>

      {/* Modal Confirmation */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚫 Confirmer l'élimination</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="warning-box">
                <div className="warning-icon">⚠️</div>
                <div>
                  <strong>Attention !</strong>
                  <p>Cette action éliminera définitivement l'étudiant de la matière.</p>
                </div>
              </div>

              <div className="elimination-summary">
                <h4>Détails de l'élimination</h4>
                <div className="summary-item">
                  <span>Étudiant :</span>
                  <strong>{selectedElimination?.etudiant.nom} ({selectedElimination?.etudiant.numero})</strong>
                </div>
                <div className="summary-item">
                  <span>Matière :</span>
                  <strong>{selectedElimination?.matiere}</strong>
                </div>
                <div className="summary-item">
                  <span>Absences :</span>
                  <strong className="critical-text">
                    {selectedElimination?.nbAbsences} / {selectedElimination?.seuil}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleConfirmElimination}>
                <div className="form-group">
                  <label>Motif de l'élimination *</label>
                  <textarea 
                    rows="4" 
                    required
                    defaultValue="Dépassement du seuil d'absence réglementaire"
                    placeholder="Précisez le motif de l'élimination..."
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-danger">
                    Confirmer l'élimination
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

export default Eliminations;