import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { DemandeCard } from '../request/DemandeCard';
import { Demande } from '@/types';

interface DashboardProps {
  demandes?: Demande[];
  statistiques?: {
    totalDemandes: number;
    demandesEnAttente: number;
    demandesEnCours: number;
    demandesResolues: number;
    demandesParCategorie: Record<string, number>;
    demandesParPriorite: Record<string, number>;
  };
  isLoading?: boolean;
  error?: string | null;
}

export function Dashboard({ 
  demandes = [], 
  statistiques, 
  isLoading = false, 
  error = null 
}: DashboardProps) {
  
  // Calculer les statistiques depuis les demandes si non fournies
  const calculatedStats = statistiques || {
    totalDemandes: demandes.length,
    demandesEnAttente: demandes.filter(d => ['brouillon', 'DRAFT', 'soumise'].includes(d.statut)).length,
    demandesEnCours: demandes.filter(d => ['verification', 'validation_dec', 'validation_bao', 'assignee', 'en_cours'].includes(d.statut)).length,
    demandesResolues: demandes.filter(d => ['resolue', 'fermee'].includes(d.statut)).length,
    demandesParCategorie: demandes.reduce((acc, d) => {
      acc[d.categorie] = (acc[d.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    demandesParPriorite: demandes.reduce((acc, d) => {
      acc[d.priorite] = (acc[d.priorite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const recentDemandes = demandes.slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">Erreur lors du chargement du tableau de bord: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tableau de bord</h2>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Vue d'ensemble de vos demandes d'assistance</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total des demandes"
          value={calculatedStats.totalDemandes}
          icon={FileText}
          color="blue"
          trend={demandes.length > 0 ? { value: 12, isPositive: true } : undefined}
        />
        <StatsCard
          title="En attente"
          value={calculatedStats.demandesEnAttente}
          icon={Clock}
          color="yellow"
          trend={demandes.length > 0 ? { value: -5, isPositive: false } : undefined}
        />
        <StatsCard
          title="En cours"
          value={calculatedStats.demandesEnCours}
          icon={TrendingUp}
          color="blue"
          trend={demandes.length > 0 ? { value: 8, isPositive: true } : undefined}
        />
        <StatsCard
          title="Résolues"
          value={calculatedStats.demandesResolues}
          icon={CheckCircle}
          color="green"
          trend={demandes.length > 0 ? { value: 15, isPositive: true } : undefined}
        />
      </div>

      {/* Graphiques et détails */}
      {Object.keys(calculatedStats.demandesParCategorie).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par catégorie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-slate-900/50 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-200">Répartition par catégorie</h3>
            <div className="space-y-3">
              {Object.entries(calculatedStats.demandesParCategorie).map(([categorie, count]) => {
                const numericCount = Number(count);
                const progressPercent = Math.min(100, Math.max(0, Math.round((numericCount / calculatedStats.totalDemandes) * 10) * 10));
                
                return (
                  <div key={categorie} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 capitalize dark:text-slate-400">
                      {categorie.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-200">{numericCount}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                        <div
                          className={`bg-blue-600 h-2 rounded-full dark:bg-blue-500 progress-${progressPercent}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Répartition par priorité */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-slate-900/50 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-200">Répartition par priorité</h3>
            <div className="space-y-3">
              {Object.entries(calculatedStats.demandesParPriorite).map(([priorite, count]) => {
                const numericCount = Number(count);
                const progressPercent = Math.min(100, Math.max(0, Math.round((numericCount / calculatedStats.totalDemandes) * 10) * 10));
                const colors = {
                  basse: 'bg-green-500',
                  normale: 'bg-blue-500',
                  haute: 'bg-yellow-500',
                  critique: 'bg-red-500'
                };
                
                return (
                  <div key={priorite} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 capitalize dark:text-slate-400">{priorite}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-200">{numericCount}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                        <div
                          className={`${colors[priorite as keyof typeof colors]} h-2 rounded-full progress-${progressPercent}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Demandes récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-slate-900/50 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200">Demandes récentes</h3>
          <p className="text-sm text-gray-600 mt-1 dark:text-slate-400">Les {Math.min(5, demandes.length)} demandes les plus récentes</p>
        </div>
        <div className="p-6">
          {recentDemandes.length > 0 ? (
            <div className="space-y-4">
              {recentDemandes.map((demande) => (
                <DemandeCard 
                  key={demande.id} 
                  demande={demande} 
                  compact 
                  onClick={() => console.log('Détail demande:', demande.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4 dark:text-slate-500" />
              <p className="text-gray-500 text-lg font-medium mb-2 dark:text-slate-400">Aucune demande récente</p>
              <p className="text-gray-400 text-sm dark:text-slate-500">Vos demandes apparaitront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 dark:bg-blue-900/20 dark:border-blue-700/50">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 dark:text-blue-300">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500">
            Nouvelle demande
          </button>
          <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors dark:bg-slate-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-slate-700">
            Voir toutes les demandes
          </button>
          <button className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            Exporter les données
          </button>
        </div>
      </div>
    </div>
  );
}