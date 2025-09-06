import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, User } from 'lucide-react';
import { useDemandes } from '../../context/DemandesContext';
import { useUtilisateurs } from '../../context/UtilisateursContext';
import { useAuth } from '../../context/AuthContext';
import { Demande, User as UserType } from '../../types';

interface ValidationActionsProps {
  demande: Demande;
  etape: string;
  onClose?: () => void;
}

export function ValidationActions({ demande, etape, onClose }: ValidationActionsProps) {
  const { validerEtape, assignerTechnicien, demarrerResolution, terminerResolution } = useDemandes();
  const { utilisateurs } = useUtilisateurs();
  const { user } = useAuth();
  const [commentaire, setCommentaire] = useState('');
  const [technicienSelectionne, setTechnicienSelectionne] = useState('');
  const [showCommentaire, setShowCommentaire] = useState(false);

  const techniciens = utilisateurs.filter(u => u.role === 'technicien' && u.actif);

  const handleApprouver = () => {
    validerEtape(demande.id, etape, true, commentaire);
    setCommentaire('');
    setShowCommentaire(false);
    onClose?.();
  };

  const handleRejeter = () => {
    if (!commentaire.trim()) {
      alert('Un commentaire est requis pour rejeter une demande');
      return;
    }
    validerEtape(demande.id, etape, false, commentaire);
    setCommentaire('');
    setShowCommentaire(false);
    onClose?.();
  };

  const handleAssigner = () => {
    if (!technicienSelectionne) {
      alert('Veuillez sélectionner un technicien');
      return;
    }
    const technicien = utilisateurs.find(u => u.id === technicienSelectionne);
    if (technicien) {
      assignerTechnicien(demande.id, technicien);
      setTechnicienSelectionne('');
      onClose?.();
    }
  };

  const handleDemarrerResolution = () => {
    demarrerResolution(demande.id);
    onClose?.();
  };

  const handleTerminerResolution = () => {
    terminerResolution(demande.id, commentaire);
    setCommentaire('');
    onClose?.();
  };

  const canValidate = () => {
    switch (etape) {
      case 'verification':
        return user?.role === 'verificateur' || user?.role === 'administrateur';
      case 'validation_dec':
        return user?.role === 'dec' || user?.role === 'administrateur';
      case 'validation_bao':
        return user?.role === 'bao' || user?.role === 'administrateur';
      case 'assignation':
        return user?.role === 'verificateur' || user?.role === 'administrateur';
      case 'resolution':
        return user?.role === 'technicien' || user?.role === 'administrateur' || demande.technicien?.id === user?.id;
      default:
        return false;
    }
  };

  if (!canValidate()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">Vous n'avez pas les permissions pour cette action</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Actions pour l'étape: {etape}
      </h3>

      {etape === 'assignation' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigner à un technicien
            </label>
            <select
              value={technicienSelectionne}
              onChange={(e) => setTechnicienSelectionne(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un technicien</option>
              {techniciens.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.prenom} {tech.nom} - {tech.poste}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssigner}
            disabled={!technicienSelectionne}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="w-4 h-4" />
            <span>Assigner</span>
          </button>
        </div>
      ) : etape === 'resolution' && demande.statut === 'assignee' ? (
        <div className="space-y-4">
          <button
            onClick={handleDemarrerResolution}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Démarrer la résolution</span>
          </button>
        </div>
      ) : etape === 'resolution' && demande.statut === 'en_cours' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire de résolution
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez la solution apportée..."
            />
          </div>
          <button
            onClick={handleTerminerResolution}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Marquer comme résolu</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {showCommentaire && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajoutez un commentaire..."
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleApprouver}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver</span>
            </button>

            <button
              onClick={handleRejeter}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
          </div>

          <button
            onClick={() => setShowCommentaire(!showCommentaire)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showCommentaire ? 'Masquer' : 'Ajouter'} un commentaire</span>
          </button>
        </div>
      )}
    </div>
  );
}