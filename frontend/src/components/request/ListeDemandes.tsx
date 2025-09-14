import React, { useEffect, useState } from 'react';
import { Search, Eye, Grid, Table, Filter, Download } from 'lucide-react';
import { DemandeCard } from './DemandeCard';
import { DemandeDataTable } from './DemandeDataTable';
import { Demande, ModeType } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import {
  getAppReferenceQueryFn,
  getMyRequestsQueryFn,
  getOrgReferenceQueryFn,
  getRequestsToValidateN1QueryFn
} from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface ListeDemandesProps {
  title?: string;
  mode?: ModeType;
  statusFilter?: string;
  categoryFilter?: string;
  priorityFilter?: string;
  ApplicationGroupFilter?: string;
  ApplicationFilter?: string;
  hideFilters?: boolean;
}

type ViewType = 'card' | 'table';

const categories = ['technique', 'administrative', 'financiere', 'rh', 'autre'];
const statuts = ['DRAFT', 'SUBMITTED', 'EN_COURS', 'RESOLUE', 'FERMEE', 'REJETEE'];
const priorites = ['basse', 'normale', 'haute', 'critique'];

// Fonction pour transformer les données de l'API en format Demande
const transformApiDataToDemande = (apiData: any): Demande => ({
  id: apiData.id,
  reference: apiData.reference,
  titre: apiData.titre,
  description: apiData.description,
  statut: apiData.status.toLowerCase(),
  priorite: 'normale', // À adapter selon votre API
  categorie: 'technique', // À adapter selon votre API
  createdAt: apiData.created_at,
  dateModification: apiData.updated_at,
  requestor: {
    id: apiData.user_id,
    prenom: apiData.user_name.split(' ')[0] || '',
    nom: apiData.user_name.split(' ').slice(1).join(' ') || '',
    email: apiData.user_email
  },
  region: apiData.region_name,
  delegation: apiData.delegation_name,
  agence: apiData.agence_name,
  application: apiData.application_name,
  fichiers: Array(apiData.fichier_count)
    .fill(0)
    .map((_, index) => ({
      id: index,
      nom: `Fichier ${index + 1}`,
      url: '#',
      type: 'file',
      taille: 0
    }))
});

