import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { useDemandes } from '../../context/DemandesContext';
import { useAuth } from '../../context/AuthContext';
import { DemandeCard } from './DemandeCard';
import { Demande } from '../../types';

interface ListeDemandesProps {
  title: string;
  filter?: (demande: Demande) => boolean;
  onDemandeClick?: (demande: Demande) => void;
}

export function ListeDemandes({ title, filter, onDemandeClick }: ListeDemandesProps) {
  const { demandes } = useDemandes();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  const [selectedPriorite, setSelectedPriorite] = useState<string>('');

  // Filtrer les demandes
  let filteredDemandes = demandes;

  // Appliquer le filtre personnalisé s'il existe
  if (filter) {
    filteredDemandes = filteredDemandes.filter(filter);
  }

  // Filtrer par terme de recherche
  if (searchTerm) {
    filteredDemandes = filteredDemandes.filter(demande =>
      demande.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${demande.demandeur.prenom} ${demande.demandeur.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filtrer par catégorie
  if (selectedCategorie) {
    filteredDemandes = filteredDemandes.filter(demande => demande.categorie === selectedCategorie);
  }

  // Filtrer par statut
  if (selectedStatut) {
    filteredDemandes = filteredDemandes.filter(demande => demande.statut === selectedStatut);
  }

  // Filtrer par priorité
  if (selectedPriorite) {
    filteredDemandes = filteredDemandes.filter(demande => demande.priorite === selectedPriorite);
  }

  const categories = ['technique', 'administrative', 'financiere', 'rh', 'autre'];
  const statuts = ['brouillon', 'soumise', 'verification', 'validation_dec', 'validation_bao', 'approuvee', 'assignee', 'en_cours', 'resolue', 'fermee', 'rejetee'];
  const priorites = ['basse', 'normale', 'haute', 'critique'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''} trouvée{filteredDemandes.length > 1 ? 's' : ''}</p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une demande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres */}
          <select
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous statuts</option>
            {statuts.map(statut => (
              <option key={statut} value={statut} className="capitalize">
                {statut.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedPriorite}
            onChange={(e) => setSelectedPriorite(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes priorités</option>
            {priorites.map(priorite => (
              <option key={priorite} value={priorite} className="capitalize">
                {priorite}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton pour effacer les filtres */}
        {(searchTerm || selectedCategorie || selectedStatut || selectedPriorite) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('');
                setSelectedStatut('');
                setSelectedPriorite('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredDemandes.length > 0 ? (
          filteredDemandes.map((demande) => (
            <DemandeCard
              key={demande.id}
              demande={demande}
              onClick={() => onDemandeClick?.(demande)}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategorie || selectedStatut || selectedPriorite
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucune demande ne correspond à ce filtre'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}