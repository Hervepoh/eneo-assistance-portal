import { ListeDemandes } from "@/components/request/ListeDemandes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, FileCheck } from 'lucide-react';

interface VerificationStats {
  total: number;
  urgent: number;
  normal: number;
  low: number;
}

interface RequestToVerifyProps {
  stats?: VerificationStats;
  isLoading?: boolean;
  error?: string | null;
}

const RequestToVerify = ({ 
  stats, 
  isLoading = false, 
  error = null 
}: RequestToVerifyProps = {}) => {
  // Utiliser les statistiques réelles ou des valeurs par défaut
  const verificationStats = stats || {
    total: 0,
    urgent: 0,
    normal: 0,
    low: 0
  };

  // Si aucune API de stats n'est disponible, calculer depuis les demandes
  // const { data: demandesData } = useQuery({
  //   queryKey: ['verification-requests'],
  //   queryFn: () => getVerificationRequestsQueryFn(),
  //   select: (data) => {
  //     const demandes = data?.data?.data || [];
  //     return {
  //       total: demandes.length,
  //       urgent: demandes.filter(d => d.priorite === 'haute' || d.priorite === 'critique').length,
  //       normal: demandes.filter(d => d.priorite === 'normale').length,
  //       low: demandes.filter(d => d.priorite === 'basse').length
  //     };
  //   }
  // });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Vérification des demandes</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Demandes en attente de vérification - Rôle: Vérificateur
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
          <CheckCircle className="w-4 h-4 mr-1" />
          Vérificateur
        </Badge>
      </div>

      {/* Tableau de bord des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total à vérifier</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{verificationStats.total}</div>
            <p className="text-xs text-muted-foreground">demandes en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité haute</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{verificationStats.urgent}</div>
            <p className="text-xs text-muted-foreground">à traiter en urgence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité normale</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{verificationStats.normal}</div>
            <p className="text-xs text-muted-foreground">priorité standard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité basse</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verificationStats.low}</div>
            <p className="text-xs text-muted-foreground">peut attendre</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions pour le vérificateur */}
      {/* <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Instructions de vérification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>• Vérifiez la complétude des informations fournies</p>
          <p>• Contrôlez la pertinence de la demande par rapport au service</p>
          <p>• Validez les pièces jointes si nécessaires</p>
          <p>• Approuvez pour passer à l'étape suivante ou demandez des modifications</p>
        </CardContent>
      </Card> */}

      {/* Alerte si beaucoup de demandes en attente */}
      {verificationStats.total > 10 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                Attention: {verificationStats.total} demandes en attente de vérification
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des demandes */}
      <ListeDemandes
        title="Demandes en attente de vérification"
        mode="all"
        statusFilter="UNDER_VERIFICATION"
        hideFilters={false}
      />
    </div>
  );
};

export default RequestToVerify;
