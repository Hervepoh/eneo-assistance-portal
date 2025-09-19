import { Demande } from '../../types';

interface DemandeListItemProps {
  readonly demande: Demande;
  readonly onClick?: () => void;
}

export function DemandeListItem({ demande, onClick }: DemandeListItemProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{demande.titre}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-1">{demande.description}</p>
        </div>
        
        <div className="flex items-center gap-3 ml-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            demande.statut === 'resolue' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
            demande.statut === 'en_cours' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
            demande.statut === 'brouillon' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' :
            'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
          }`}>
            {demande.statut}
          </span>
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            demande.priorite === 'critique' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
            demande.priorite === 'haute' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :
            demande.priorite === 'normale' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
          }`}>
            {demande.priorite}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
        <span>{demande.requestor?.prenom} {demande.requestor?.nom}</span>
        <span>{new Date(demande.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}