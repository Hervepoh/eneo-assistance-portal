import React, { useState } from 'react';
import { Save, Send, FileText, Calendar } from 'lucide-react';
import { useDemandes } from '../../context/DemandesContext';
import { Demande } from '../../types';

export function NouvelleDemande() {
  const { creerDemande } = useDemandes();
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'technique' as Demande['categorie'],
    priorite: 'normale' as Demande['priorite'],
    dateEcheance: '',
    fichiers: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, action: 'brouillon' | 'soumettre') => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nouvelleDemande = {
        ...formData,
        statut: action === 'brouillon' ? 'brouillon' as const : 'soumise' as const,
        dateEcheance: formData.dateEcheance ? new Date(formData.dateEcheance) : undefined
      };

      creerDemande(nouvelleDemande);

      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        categorie: 'technique',
        priorite: 'normale',
        dateEcheance: '',
        fichiers: []
      });

      alert(`Demande ${action === 'brouillon' ? 'sauvegardée en brouillon' : 'soumise'} avec succès !`);
    } catch (error) {
      alert('Erreur lors de la création de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande d'assistance</h2>
        <p className="text-gray-600 mt-1">Décrivez votre problème ou votre besoin d'assistance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la demande *
            </label>
            <input
              id="titre"
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Résumez votre demande en quelques mots"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Décrivez votre problème ou votre besoin en détail. Plus vous donnerez d'informations, plus nous pourrons vous aider efficacement."
              required
            />
          </div>

          {/* Catégorie et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="categorie"
                value={formData.categorie}
                onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value as Demande['categorie'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="technique">Technique</option>
                <option value="administrative">Administrative</option>
                <option value="financiere">Financière</option>
                <option value="rh">Ressources Humaines</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                id="priorite"
                value={formData.priorite}
                onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as Demande['priorite'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance */}
          <div>
            <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700 mb-2">
              Date d'échéance souhaitée
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="dateEcheance"
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData(prev => ({ ...prev, dateEcheance: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Zone de fichiers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces jointes
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Glissez-déposez vos fichiers ici ou{' '}
                <button type="button" className="text-blue-600 hover:text-blue-500">
                  parcourez
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word, Excel, images jusqu'à 10MB
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'brouillon')}
              disabled={isSubmitting || !formData.titre.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder en brouillon</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'soumettre')}
              disabled={isSubmitting || !formData.titre.trim() || !formData.description.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Soumettre la demande</span>
            </button>
          </div>
        </form>
      </div>

      {/* Aide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Conseils pour une demande efficace :</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Soyez précis dans le titre de votre demande</li>
          <li>Décrivez les étapes qui ont mené au problème</li>
          <li>Mentionnez les messages d'erreur exacts si applicable</li>
          <li>Joignez des captures d'écran si nécessaire</li>
          <li>Indiquez l'urgence réelle de votre demande</li>
        </ul>
      </div>
    </div>
  );
}