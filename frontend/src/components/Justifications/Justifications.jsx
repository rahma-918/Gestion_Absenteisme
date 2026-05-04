import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Justifications.css';

const Justifications = () => {
  const [justifications, setJustifications] = useState([]);        // tous les justificatifs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('en_attente');
  const [processingId, setProcessingId] = useState(null);
  const [commentModal, setCommentModal] = useState({ show: false, justificatifId: null, action: null });

  // Récupérer TOUS les justificatifs de l’enseignant (sans filtre)
  const fetchJustificatifs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/enseignant/justificatifs/');
      setJustifications(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJustificatifs();
  }, []);

  const handleTabChange = (tab) => setActiveTab(tab);
  const handleApprove = (id) => setCommentModal({ show: true, justificatifId: id, action: 'approve' });
  const handleReject = (id) => setCommentModal({ show: true, justificatifId: id, action: 'reject' });

  const handleCommentSubmit = async (commentaire) => {
    const { justificatifId, action } = commentModal;
    setProcessingId(justificatifId);
    try {
      await axios.post(`/api/enseignant/justificatifs/${justificatifId}/traiter/`, {
        action: action,
        commentaire: commentaire
      });
      await fetchJustificatifs();            // rechargement complet après action
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors du traitement');
    } finally {
      setProcessingId(null);
      setCommentModal({ show: false, justificatifId: null, action: null });
    }
  };

  const handleDownload = (url, filename) => {
    if (url) window.open(`${axios.defaults.baseURL}/media/${url}`, '_blank');
  };

  // Calcul des compteurs sur la liste complète
  const counts = {
    en_attente: justifications.filter(j => j.status === 'en_attente').length,
    valide: justifications.filter(j => j.status === 'valide').length,
    refuse: justifications.filter(j => j.status === 'refuse').length,
  };

  // Filtrer les affichages selon l’onglet actif
  const filteredJustifications = justifications.filter(j => j.status === activeTab);

  const getStatusBadgeClass = (status) => {
    if (status === 'en_attente') return 'status-pending';
    if (status === 'valide') return 'status-approved';
    return 'status-rejected';
  };

  const getStatusText = (status) => {
    if (status === 'en_attente') return '⏳ En attente';
    if (status === 'valide') return '✓ Validé';
    return '✗ Refusé';
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
      </div>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📄 Justificatifs d'Absence</h1>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'en_attente' ? 'active' : ''}`} onClick={() => handleTabChange('en_attente')}>
            En attente {counts.en_attente > 0 && <span className="tab-badge">{counts.en_attente}</span>}
          </button>
          <button className={`tab ${activeTab === 'valide' ? 'active' : ''}`} onClick={() => handleTabChange('valide')}>
            Validés ({counts.valide})
          </button>
          <button className={`tab ${activeTab === 'refuse' ? 'active' : ''}`} onClick={() => handleTabChange('refuse')}>
            Refusés ({counts.refuse})
          </button>
        </div>

        <div className="justifications-list">
          {filteredJustifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <div className="empty-text">Aucun justificatif dans cet onglet</div>
            </div>
          ) : (
            filteredJustifications.map((j) => (
              <div key={j.id} className={`justification-card ${j.status === 'en_attente' ? 'pending' : ''}`}>
                <div className="justification-header">
                  <div className="student-info-block">
                    <div className="student-avatar">{j.initials}</div>
                    <div className="student-details">
                      <h4>{j.studentName}</h4>
                      <div className="student-meta">{j.studentId} • {j.group}</div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(j.status)}`}>{getStatusText(j.status)}</span>
                </div>

                <div className="justification-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div><div className="detail-label">Absence</div><div className="detail-value">{j.absenceDate}</div></div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">📚</div>
                      <div><div className="detail-label">Matière</div><div className="detail-value">{j.course}</div></div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">🕐</div>
                      <div><div className="detail-label">Déposé le</div><div className="detail-value">{j.submittedAt}</div></div>
                    </div>
                  </div>

                  <div className="justification-message">
                    <div className="message-label">Motif de l'absence</div>
                    <div className="message-text">{j.message}</div>
                  </div>

                  <div className="attached-document" onClick={() => handleDownload(j.document.url, j.document.name)}>
                    <div className="doc-icon">📄</div>
                    <div className="doc-info">
                      <div className="doc-name">{j.document.name}</div>
                      <div className="doc-size">{j.document.size}</div>
                    </div>
                    <button className="btn-download" onClick={(e) => { e.stopPropagation(); handleDownload(j.document.url, j.document.name); }}>
                      📥 Ouvrir
                    </button>
                  </div>
                </div>

                {j.status === 'en_attente' && (
                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={() => setCommentModal({ show: true, justificatifId: j.id, action: 'comment' })}>
                      💬 Ajouter un commentaire
                    </button>
                    <button className="btn btn-reject" onClick={() => handleReject(j.id)} disabled={processingId === j.id}>✗ Refuser</button>
                    <button className="btn btn-approve" onClick={() => handleApprove(j.id)} disabled={processingId === j.id}>✓ Valider</button>
                  </div>
                )}
                {j.status !== 'en_attente' && (
                  <div className="action-buttons">
                    <button className="btn btn-secondary" disabled>{j.status === 'valide' ? 'Déjà validé' : 'Déjà refusé'}</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de commentaire */}
      {commentModal.show && (
        <div className="modal-overlay" onClick={() => setCommentModal({ show: false, justificatifId: null, action: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{commentModal.action === 'approve' ? 'Valider le justificatif' : commentModal.action === 'reject' ? 'Refuser le justificatif' : 'Ajouter un commentaire'}</h3>
              <button className="modal-close" onClick={() => setCommentModal({ show: false, justificatifId: null, action: null })}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const comment = e.target.comment.value;
                handleCommentSubmit(comment);
              }}>
                <div className="form-group">
                  <label>Commentaire (optionnel)</label>
                  <textarea name="comment" rows="3" placeholder="Ajoutez un commentaire pour l'étudiant..."></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setCommentModal({ show: false, justificatifId: null, action: null })}>Annuler</button>
                  <button type="submit" className="btn-primary">Confirmer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Justifications;