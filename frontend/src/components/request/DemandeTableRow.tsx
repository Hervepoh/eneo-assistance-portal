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
      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{demande.titre}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{demande.description}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          demande.statut === 'resolue' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
          demande.statut === 'en_cours' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
          demande.statut === 'brouillon' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' :
          'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
        }`}>
          {demande.statut}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          demande.priorite === 'critique' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
          demande.priorite === 'haute' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
          demande.priorite === 'normale' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
        }`}>
          {demande.priorite}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
        {demande.categorie}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(demande.createdAt)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {demande.requestor?.prenom} {demande.requestor?.nom}
      </td>
    </tr>
  );
}