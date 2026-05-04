import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './JustificationEtudiant.css';

const JustificatifsEtudiant = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [absencesNonJustifiees, setAbsencesNonJustifiees] = useState([]);
  const [justificatifs, setJustificatifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ motif: '', fichier: null });

  // Charger les données
  const fetchData = async () => {
    try {
      const [absencesRes, justifsRes] = await Promise.all([
        axios.get('/api/etudiant/absences-non-justifiees/'),
        axios.get('/api/etudiant/justificatifs/')
      ]);
      setAbsencesNonJustifiees(absencesRes.data);
      setJustificatifs(justifsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposerJustificatif = (absence) => {
    setSelectedAbsence(absence);
    setFormData({ motif: '', fichier: null });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAbsence(null);
    setFormData({ motif: '', fichier: null });
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'fichier') {
      setFormData({ ...formData, fichier: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmitJustificatif = async (e) => {
    e.preventDefault();
    if (!formData.motif || !formData.fichier) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('presence_id', selectedAbsence.id);
    data.append('motif', formData.motif);
    data.append('fichier', formData.fichier);

    try {
      await axios.post('/api/etudiant/justificatifs/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleCloseModal();
      fetchData(); // Recharger les listes
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors du dépôt');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      EN_ATTENTE: { class: 'pending', text: '⏳ En attente' },
      VALIDE: { class: 'approved', text: '✓ Validé' },
      REFUSE: { class: 'rejected', text: '✗ Refusé' }
    };
    return badges[statut] || badges.EN_ATTENTE;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR');
  };

  const filteredJustificatifs = activeTab === 'tous'
    ? justificatifs
    : justificatifs.filter(j => j.statut === activeTab);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  return (
    <>
      <div className="header">
        <div className="logo">📚 GestionAbsence</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user?.nom_complet || user?.email}</div>
            <div className="user-role">Étudiant</div>
          </div>
          <div className="user-avatar">{(user?.nom_complet?.charAt(0) || user?.email?.charAt(0)).toUpperCase()}</div>
        </div>
      </div>

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
                      <span>📅 {formatDate(absence.date)} à {absence.heure}</span>
                      <span>👤 {absence.enseignant}</span>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => handleDeposerJustificatif(absence)}>
                    Déposer un justificatif
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'tous' ? 'active' : ''}`} onClick={() => setActiveTab('tous')}>
            Tous ({justificatifs.length})
          </button>
          <button className={`tab ${activeTab === 'EN_ATTENTE' ? 'active' : ''}`} onClick={() => setActiveTab('EN_ATTENTE')}>
            En attente ({justificatifs.filter(j => j.statut === 'EN_ATTENTE').length})
          </button>
          <button className={`tab ${activeTab === 'VALIDE' ? 'active' : ''}`} onClick={() => setActiveTab('VALIDE')}>
            Validés ({justificatifs.filter(j => j.statut === 'VALIDE').length})
          </button>
          <button className={`tab ${activeTab === 'REFUSE' ? 'active' : ''}`} onClick={() => setActiveTab('REFUSE')}>
            Refusés ({justificatifs.filter(j => j.statut === 'REFUSE').length})
          </button>
        </div>

        {/* Liste des justificatifs */}
        <div className="justificatifs-list">
          {filteredJustificatifs.map((justif) => {
            const badge = getStatutBadge(justif.statut);
            return (
              <div className={`justificatif-card ${badge.class}`} key={justif.id}>
                <div className="justif-header">
                  <div>
                    <h4>{justif.matiere} - {justif.type}</h4>
                    <div className="justif-meta">
                      <span>📅 Absence du {formatDate(justif.date)} à {justif.heure}</span>
                      <span>📤 Déposé le {formatDate(justif.dateDepot)}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                </div>
                <div className="justif-body">
                  <div className="justif-motif">
                    <strong>Motif :</strong>
                    <p>{justif.motif}</p>
                  </div>
                  {justif.fichier && (
                    <div className="justif-fichier">
                      <div className="fichier-icon">📄</div>
                      <div className="fichier-info">
                        <span className="fichier-nom">{justif.fichier.split('/').pop()}</span>
                        <span className="fichier-size">Document</span>
                      </div>
                      <a href={`${axios.defaults.baseURL}/media/${justif.fichier}`} download className="btn-download" target="_blank" rel="noopener noreferrer">
                      📄 Ouvrir le fichier
                      </a>
                    </div>
                  )}
                  {justif.commentaire && justif.commentaire !== justif.motif && (
                    <div className={`justif-commentaire ${badge.class}`}>
                      <strong>Commentaire :</strong>
                      <p>{justif.commentaire}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredJustificatifs.length === 0 && (
            <div className="empty-state">Aucun justificatif dans cette catégorie.</div>
          )}
        </div>
      </div>

      {/* Modal de dépôt */}
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
                <p>📅 {formatDate(selectedAbsence?.date)} à {selectedAbsence?.heure}</p>
              </div>
              <form onSubmit={handleSubmitJustificatif}>
                <div className="form-group">
                  <label>Motif de l'absence *</label>
                  <textarea
                    name="motif"
                    rows="4"
                    required
                    value={formData.motif}
                    onChange={handleInputChange}
                    placeholder="Expliquez la raison de votre absence..."
                  />
                </div>
                <div className="form-group">
                  <label>Document justificatif *</label>
                  <div className="file-upload">
                    <input type="file" name="fichier" accept=".pdf,.jpg,.jpeg,.png" onChange={handleInputChange} required />
                    <p className="file-help">Formats acceptés : PDF, JPG, PNG (Max 5 MB)</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Envoi...' : 'Déposer le justificatif'}
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