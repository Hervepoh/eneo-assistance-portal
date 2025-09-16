import React from 'react';
import { Demande } from '../../types';

interface DemandeListItemProps {
  readonly demande: Demande;
  readonly onClick?: () => void;
}

export function DemandeListItem({ demande, onClick }: DemandeListItemProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{demande.titre}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-1">{demande.description}</p>
        </div>
        
        <div className="flex items-center gap-3 ml-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            demande.statut === 'resolue' ? 'bg-green-1000 text-green-800' :
            demande.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
            demande.statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {demande.statut}
          </span>
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            demande.priorite === 'critique' ? 'bg-red-100 text-red-800' :
            demande.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
            demande.priorite === 'normale' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {demande.priorite}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
        <span>{demande.demandeur.prenom} {demande.demandeur.nom}</span>
        <span>{new Date(demande.dateCreation).toLocaleDateString()}</span>
      </div>
    </div>
  );
}