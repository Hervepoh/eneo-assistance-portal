import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, AlertCircle, MessageSquare, History, Workflow } from 'lucide-react';
import { Demande } from '../../types';
import { useDemandes } from '../../context/DemandesContext';
import { WorkflowVisualization } from '../Workflow/WorkflowVisualization';
import { ValidationActions } from '../Workflow/ValidationActions';

interface DetailDemandeProps {
  demande: Demande;
  onBack: () => void;
}

export function DetailDemande({ demande, onBack }: DetailDemandeProps) {
  const { ajouterCommentaire } = useDemandes();
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'historique'>('details');
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [commentairePrive, setCommentairePrive] = useState(false);

  const handleAjouterCommentaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauCommentaire.trim()) {
      ajouterCommentaire(demande.id, nouveauCommentaire, commentairePrive);
      setNouveauCommentaire('');
      setCommentairePrive(false);
    }
  };

  const getStatutColor = (statut: Demande['statut']) => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-700',
      soumise: 'bg-blue-100 text-blue-700',
      verification: 'bg-yellow-100 text-yellow-700',
      validation_dec: 'bg-purple-100 text-purple-700',
      validation_bao: 'bg-orange-100 text-orange-700',
      approuvee: 'bg-green-100 text-green-700',
      assignee: 'bg-blue-100 text-blue-700',
      en_cours: 'bg-blue-100 text-blue-700',
      resolue: 'bg-green-100 text-green-700',
      fermee: 'bg-gray-100 text-gray-700',
      rejetee: 'bg-red-100 text-red-700'
    };
    return colors[statut] || 'bg-gray-100 text-gray-700';
  };

  const getPrioriteColor = (priorite: Demande['priorite']) => {
    const colors = {
      basse: 'text-green-600',
      normale: 'text-blue-600',
      haute: 'text-yellow-600',
      critique: 'text-red-600'
    };
    return colors[priorite] || 'text-gray-600';
  };

  const etapeEnCours = demande.workflow.find(step => step.statut === 'en_attente' || step.statut === 'en_cours');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{demande.titre}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{demande.demandeur.prenom} {demande.demandeur.nom}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(demande.dateCreation).toLocaleDateString('fr-FR')}</span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                {demande.categorie.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(demande.statut)}`}>
              <span className="capitalize">{demande.statut.replace('_', ' ')}</span>
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${getPrioriteColor(demande.priorite)}`}>
              {(demande.priorite === 'critique' || demande.priorite === 'haute') && <AlertCircle className="w-4 h-4" />}
              <span className="capitalize">{demande.priorite}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Workflow className="w-4 h-4" />
              <span>Workflow</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historique'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-1">
              <History className="w-4 h-4" />
              <span>Historique</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{demande.description}</p>
              </div>

              {/* Informations détaillées */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Demandeur</label>
                    <p className="text-gray-900">{demande.demandeur.prenom} {demande.demandeur.nom}</p>
                    <p className="text-sm text-gray-600">{demande.demandeur.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Département</label>
                    <p className="text-gray-900">{demande.demandeur.departement}</p>
                  </div>
                  {demande.verificateur && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vérificateur</label>
                      <p className="text-gray-900">{demande.verificateur.prenom} {demande.verificateur.nom}</p>
                    </div>
                  )}
                  {demande.technicien && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Technicien assigné</label>
                      <p className="text-gray-900">{demande.technicien.prenom} {demande.technicien.nom}</p>
                    </div>
                  )}
                  {demande.dateEcheance && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date d'échéance</label>
                      <p className="text-gray-900">{new Date(demande.dateEcheance).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Commentaires */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Commentaires ({demande.commentaires.length})</span>
                  </div>
                </h3>
                
                <div className="space-y-4 mb-6">
                  {demande.commentaires.map((commentaire) => (
                    <div key={commentaire.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {commentaire.auteur.prenom} {commentaire.auteur.nom}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(commentaire.dateCreation).toLocaleDateString('fr-FR')}
                          </span>
                          {commentaire.prive && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Privé
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{commentaire.contenu}</p>
                    </div>
                  ))}
                </div>

                {/* Formulaire d'ajout de commentaire */}
                <form onSubmit={handleAjouterCommentaire} className="space-y-4">
                  <textarea
                    value={nouveauCommentaire}
                    onChange={(e) => setNouveauCommentaire(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajouter un commentaire..."
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="prive"
                        checked={commentairePrive}
                        onChange={(e) => setCommentairePrive(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prive" className="ml-2 text-sm text-gray-700">
                        Commentaire privé
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={!nouveauCommentaire.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow de validation</h3>
              <WorkflowVisualization workflow={demande.workflow} />
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique des actions</h3>
              <div className="space-y-4">
                {demande.historique.map((action) => (
                  <div key={action.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{action.action}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span>{action.auteur.prenom} {action.auteur.nom}</span>
                        <span>•</span>
                        <span>{new Date(action.date).toLocaleDateString('fr-FR')} à {new Date(action.date).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      {action.details && (
                        <p className="text-sm text-gray-600 mt-1">{action.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions de validation */}
          {etapeEnCours && (
            <ValidationActions
              demande={demande}
              etape={etapeEnCours.etape}
            />
          )}

          {/* Workflow compact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression</h3>
            <WorkflowVisualization workflow={demande.workflow} compact />
          </div>
        </div>
      </div>
    </div>
  );
}