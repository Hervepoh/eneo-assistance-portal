import { ListeDemandes } from "@/components/request/ListeDemandes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Target, CheckCircle, Clock, BarChart } from 'lucide-react';

interface BaoStats {
  total: number;
  highValue: number;
  approved: number;
  impact: string;
}

interface PriorityBreakdown {
  critique: number;
  haute: number;
  normale: number;
}

interface SlaMetrics {
  avgDelay: string;
  onTime: string;
  late: string;
}

interface RequestToBaoProps {
  stats?: BaoStats;
  priorities?: PriorityBreakdown;
  slaMetrics?: SlaMetrics;
  isLoading?: boolean;
  error?: string | null;
}

const RequestToBao = ({ 
  stats, 
  priorities,
  slaMetrics,
  isLoading = false, 
  error = null 
}: RequestToBaoProps = {}) => {
  // Utiliser les statistiques réelles ou des valeurs par défaut
  const baoStats = stats || {
    total: 0,
    highValue: 0,
    approved: 0,
    impact: '0%'
  };

  const priorityData = priorities || {
    critique: 0,
    haute: 0,
    normale: 0
  };

  const slaData = slaMetrics || {
    avgDelay: '0 jour',
    onTime: '0%',
    late: '0%'
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur lors du chargement: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de rôle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validation Business Owner (BAO)</h1>
          <p className="text-gray-600 mt-1">
            Demandes approuvées par le DEC, validation finale avant traitement
          </p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Crown className="w-4 h-4 mr-1" />
          Business Owner (BAO)
        </Badge>
      </div>

      {/* Tableau de bord des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation finale</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{baoStats.total}</div>
            <p className="text-xs text-muted-foreground">demandes à approuver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forte valeur</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{baoStats.highValue}</div>
            <p className="text-xs text-muted-foreground">impact business élevé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées (mois)</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{baoStats.approved}</div>
            <p className="text-xs text-muted-foreground">ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux succès</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{baoStats.impact}</div>
            <p className="text-xs text-muted-foreground">objectifs atteints</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions pour le BAO */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Responsabilités du Business Owner (BAO)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800 space-y-2">
          <p>• Évaluer l'impact business et la valeur stratégique</p>
          <p>• Prioriser selon les objectifs organisationnels</p>
          <p>• Valider l'allocation des ressources et budget</p>
          <p>• Donner l'approbation finale pour le traitement</p>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <BarChart className="w-4 h-4 mr-2" />
              Répartition par priorité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critique</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                  <div 
                    className={`bg-red-600 h-2 rounded-full ${priorityData.critique > 0 ? 'progress-50' : 'progress-0'}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{priorityData.critique}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Haute</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                  <div 
                    className={`bg-orange-600 h-2 rounded-full ${priorityData.haute > 0 ? 'progress-30' : 'progress-0'}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{priorityData.haute}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Normale</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full ${priorityData.normale > 0 ? 'progress-70' : 'progress-0'}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{priorityData.normale}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2" />
              SLA et délais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Délai moyen</span>
              <span className="text-sm font-medium">{slaData.avgDelay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Dans les délais</span>
              <span className="text-sm font-medium text-green-600">{slaData.onTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">En retard</span>
              <span className="text-sm font-medium text-red-600">{slaData.late}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      <ListeDemandes
        title="Demandes en attente de validation BAO"
        mode="all"
        statusFilter="PENDING_BUSINESS"
        hideFilters={false}
      />
    </div>
  );
};

export default RequestToBao;
