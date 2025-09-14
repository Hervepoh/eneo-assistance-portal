import React from 'react';
import { Demande } from '../../types';

interface DemandeTableRowProps {
  demande: Demande;
  onClick?: () => void;
}

export function DemandeTableRow({ demande, onClick }: DemandeTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900">{demande.titre}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{demande.description}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          demande.statut === 'resolue' ? 'bg-green-100 text-green-800' :
          demande.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
          demande.statut === 'brouillon' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {demande.statut}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          demande.priorite === 'critique' ? 'bg-red-100 text-red-800' :
          demande.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
          demande.priorite === 'normale' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {demande.priorite}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
        {demande.categorie}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(demande.dateCreation)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {demande.demandeur.prenom} {demande.demandeur.nom}
      </td>
    </tr>
  );
}