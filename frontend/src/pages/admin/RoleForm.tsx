import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getRoleByIdQueryFn,
  createRoleMutationFn, 
  updateRoleMutationFn, 
  getPermissionsQueryFn 
} from "@/lib/api";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shield, 
  Key, 
  Search, 
  Filter, 
  CheckCircle2,
  Circle,
  AlertCircle 
} from "lucide-react";

interface Permission {
  id: number;
  name: string;
  description?: string;
  module: string;
  action: string;
}

interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // État du formulaire
  const [formData, setFormData] = useState<Role>({
    name: "",
    description: "",
    permissions: []
  });

  // États pour les permissions
  const [searchPermissions, setSearchPermissions] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());

  // Récupération du rôle existant (en édition)
  const { data: existingRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["role", id],
    queryFn: () => getRoleByIdQueryFn(parseInt(id!)),
    enabled: isEditing,
  });

  // Récupération de toutes les permissions
  const { data: allPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", "all"],
    queryFn: () => getPermissionsQueryFn({ limit: 1000, page: 1 }),
    select: (res) => res.permissions as Permission[],
  });

  // Initialisation du formulaire
  useEffect(() => {
    if (isEditing && existingRole) {
      setFormData({
        name: existingRole.name,
        description: existingRole.description || "",
        permissions: existingRole.permissions || []
      });
      setSelectedPermissionIds(new Set(existingRole.permissions?.map(p => p.id) || []));
    }
  }, [isEditing, existingRole]);

  // Modules disponibles
  const modules = useMemo(() => {
    if (!allPermissions) return [];
    const uniqueModules = Array.from(new Set(allPermissions.map(p => p.module)));
    return uniqueModules.sort();
  }, [allPermissions]);

  // Permissions filtrées
  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [];
    return allPermissions.filter(permission => {
      const matchesSearch = !searchPermissions || 
        permission.name.toLowerCase().includes(searchPermissions.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchPermissions.toLowerCase());
      const matchesModule = moduleFilter === "all" || permission.module === moduleFilter;
      return matchesSearch && matchesModule;
    });
  }, [allPermissions, searchPermissions, moduleFilter]);

  // Permissions regroupées par module
  const permissionsByModule = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach(permission => {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }
      groups[permission.module].push(permission);
    });
    return groups;
  }, [filteredPermissions]);

  // Mutation pour créer/modifier un rôle
  const saveRoleMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        permissionIds: Array.from(selectedPermissionIds)
      };
      return isEditing 
        ? updateRoleMutationFn(parseInt(id), payload)
        : createRoleMutationFn(payload);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Rôle modifié" : "Rôle créé",
        description: `Le rôle a été ${isEditing ? 'modifié' : 'créé'} avec succès.`,
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      navigate("/admin/roles");
    },
    onError: (err: any) => {
      toast({
        title: "Erreur de sauvegarde",
        description: err.message || `Impossible de ${isEditing ? 'modifier' : 'créer'} le rôle`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du rôle est obligatoire",
        variant: "destructive",
      });
      return;
    }

    saveRoleMutation.mutate(formData);
  };

  const handlePermissionToggle = (permissionId: number, permission: Permission) => {
    const newSelectedIds = new Set(selectedPermissionIds);
    
    if (newSelectedIds.has(permissionId)) {
      newSelectedIds.delete(permissionId);
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p.id !== permissionId)
      }));
    } else {
      newSelectedIds.add(permissionId);
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    }
    
    setSelectedPermissionIds(newSelectedIds);
  };

  const handleSelectAllInModule = (module: string, permissions: Permission[]) => {
    const newSelectedIds = new Set(selectedPermissionIds);
    const modulePermissionIds = permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => newSelectedIds.has(id));
    
    if (allSelected) {
      // Désélectionner tous
      modulePermissionIds.forEach(id => newSelectedIds.delete(id));
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !modulePermissionIds.includes(p.id))
      }));
    } else {
      // Sélectionner tous
      modulePermissionIds.forEach(id => newSelectedIds.add(id));
      const newPermissions = permissions.filter(p => !selectedPermissionIds.has(p.id));
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, ...newPermissions]
      }));
    }
    
    setSelectedPermissionIds(newSelectedIds);
  };

  if (isLoadingRole || isLoadingPermissions) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/admin/roles")}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Modifier le rôle" : "Créer un nouveau rôle"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? "Modifiez les informations du rôle" : "Créez un nouveau rôle et assignez-lui des permissions"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du rôle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informations du rôle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du rôle *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Administrateur, Modérateur..."
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez le rôle et ses responsabilités..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignation des permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permissions
                <Badge variant="secondary">
                  {selectedPermissionIds.size} sélectionnée(s)
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtres des permissions */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une permission..."
                  value={searchPermissions}
                  onChange={(e) => setSearchPermissions(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Liste des permissions par module */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.keys(permissionsByModule).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {allPermissions?.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-300" />
                      <p>Aucune permission disponible</p>
                      <Button
                        type="button"
                        onClick={() => navigate("/admin/permissions/new")}
                        variant="outline"
                        size="sm"
                      >
                        Créer une permission
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 text-gray-300" />
                      <p>Aucune permission trouvée avec ces filtres</p>
                      <Button
                        type="button"
                        onClick={() => {
                          setSearchPermissions("");
                          setModuleFilter("all");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Effacer les filtres
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                Object.entries(permissionsByModule).map(([module, permissions]) => {
                  const allSelected = permissions.every(p => selectedPermissionIds.has(p.id));
                  const someSelected = permissions.some(p => selectedPermissionIds.has(p.id));
                  
                  return (
                    <div key={module} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            {module}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {permissions.length} permission(s)
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleSelectAllInModule(module, permissions)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          {allSelected ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Désélectionner tout
                            </>
                          ) : (
                            <>
                              <Circle className="h-3 w-3 mr-1" />
                              Sélectionner tout
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissionIds.has(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id, permission)}
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`permission-${permission.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permission.name}
                              </label>
                              {permission.description && (
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {permission.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {permission.action}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/roles")}
            disabled={saveRoleMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saveRoleMutation.isPending}
            className="flex items-center gap-2"
          >
            {saveRoleMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? "Modification..." : "Création..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? "Modifier le rôle" : "Créer le rôle"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}