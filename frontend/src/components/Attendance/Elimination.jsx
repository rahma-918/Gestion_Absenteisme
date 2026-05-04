import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Elimination.css';

const Eliminations = () => {
  const [activeTab, setActiveTab] = useState('en-cours');
  const [showModal, setShowModal] = useState(false);
  const [selectedElimination, setSelectedElimination] = useState(null);
  const [eliminations, setEliminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [motif, setMotif] = useState('');

  const fetchEliminations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/eliminations/?statut=${activeTab === 'en-cours' ? 'en_cours' : 'confirmee'}`);
      setEliminations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEliminations();
  }, [activeTab]);

  const handleDetecter = async () => {
    setDetecting(true);
    try {
      const response = await axios.post('/api/admin/eliminations/detecter/');
      alert(response.data.message);
      fetchEliminations();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la détection');
    } finally {
      setDetecting(false);
    }
  };

  const handleNotifier = async (eliminationId, etudiantNom) => {
  if (window.confirm(`Envoyer une notification par email à ${etudiantNom} ?`)) {
    try {
      await axios.post(`/api/admin/eliminations/${eliminationId}/notifier/`);
      alert('Notification envoyée avec succès');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'envoi');
    }
  }
};

  const handleMarquerElimine = (elim) => {
    setSelectedElimination(elim);
    setMotif(elim.motif || 'Dépassement du seuil d\'absence réglementaire');
    setShowModal(true);
  };

  const handleConfirmElimination = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin/eliminations/${selectedElimination.id}/confirmer/`, { motif });
      alert('Élimination confirmée');
      setShowModal(false);
      fetchEliminations();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la confirmation');
    }
  };

  const handleAnnulerElimination = async (id) => {
    if (window.confirm('Voulez-vous vraiment annuler cette élimination ?')) {
      try {
        await axios.post(`/api/admin/eliminations/${id}/annuler/`);
        alert('Élimination annulée');
        fetchEliminations();
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  const enCours = eliminations.filter(e => e.statut === 'en_cours');
  const confirmees = eliminations.filter(e => e.statut === 'confirmee');
  const dataToShow = activeTab === 'en-cours' ? enCours : confirmees;

  const getStatutBadge = (statut) => {
    if (statut === 'en_cours') return { class: 'warning', text: '⏳ En cours', icon: '⏳' };
    return { class: 'confirmed', text: '✓ Confirmée', icon: '✓' };
  };

  return (
    <div className="container">
      <h1 className="page-title">🚫 Gestion des Éliminations</h1>
      <p className="page-subtitle">Suivi et gestion des éliminations pour absentéisme</p>

      <div className="elim-stats">
        <div className="elim-stat-card">
          <div className="stat-value">{enCours.length}</div>
          <div className="stat-label">En cours de traitement</div>
        </div>
        <div className="elim-stat-card">
          <div className="stat-value">{confirmees.length}</div>
          <div className="stat-label">Confirmées ce semestre</div>
        </div>
        <button className="elim-stat-card" onClick={handleDetecter} disabled={detecting} style={{ cursor: 'pointer' }}>
          <div className="stat-value">🔄</div>
          <div className="stat-label">{detecting ? 'Détection...' : 'Détecter nouvelles éliminations'}</div>
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'en-cours' ? 'active' : ''}`} onClick={() => setActiveTab('en-cours')}>
          En cours de traitement
          {enCours.length > 0 && <span className="tab-badge">{enCours.length}</span>}
        </button>
        <button className={`tab ${activeTab === 'confirmees' ? 'active' : ''}`} onClick={() => setActiveTab('confirmees')}>
          Confirmées ({confirmees.length})
        </button>
      </div>

      <div className="eliminations-list">
        {dataToShow.map((elim) => {
          const badge = getStatutBadge(elim.statut);
          const isEnCours = elim.statut === 'en_cours';
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
                {isEnCours && <span className={`status-badge ${badge.class}`}>{badge.text}</span>}
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
                      <div className="detail-value">{elim.nbAbsences} / {elim.seuil}</div>
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
                      <div className="detail-value">{isEnCours ? elim.dateDetection : elim.dateElimination}</div>
                      <div className="detail-label">{isEnCours ? 'Détecté le' : 'Éliminé le'}</div>
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
                    <button className="btn-secondary" onClick={() => handleNotifier(elim.id, elim.etudiant.nom)}>
  📧 Notifier l'étudiant
</button>
                    <button className="btn-danger" onClick={() => handleMarquerElimine(elim)}>🚫 Marquer comme éliminé</button>
                  </>
                ) : (
                  <>
                    <button className="btn-warning" onClick={() => handleAnnulerElimination(elim.id)}>↺ Annuler l'élimination</button>
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

      {/* Modal de confirmation */}
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
                <div><strong>Attention !</strong><p>Cette action éliminera définitivement l'étudiant de la matière.</p></div>
              </div>
              <div className="elimination-summary">
                <h4>Détails de l'élimination</h4>
                <div className="summary-item"><span>Étudiant :</span><strong>{selectedElimination?.etudiant.nom} ({selectedElimination?.etudiant.numero})</strong></div>
                <div className="summary-item"><span>Matière :</span><strong>{selectedElimination?.matiere}</strong></div>
                <div className="summary-item"><span>Absences :</span><strong className="critical-text">{selectedElimination?.nbAbsences} / {selectedElimination?.seuil}</strong></div>
              </div>
              <form onSubmit={handleConfirmElimination}>
                <div className="form-group">
                  <label>Motif de l'élimination *</label>
                  <textarea rows="4" required value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Précisez le motif de l'élimination..."></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn-danger">Confirmer l'élimination</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eliminations;