import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserMutationFn, getUsersQueryFn } from "@/lib/api";
import { Plus, Eye, Edit, Trash2, Users, Loader2, AlertCircle, UserCheck } from "lucide-react";
import DataTable, { ApiFilters, columnsFilter } from "@/components/data-table";
import { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";



interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ name: string; id: number }>;
  createdAt?: string;
  status?: 'active' | 'inactive';
  isActive?: boolean;
}

export const columnsFilters: columnsFilter[] = [
  { accessorKey: 'name', title: 'Name' },
  { accessorKey: 'email', title: 'Email' },
  { accessorKey: 'status', title: 'Status' },
  { accessorKey: 'roles', title: 'roles' },
  { accessorKey: 'createdAt', title: 'Created At' },
  { accessorKey: 'updatedAt', title: "Updated At" },
];

export default function UsersList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [apiFilters, setApiFilters] = useState<ApiFilters | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupération utilisateurs
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page, limit, apiFilters],
    queryFn: () => getUsersQueryFn({ page, limit, apiFilters }),
    //select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  // Mutation suppression utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUserMutationFn(id),
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(null);
    },
    onError: (err: unknown) => {
      if (error instanceof AxiosError) {
        toast({
          title: "Erreur",
          description: err?.response?.data?.message ?? "Impossible de créer la demande",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erreur de suppression",
          description: err?.message || "Impossible de supprimer l'utilisateur",
          variant: "destructive",
        });
      }

    },
  });

  const handleDelete = (id: number) => {
    deleteUserMutation.mutate(id);
  };

  // Configuration des colonnes pour DataTable
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Utilisateur",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {user.name || 'Nom non défini'}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {user.id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "roles",
        header: "Rôles",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              {user.roles?.length ? (
                user.roles.map((role) => (
                  <Badge
                    key={role.id}
                    variant={role.name.toLowerCase().includes('admin') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {role.name}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">
                  Aucun rôle
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Statut",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Badge
              variant={user.isActive === false ? 'secondary' : 'default'}
              className={user.isActive === false ? 'bg-red-300 text-gray-600' : 'bg-green-100 text-green-800'}
            >
              {user.isActive === false ? 'Inactif' : 'Actif'}
            </Badge>
          );
        },
      },
      {
        accessorKey: "isLdap",
        header: "LDAP",
        cell: ({ row }) => {
          const isLdap: boolean = row.getValue("isLdap");
          return (
            <div className='flex w-[100px] items-center'>
              <Checkbox checked={isLdap} className="" /> <span className="ml-2"> {isLdap ? "ON" : "OFF"}</span>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => navigate(`/admin/users/${user.id}`)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Voir
              </Button>
              <Button
                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Éditer
              </Button>
              <AlertDialog
                open={deleteDialogOpen === user.id}
                onOpenChange={(open) => setDeleteDialogOpen(open ? user.id : null)}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.name}</strong> ?
                      Cette action est irréversible et supprimera définitivement toutes les données associées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? (
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
          );
        },
      },
    ],
    [navigate, deleteDialogOpen, deleteUserMutation.isPending]
  );

  // Stats calculées
  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, admins: 0 };

    return {
      total: data.totalItems,
      active: data.data.filter((u: User) => u.isActive).length,
      admins: data.data.filter((u: User) => u.roles?.some((r: { id: number, name: string }) => r.name.toLowerCase().includes('admin'))).length,
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
              <span>Erreur lors du chargement des utilisateurs</span>
            </div>
            <Button
              onClick={() => queryClient.refetchQueries({ queryKey: ["users"] })}
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des utilisateurs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">Gérez les utilisateurs et leurs permissions</p>
          </div>
          <Button
            onClick={() => navigate("/admin/users/new")}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-8 w-8 p-0 justify-center">
                  A
                </Badge>
                <div>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DataTable avec les utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data.data?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Aucun utilisateur enregistré</p>
              <Button
                onClick={() => navigate("/admin/users/new")}
                size="sm"
              >
                Créer le premier utilisateur
              </Button>
            </div>
          ) : (
            <DataTable
              label={"Users"}
              columns={columns}
              data={data.data}
              isLoading={isLoading}
              isError={isError}
              disabled={isLoading}
              totalItems={data.totalItems}
              page={page}
              limit={limit}
              setPage={setPage}
              setLimit={setLimit}
              setApiFilters={setApiFilters}
              // filter feature
              isFilterable={true}
              filterColumns={columnsFilters}
              // Full Export feature
              isExportable={true}
              exportData={data.data}
              // Delete feature
              isDeletable={false}
              onDelete={() => { }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}