import React from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { DemandeCard } from '../request/DemandeCard';

// Données fictives pour le tableau de bord
const fakeStatistiques = {
  totalDemandes: 42,
  demandesEnAttente: 8,
  demandesEnCours: 12,
  demandesResolues: 22,
  demandesParCategorie: {
    technique: 18,
    administrative: 12,
    financiere: 6,
    rh: 4,
    autre: 2
  },
  demandesParPriorite: {
    basse: 10,
    normale: 20,
    haute: 8,
    critique: 4
  }
};

const fakeDemandes = [
  {
    id: 1,
    reference: 'EN-ASSCMS0042-2024',
    titre: "Problème de connexion CMS",
    description: "Impossible d'accéder au système CMS depuis ce matin",
    statut: "en_cours",
    priorite: "haute",
    categorie: "technique",
    dateCreation: "2024-01-15T10:30:00",
    dateModification: "2024-01-15T14:20:00",
    demandeur: {
      id: 1,
      prenom: "Jean",
      nom: "Dupont",
      email: "jean.dupont@example.com"
    }
  },
  {
    id: 2,
    reference: 'EN-ASSBCV0023-2024',
    titre: "Validation annulation facture",
    description: "Besoin de valider l'annulation de la facture #12345",
    statut: "soumise",
    priorite: "normale",
    categorie: "financiere",
    dateCreation: "2024-01-14T09:15:00",
    dateModification: "2024-01-14T09:15:00",
    demandeur: {
      id: 2,
      prenom: "Marie",
      nom: "Martin",
      email: "marie.martin@example.com"
    }
  },
  {
    id: 3,
    reference: 'EN-ASSHRM0015-2024',
    titre: "Demande formation management",
    description: "Formation sur les techniques de management d'équipe",
    statut: "resolue",
    priorite: "basse",
    categorie: "rh",
    dateCreation: "2024-01-13T16:45:00",
    dateModification: "2024-01-13T17:30:00",
    demandeur: {
      id: 3,
      prenom: "Pierre",
      nom: "Durand",
      email: "pierre.durand@example.com"
    }
  },
  {
    id: 4,
    reference: 'EN-ASSSGC0038-2024',
    titre: "Mise à jour système commercial",
    description: "Mise à jour vers la version 2.0 du système de gestion",
    statut: "en_cours",
    priorite: "normale",
    categorie: "technique",
    dateCreation: "2024-01-12T08:20:00",
    dateModification: "2024-01-15T11:45:00",
    demandeur: {
      id: 4,
      prenom: "Sophie",
      nom: "Leroy",
      email: "sophie.leroy@example.com"
    }
  },
  {
    id: 5,
    reference: 'EN-ASSCRD0009-2024',
    titre: "Incident critique base de données",
    description: "La base de données ne répond plus depuis 1 heure",
    statut: "brouillon",
    priorite: "critique",
    categorie: "technique",
    dateCreation: "2024-01-15T16:30:00",
    dateModification: "2024-01-15T16:30:00",
    demandeur: {
      id: 5,
      prenom: "Thomas",
      nom: "Moreau",
      email: "thomas.moreau@example.com"
    }
  }
];

// Hook fictif pour simuler le chargement des données
const useDemandes = () => {
  return {
    demandes: fakeDemandes,
    statistiques: fakeStatistiques,
    isLoading: false,
    error: null
  };
};

export function Dashboard() {
  const { demandes, statistiques } = useDemandes();
  const demandesRecentes = demandes.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de vos demandes d'assistance</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total des demandes"
          value={statistiques.totalDemandes}
          icon={FileText}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="En attente"
          value={statistiques.demandesEnAttente}
          icon={Clock}
          color="yellow"
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="En cours"
          value={statistiques.demandesEnCours}
          icon={TrendingUp}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Résolues"
          value={statistiques.demandesResolues}
          icon={CheckCircle}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
          <div className="space-y-3">
            {Object.entries(statistiques.demandesParCategorie).map(([categorie, count]) => (
              <div key={categorie} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {categorie.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(count / statistiques.totalDemandes) * 100}%`,
                        minWidth: '8px' // Garantit une visibilité même pour les petits pourcentages
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par priorité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par priorité</h3>
          <div className="space-y-3">
            {Object.entries(statistiques.demandesParPriorite).map(([priorite, count]) => {
              const colors = {
                basse: 'bg-green-500',
                normale: 'bg-blue-500',
                haute: 'bg-yellow-500',
                critique: 'bg-red-500'
              };
              
              return (
                <div key={priorite} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">{priorite}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[priorite as keyof typeof colors]} h-2 rounded-full`}
                        style={{ 
                          width: `${(count / statistiques.totalDemandes) * 100}%`,
                          minWidth: '8px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demandes récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Demandes récentes</h3>
          <p className="text-sm text-gray-600 mt-1">Les 5 demandes les plus récentes</p>
        </div>
        <div className="p-6">
          {demandesRecentes.length > 0 ? (
            <div className="space-y-4">
              {/* {demandesRecentes.map((demande) => (
                <DemandeCard 
                  key={demande.id} 
                  demande={demande} 
                  compact 
                  onClick={() => console.log('Détail demande:', demande.id)}
                />
              ))} */}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">Aucune demande récente</p>
              <p className="text-gray-400 text-sm">Vos demandes apparaitront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Nouvelle demande
          </button>
          <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Voir toutes les demandes
          </button>
          <button className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Exporter les données
          </button>
        </div>
      </div>
    </div>
  );
}