import React from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDemandes } from '../../context/DemandesContext';
import { StatsCard } from './StatsCard';
import { DemandeCard } from '../Demandes/DemandeCard';

export function Dashboard() {
  const { demandes, statistiques } = useDemandes();

  const demandesRecentes = demandes.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de vos demandes d'assistance</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Par catégorie</h3>
          <div className="space-y-3">
            {Object.entries(statistiques.demandesParCategorie).map(([categorie, count]) => (
              <div key={categorie} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {categorie.replace('_', ' ')}
                </span>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-3">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / statistiques.totalDemandes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par priorité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Par priorité</h3>
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
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-3">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[priorite as keyof typeof colors]} h-2 rounded-full`}
                        style={{ width: `${(count / statistiques.totalDemandes) * 100}%` }}
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
        </div>
        <div className="p-6">
          {demandesRecentes.length > 0 ? (
            <div className="space-y-4">
              {demandesRecentes.map((demande) => (
                <DemandeCard key={demande.id} demande={demande} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande récente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}