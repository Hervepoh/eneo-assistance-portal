import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPermissionByIdFn, 
  createPermissionFn, 
  updatePermissionFn,
  getPermissionsQueryFn
} from "@/lib/api";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Key, 
  AlertCircle 
} from "lucide-react";

interface Permission {
  id?: number;
  name: string;
  description: string;
  module: string;
  action: string;
}

// Actions prédéfinies communes
const COMMON_ACTIONS = [
  { value: "create", label: "Créer" },
  { value: "read", label: "Lire" },
  { value: "update", label: "Modifier" },
  { value: "delete", label: "Supprimer" },
  { value: "manage", label: "Gérer" },
  { value: "view", label: "Voir" },
  { value: "edit", label: "Éditer" },
  { value: "publish", label: "Publier" },
  { value: "archive", label: "Archiver" },
  { value: "export", label: "Exporter" },
  { value: "import", label: "Importer" },
];

// Modules prédéfinis communs
const COMMON_MODULES = [
  { value: "users", label: "Utilisateurs" },
  { value: "roles", label: "Rôles" },
  { value: "permissions", label: "Permissions" },
  { value: "content", label: "Contenu" },
  { value: "dashboard", label: "Tableau de bord" },
  { value: "settings", label: "Paramètres" },
  { value: "reports", label: "Rapports" },
  { value: "analytics", label: "Analyses" },
  { value: "billing", label: "Facturation" },
  { value: "support", label: "Support" },
];

export default function PermissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // État du formulaire
  const [formData, setFormData] = useState<Permission>({
    name: "",
    description: "",
    module: "",
    action: ""
  });

  // État pour les modules existants
  const [customModule, setCustomModule] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [useCustomModule, setUseCustomModule] = useState(false);
  const [useCustomAction, setUseCustomAction] = useState(false);

  // Récupération de la permission existante (en édition)
  const { data: existingPermission, isLoading: isLoadingPermission } = useQuery({
    queryKey: ["permission", id],
    queryFn: () => getPermissionByIdFn(parseInt(id!)),
    enabled: isEditing,
  });

  // Récupération des modules existants
  const { data: existingPermissions } = useQuery({
    queryKey: ["permissions", "modules"],
    queryFn: () => getPermissionsQueryFn({ limit: 1000, page: 1 }),
    select: (res) => {
      const modules = Array.from(new Set(res.permissions.map((p: any) => p.module)));
      return modules.sort();
    },
  });

  // Initialisation du formulaire
  useEffect(() => {
    if (isEditing && existingPermission) {
      const isCustomMod = !COMMON_MODULES.some(m => m.value === existingPermission.module);
      const isCustomAct = !COMMON_ACTIONS.some(a => a.value === existingPermission.action);
      
      setFormData({
        name: existingPermission.name,
        description: existingPermission.description || "",
        module: isCustomMod ? "" : existingPermission.module,
        action: isCustomAct ? "" : existingPermission.action
      });
      
      if (isCustomMod) {
        setCustomModule(existingPermission.module);
        setUseCustomModule(true);
      }
      
      if (isCustomAct) {
        setCustomAction(existingPermission.action);
        setUseCustomAction(true);
      }
    }
  }, [isEditing, existingPermission]);

  // Auto-génération du nom de la permission
  useEffect(() => {
    const module = useCustomModule ? customModule : formData.module;
    const action = useCustomAction ? customAction : formData.action;
    
    if (module && action && !isEditing) {
      const generatedName = `${module}.${action}`;
      setFormData(prev => ({ ...prev, name: generatedName }));
    }
  }, [formData.module, formData.action, customModule, customAction, useCustomModule, useCustomAction, isEditing]);

  // Mutation pour créer/modifier une permission
  const savePermissionMutation = useMutation({
    mutationFn: (data: Permission) => {
      const payload = {
        ...data,
        module: useCustomModule ? customModule : data.module,
        action: useCustomAction ? customAction : data.action
      };
      
      return isEditing 
        ? updatePermissionFn(parseInt(id!), payload)
        : createPermissionFn(payload);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Permission modifiée" : "Permission créée",
        description: `La permission a été ${isEditing ? 'modifiée' : 'créée'} avec succès.`,
      });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      navigate("/admin/permissions");
    },
    onError: (err: any) => {
      toast({
        title: "Erreur de sauvegarde",
        description: err.message || `Impossible de ${isEditing ? 'modifier' : 'créer'} la permission`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalModule = useCustomModule ? customModule : formData.module;
    const finalAction = useCustomAction ? customAction : formData.action;
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de la permission est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (!finalModule.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le module est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (!finalAction.trim()) {
      toast({
        title: "Erreur de validation",
        description: "L'action est obligatoire",
        variant: "destructive",
      });
      return;
    }

    savePermissionMutation.mutate(formData);
  };

  if (isLoadingPermission) {
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
}