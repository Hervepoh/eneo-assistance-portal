import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUserByIdQueryFn, 
  deleteUserFn, 
  toggleUserStatusFn, 
  resetUserPasswordFn,
  getUserAuditLogsFn 
} from "@/lib/api";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Activity, 
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive';
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatar?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function UserDetail() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const userId = id ? parseInt(id) : null;

  // Récupération des données utilisateur
  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdQueryFn(userId!),
    enabled: !!userId,
    select: (res) => res.data.user as User,
  });

  // Récupération des logs d'audit
  const { 
    data: auditLogs, 
    isLoading: logsLoading 
  } = useQuery({
    queryKey: ["user-audit-logs", userId],
    queryFn: () => getUserAuditLogsFn(userId!, { limit: 10 }),
    enabled: !!userId,
    select: (res) => res.logs as AuditLog[],
  });

  // Mutation pour supprimer l'utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUserFn(id),
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  // Mutation pour changer le statut
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: 'active' | 'inactive' }) =>
      toggleUserStatusFn(userId, status),
    onSuccess: (data) => {
      toast({
        title: "Statut modifié",
        description: `L'utilisateur est maintenant ${data.data.status === 'active' ? 'actif' : 'inactif'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut",
        variant: "destructive",
      });
    },
  });

  // Mutation pour réinitialiser le mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => resetUserPasswordFn(userId),
    onSuccess: (data) => {
      toast({
        title: "Mot de passe réinitialisé",
        description: `Nouveau mot de passe temporaire: ${data?.data?.temporaryPassword}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!userId) return;
    deleteUserMutation.mutate(userId);
  };

  const handleToggleStatus = () => {
    if (!userId || !user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleResetPassword = () => {
    if (!userId) return;
    resetPasswordMutation.mutate(userId);
  };

  // Formatage des dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  // Gestion des erreurs
  if (!userId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID utilisateur invalide
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement de l'utilisateur.
            <Button 
              variant="link" 
              onClick={() => queryClient.refetchQueries({ queryKey: ["user", userId] })}
              className="p-0 ml-2 h-auto"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
          
          {userLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6" />
                {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Détails de l'utilisateur #{user?.id}
              </p>
            </div>
          )}
        </div>

        {!userLoading && user && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Éditer
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {user.status === 'active' ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleResetPassword}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser le mot de passe
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {userLoading ? (
        // Skeleton de chargement
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                          {user.emailVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </p>
                      </div>
                    </div>

                    {user.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Biographie</h4>
                        <p className="text-gray-600 text-sm">{user.bio}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    
                    {user.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Informations système */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ID utilisateur:</span>
                    <p className="font-mono font-medium">{user.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Créé le:</span>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Modifié le:</span>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div>
                    <span className="text-gray-500 text-sm">Dernière connexion:</span>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.lastLoginAt)} ({formatRelativeTime(user.lastLoginAt)})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : auditLogs?.length ? (
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(log.createdAt)}</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/admin/users/${user.id}/audit-logs`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir tout l'historique
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune activité récente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut et sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Statut et sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Statut du compte</label>
                  <div className="mt-1">
                    <Badge 
                      variant={user.status === 'inactive' ? 'secondary' : 'default'}
                      className={`${
                        user.status === 'inactive' 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-green-100 text-green-800'
                      } flex items-center gap-1 w-fit`}
                    >
                      {user.status === 'inactive' ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {user.status === 'inactive' ? 'Inactif' : 'Actif'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Email vérifié</span>
                    {user.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">2FA activé</span>
                    {user.twoFactorEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={toggleStatusMutation.isPending}
                    className="w-full"
                  >
                    {user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="w-full"
                  >
                    Réinitialiser le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rôles et permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rôles et permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.roles?.length ? (
                  <div className="space-y-2">
                    {user.roles.map((role) => (
                      <div key={role.id} className="p-2 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={role.name.toLowerCase().includes('admin') ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {role.name}
                          </Badge>
                        </div>
                        {role.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun rôle assigné</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                  className="w-full flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier les informations
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/users/${user.id}/audit-logs`)}
                  className="w-full flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Historique complet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur <strong>{user?.name}</strong> ?
              <br /><br />
              Cette action est <strong>irréversible</strong> et supprimera :
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Toutes les données personnelles</li>
                <li>L'historique d'activité</li>
                <li>Les permissions et rôles</li>
                <li>Toutes les données associées</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}