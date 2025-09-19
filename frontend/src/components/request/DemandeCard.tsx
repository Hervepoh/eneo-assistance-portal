import { Calendar, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Demande } from '../../types';

interface DemandeCardProps {
  demande?: Demande;
  compact?: boolean;
  onClick?: () => void;
  mode?: string;
}

export function DemandeCard({ demande, compact = false, onClick }: DemandeCardProps) {
  const getStatutColor = (statut: Demande['statut']) => {
    const colors = {
      brouillon: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      soumise: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      verification: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      validation_dec: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      validation_bao: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      en_validation: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      approuvee: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      assignee: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      en_cours: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      resolue: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      fermee: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      rejetee: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
    };
    return colors[statut] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const getPrioriteColor = (priorite: Demande['priorite']) => {
    const colors = {
      basse: 'text-green-600 dark:text-green-400',
      normale: 'text-blue-600 dark:text-blue-400',
      haute: 'text-yellow-600 dark:text-yellow-400',
      critique: 'text-red-600 dark:text-red-400'
    };
    return colors[priorite] || 'text-gray-600 dark:text-gray-400';
  };

  const getPrioriteIcon = (priorite: Demande['priorite']) => {
    if (priorite === 'critique' || priorite === 'haute') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  const getStatutIcon = (statut: Demande['statut']) => {
    const icons = {
      brouillon: <Clock className="w-4 h-4" />,
      DRAFT: <Clock className="w-4 h-4" />,
      soumise: <Clock className="w-4 h-4" />,
      verification: <Clock className="w-4 h-4" />,
      validation_dec: <Clock className="w-4 h-4" />,
      validation_bao: <Clock className="w-4 h-4" />,
      en_validation: <Clock className="w-4 h-4" />,
      approuvee: <CheckCircle className="w-4 h-4" />,
      assignee: <Clock className="w-4 h-4" />,
      en_cours: <Clock className="w-4 h-4" />,
      resolue: <CheckCircle className="w-4 h-4" />,
      fermee: <CheckCircle className="w-4 h-4" />,
      rejetee: <AlertCircle className="w-4 h-4" />
    };
    return icons[statut];
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
              {demande?.titre}
            </h3>
            <div className={`flex items-center space-x-1 ${getPrioriteColor(demande?.priorite || 'normale')}`}>
              {getPrioriteIcon(demande?.priorite || 'normale')}
            </div>
          </div>
          
          {!compact && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{demande?.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{demande?.requestor?.prenom} {demande?.requestor?.nom}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{demande?.createdAt ? new Date(demande.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
              {demande?.categorie?.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(demande?.statut || 'brouillon')}`}>
            {getStatutIcon(demande?.statut || 'brouillon')}
            <span className="capitalize">{demande?.statut?.replace('_', ' ') || 'brouillon'}</span>
          </div>
          
          <div className={`flex items-center space-x-1 text-xs font-medium ${getPrioriteColor(demande?.priorite || 'normale')}`}>
            <span className="capitalize">{demande?.priorite || 'normale'}</span>
          </div>
        </div>
      </div>

      {demande?.dateEcheance && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Échéance: {new Date(demande.dateEcheance).toLocaleDateString('fr-FR')}</span>
          </div>
          
          {demande?.commentaires && demande.commentaires.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {demande.commentaires.length} commentaire{demande.commentaires.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}