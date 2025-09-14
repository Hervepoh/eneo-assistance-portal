import React from 'react';
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
      brouillon: 'bg-gray-100 text-gray-700',
      soumise: 'bg-blue-100 text-blue-700',
      en_validation: 'bg-yellow-100 text-yellow-700',
      approuvee: 'bg-green-100 text-green-700',
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

  const getPrioriteIcon = (priorite: Demande['priorite']) => {
    if (priorite === 'critique' || priorite === 'haute') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  const getStatutIcon = (statut: Demande['statut']) => {
    const icons = {
      brouillon: <Clock className="w-4 h-4" />,
      soumise: <Clock className="w-4 h-4" />,
      en_validation: <Clock className="w-4 h-4" />,
      approuvee: <CheckCircle className="w-4 h-4" />,
      en_cours: <Clock className="w-4 h-4" />,
      resolue: <CheckCircle className="w-4 h-4" />,
      fermee: <CheckCircle className="w-4 h-4" />,
      rejetee: <AlertCircle className="w-4 h-4" />
    };
    return icons[statut];
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
              {demande?.titre}
            </h3>
            <div className={`flex items-center space-x-1 ${getPrioriteColor(demande?.priorite)}`}>
              {getPrioriteIcon(demande?.priorite)}
            </div>
          </div>
          
          {!compact && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{demande?.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{demande?.demandeur?.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(demande?.createdAt)?.toLocaleDateString('fr-FR')}</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
              {demande?.categorie?.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(demande?.statut)}`}>
            {getStatutIcon(demande?.statut)}
            <span className="capitalize">{demande?.statut?.replace('_', ' ')}</span>
          </div>
          
          <div className={`flex items-center space-x-1 text-xs font-medium ${getPrioriteColor(demande?.priorite)}`}>
            <span className="capitalize">{demande?.priorite}</span>
          </div>
        </div>
      </div>

      {demande?.dateEcheance && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Échéance: {new Date(demande.dateEcheance).toLocaleDateString('fr-FR')}</span>
          </div>
          
          {demande?.commentaires?.length > 0 && (
            <div className="text-sm text-gray-500">
              {demande?.commentaires.length} commentaire{demande?.commentaires.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}