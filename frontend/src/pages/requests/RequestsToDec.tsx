import { ListeDemandes } from "@/components/request/ListeDemandes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface DecStats {
  total: number;
  thisWeek: number;
  validated: number;
  avgTime: string;
}

interface RequestToDecProps {
  stats?: DecStats;
  isLoading?: boolean;
  error?: string | null;
}

const RequestToDec = ({ 
  stats, 
  isLoading = false, 
  error = null 
}: RequestToDecProps = {}) => {
  // Utiliser les statistiques réelles ou des valeurs par défaut
  const decStats = stats || {
    total: 0,
    thisWeek: 0,
    validated: 0,
    avgTime: '0 jour'
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Erreur lors du chargement: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de rôle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Validation Délégué (DEC)</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Demandes validées par la vérification, en attente de votre approbation
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
          <Shield className="w-4 h-4 mr-1" />
          Délégué (DEC)
        </Badge>
      </div>

      {/* Tableau de bord des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente validation</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{decStats.total}</div>
            <p className="text-xs text-muted-foreground">demandes à valider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{decStats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">nouvelles demandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validées (mois)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{decStats.validated}</div>
            <p className="text-xs text-muted-foreground">ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{decStats.avgTime}</div>
            <p className="text-xs text-muted-foreground">de traitement</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions pour le DEC */}
      {/* <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Responsabilités du Délégué (DEC)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-purple-800 space-y-2">
          <p>• Évaluer la pertinence stratégique de la demande</p>
          <p>• Vérifier l'alignement avec les priorités de la délégation</p>
          <p>• Contrôler les aspects budgétaires et organisationnels</p>
          <p>• Approuver pour transmission au BAO ou rejeter avec justification</p>
        </CardContent>
      </Card> */}

      {/* Alerte pour demandes urgentes */}
      {decStats.total > 5 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                Attention: {decStats.total} demandes en attente de validation
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des demandes */}
      <ListeDemandes
        title="Demandes à valider par le DEC"
        mode="all"
        statusFilter="PENDING_DELEGUE"
        hideFilters={false}
      />
    </div>
  );
};

export default RequestToDec;