export function ListeDemandes({
  title = 'Mes demandes',
  mode = 'my',
  statusFilter,
  categoryFilter,
  priorityFilter,
  ApplicationGroupFilter,
  ApplicationFilter,
  hideFilters = false
}: ListeDemandesProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>(categoryFilter || 'all');
  const [selectedStatut, setSelectedStatut] = useState<string>(statusFilter || 'all');
  const [selectedPriorite, setSelectedPriorite] = useState<string>(priorityFilter || 'all');
  const [selectedApplicationGroup, setSelectedApplicationGroup] = useState<string>(ApplicationGroupFilter || 'all');
  const [selectedApplication, setSelectedApplication] = useState<string>(ApplicationFilter || 'all');
  const [viewType, setViewType] = useState<ViewType>('table');

  // ⚡ Récupération hiérarchie (Région -> Délégation -> Agence)
  const { data: regions } = useQuery({
    queryKey: ['organisations'],
    queryFn: getOrgReferenceQueryFn,
    select: (res) => res.data?.data,
    staleTime: Infinity
  });

  // ⚡ Récupération hiérarchie (Groupe d'applications -> Applications)
  const { data: applicationGroups } = useQuery({
    queryKey: ['application-groups'],
    queryFn: getAppReferenceQueryFn,
    select: (res) => res.data?.data,
    staleTime: Infinity
  });


  // Déterminer la fonction de query en fonction du mode
  const getQueryFunction = () => {
    switch (mode) {
      case 'as-n1':
        return getRequestsToValidateN1QueryFn;
      case 'my':
      default:
        return getMyRequestsQueryFn;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'requests',
      mode,
      { searchTerm, selectedCategorie, selectedStatut, selectedPriorite }
    ],
    queryFn: () =>
      getQueryFunction()({
        q: searchTerm || undefined,
        status: selectedStatut !== 'all' ? selectedStatut : undefined,
        categorie: selectedCategorie !== 'all' ? selectedCategorie : undefined,
        priorite: selectedPriorite !== 'all' ? selectedPriorite : undefined,
        page: 1,
        limit: 50
      }),
    staleTime: 1000 * 60 * 5
  });

  const onDemandeClick = (reference: string) => {
    const ref = reference.toLowerCase();
    if (mode === 'as-n1') {
      navigate(`/requests-to-validate-suph/${ref}`);
    } else {
      navigate(`/my-requests/${ref}`);
    }
  };

  // Reset application quand on change de groupe
  useEffect(() => {
    setSelectedApplication("all");
  }, [selectedApplicationGroup]);

  const selectedGroup = applicationGroups?.find(
    (group: {
      id: number;
      name: string;
      applications: { id: number; name: string }[];
    }) => group.id.toString() === selectedApplicationGroup
  );

  const applications = selectedGroup?.applications ?? [];


  // Transformer les données de l'API
  const demandesData = data?.data?.data || [];
  const totalCount = data?.data?.total || 0;
  const transformedDemandes = demandesData.map(transformApiDataToDemande);

  const hasActiveFilters =
    searchTerm || selectedCategorie !== 'all' || selectedStatut !== 'all' || selectedPriorite !== 'all';

  const showFilters = !hideFilters;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600">Impossible de charger les demandes. Veuillez réessayer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {totalCount} demande{totalCount !== 1 ? 's' : ''} trouvée{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Bouton d'export */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exporter</span>
          </Button>

          {/* Boutons de changement de vue */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center">
            <Button
              variant={viewType === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('card')}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('table')}
              className="h-8 w-8 p-0"
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {statuts.map((st) => (
                  <SelectItem key={st} value={st}>
                    <span className="capitalize">{st.toLowerCase().replace('_', ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriorite} onValueChange={setSelectedPriorite}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                {priorites.map((pr) => (
                  <SelectItem key={pr} value={pr}>
                    <span className="capitalize">{pr}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Groupe d'applications */}
            <Select value={selectedApplicationGroup} onValueChange={setSelectedApplicationGroup}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les groupes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les groupes</SelectItem>
                {applicationGroups.map((group: { id: number, name: string }) => (
                  <SelectItem key={group.id} value={group.name}>
                    <span className="capitalize">{group.name.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            {/* Application */}
            <Select value={selectedApplication} onValueChange={setSelectedApplication}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les applications</SelectItem>
                {applications.map((app: { id: number, name: string }) => (
                  <SelectItem key={app.id} value={app.name}>
                    <span className="capitalize">{app.name.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Recherche: "{searchTerm}"
                  </Badge>
                )}
                {selectedCategorie !== 'all' && (
                  <Badge variant="secondary">Catégorie: {selectedCategorie}</Badge>
                )}
                {selectedStatut !== 'all' && (
                  <Badge variant="secondary">
                    Statut: {selectedStatut.toLowerCase().replace('_', ' ')}
                  </Badge>
                )}
                {selectedPriorite !== 'all' && (
                  <Badge variant="secondary">Priorité: {selectedPriorite}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategorie('all');
                  setSelectedStatut('all');
                  setSelectedPriorite('all');
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Effacer tout
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Contenu responsive */}
      {transformedDemandes.length > 0 ? (
        viewType === 'table' ? (
          <div className="hidden md:block">
            <DemandeDataTable
              demandes={transformedDemandes}
              onDemandeClick={onDemandeClick}
              mode={mode}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedDemandes.map((demande) => (
              <DemandeCard
                key={demande.id}
                demande={demande}
                onClick={() => navigate(`/my-requests/${demande.id}`)}
                mode={mode}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg border p-8 sm:p-12 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            {showFilters && hasActiveFilters
              ? 'Aucune demande ne correspond à vos critères de recherche'
              : 'Aucune demande disponible pour le moment'}
          </p>
          {showFilters && hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('all');
                setSelectedStatut('all');
                setSelectedPriorite('all');
              }}
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
