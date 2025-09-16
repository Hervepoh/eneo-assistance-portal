import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRolesQueryFn, deleteRoleMutationFn } from "@/lib/api";
import { Search, Plus, Eye, Edit, Trash2, Shield, Loader2, AlertCircle, Key, Users } from "lucide-react";

interface Permission {
  id: number;
  name: string;
  description?: string;
  module?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupération des rôles
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["roles", searchQuery],
    queryFn: () => getRolesQueryFn({ q: searchQuery, limit: 20, page: 1 }),
    select: (res) => res.roles as Role[],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Mutation suppression rôle
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => deleteRoleMutationFn(id),
    onSuccess: () => {
      toast({ 
        title: "Rôle supprimé", 
        description: "Le rôle a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteDialogOpen(null);
    },
    onError: (err: any) => {
      toast({
        title: "Erreur de suppression",
        description: err.message || "Impossible de supprimer le rôle",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    deleteRoleMutation.mutate(id);
  };

  // Stats calculées
  const stats = useMemo(() => {
    if (!data) return { total: 0, withPermissions: 0, totalPermissions: 0 };
    
    const totalPermissions = data.reduce((acc, role) => acc + (role.permissions?.length || 0), 0);
    
    return {
      total: data.length,
      withPermissions: data.filter(r => r.permissions && r.permissions.length > 0).length,
      totalPermissions,
    };
  }, [data]);

  // États de chargement et d'erreur
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Erreur lors du chargement des rôles</span>
            </div>
            <Button 
              onClick={() => queryClient.refetchQueries({ queryKey: ["roles"] })}
              variant="outline" 
              className="mt-4"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des rôles</h1>
            <p className="text-gray-600 mt-1">Gérez les rôles et leurs permissions</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/admin/permissions")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Permissions
            </Button>
            <Button 
              onClick={() => navigate("/admin/roles/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau rôle
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total rôles</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Key className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Avec permissions</p>
                  <p className="text-2xl font-bold">{stats.withPermissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-8 w-8 p-0 justify-center">
                  P
                </Badge>
                <div>
                  <p className="text-sm text-gray-600">Total permissions</p>
                  <p className="text-2xl font-bold">{stats.totalPermissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Liste des rôles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Chargement des rôles...</span>
              </div>
            </div>
          ) : !data?.length ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchQuery ? "Aucun rôle trouvé" : "Aucun rôle enregistré"}
              </p>
              {searchQuery ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                  size="sm"
                >
                  Effacer la recherche
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/admin/roles/new")}
                  size="sm"
                >
                  Créer le premier rôle
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateurs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                              {role.name?.charAt(0)?.toUpperCase() || 'R'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {role.name || 'Nom non défini'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {role.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {role.description || 'Aucune description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {role.permissions?.length ? (
                            <>
                              {role.permissions.slice(0, 3).map((permission) => (
                                <Badge 
                                  key={permission.id} 
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {permission.name}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} autres
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Aucune permission
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {role.usersCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => navigate(`/admin/roles/${role.id}`)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                          <Button
                            onClick={() => navigate(`/admin/roles/${role.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Éditer
                          </Button>
                          <AlertDialog 
                            open={deleteDialogOpen === role.id} 
                            onOpenChange={(open) => setDeleteDialogOpen(open ? role.id : null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={role.usersCount && role.usersCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le rôle <strong>{role.name}</strong> ?
                                  Cette action est irréversible et supprimera définitivement toutes les données associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(role.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteRoleMutation.isPending}
                                >
                                  {deleteRoleMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Suppression...
                                    </>
                                  ) : (
                                    'Supprimer'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}