import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserMutationFn, getUserByIdQueryFn, getRolesQueryFn, resetUserPasswordFn } from "@/lib/api";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Save, 
  Loader2, 
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  UserCog,
  RefreshCw,
  Calendar,
  Activity
} from "lucide-react";

// Schéma de validation Zod pour l'édition (mot de passe optionnel)
const editUserSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  
  email: z
    .string()
    .email("Adresse email invalide")
    .min(1, "L'email est requis")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),
  
  password: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true; // Mot de passe vide autorisé en édition
      return val.length >= 8;
    }, "Le mot de passe doit contenir au moins 8 caractères")
    .refine((val) => {
      if (!val || val === "") return true;
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(val);
    }, "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial"),
  
  confirmPassword: z.string().optional(),
  
  roles: z
    .array(z.number())
    .min(1, "Au moins un rôle doit être sélectionné"),
  
  status: z
    .enum(["active", "inactive"], {
      required_error: "Le statut est requis",
    }),
  
  bio: z
    .string()
    .max(500, "La biographie ne peut pas dépasser 500 caractères")
    .optional(),
  
}).refine((data) => {
  if (!data.password && !data.confirmPassword) return true; // Pas de mot de passe = OK
  if (!data.password && data.confirmPassword) return false; // Confirmation sans mot de passe = erreur
  return data.password === data.confirmPassword;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface Role {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

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
}

export default function EditUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const userId = id ? parseInt(id) : null;

  // Récupération des données utilisateur
  const { 
    data: userData, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdQueryFn(userId!),
    enabled: !!userId,
    select: (res) => res.data as User,
  });

  // Récupération des rôles disponibles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesQueryFn,
    select: (res) => res.roles as Role[],
  });

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: [],
      status: "active",
      bio: "",
    },
    mode: "onChange",
  });

  const watchedRoles = watch("roles");
  const watchedPassword = watch("password");

  // Remplir le formulaire avec les données utilisateur
  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name,
        email: userData.email,
        password: "",
        confirmPassword: "",
        roles: userData.roles.map(r => r.id),
        status: userData.status,
        bio: userData.bio || "",
      });
    }
  }, [userData, reset]);

  // Mutation pour mettre à jour l'utilisateur
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => updateUserMutationFn(userId, data),
    onSuccess: (data) => {
      toast({
        title: "Utilisateur mis à jour",
        description: `L'utilisateur ${data.data.name} a été mis à jour avec succès.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      if (error.field) {
        setError(error.field as keyof EditUserForm, {
          type: "server",
          message: error.message,
        });
      } else {
        toast({
          title: "Erreur de mise à jour",
          description: error.message || "Impossible de mettre à jour l'utilisateur",
          variant: "destructive",
        });
      }
    },
  });

  // Mutation pour réinitialiser le mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => resetUserPasswordFn(userId),
    onSuccess: (data) => {
      toast({
        title: "Mot de passe réinitialisé",
        description: `Nouveau mot de passe temporaire: ${data.data.temporaryPassword}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de réinitialisation",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditUserForm) => {
    if (!userId) return;

    // Préparer les données à envoyer
    const { confirmPassword, ...submitData } = data;
    
    // Si aucun mot de passe n'est fourni, ne pas l'inclure dans les données
    if (!submitData.password || submitData.password === "") {
      delete submitData.password;
    }

    updateUserMutation.mutate({ userId, data: submitData });
  };

  const handleRoleToggle = (roleId: number) => {
    const currentRoles = watchedRoles || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    setValue("roles", newRoles, { shouldValidate: true });
  };

  const handleResetPassword = () => {
    if (!userId) return;
    if (confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
      resetPasswordMutation.mutate(userId);
    }
  };

  // Critères de validation du mot de passe (si un mot de passe est entré)
  const passwordCriteria = [
    { label: "Au moins 8 caractères", valid: !watchedPassword || watchedPassword.length >= 8 },
    { label: "Une minuscule", valid: !watchedPassword || /[a-z]/.test(watchedPassword) },
    { label: "Une majuscule", valid: !watchedPassword || /[A-Z]/.test(watchedPassword) },
    { label: "Un chiffre", valid: !watchedPassword || /\d/.test(watchedPassword) },
    { label: "Un caractère spécial", valid: !watchedPassword || /[@$!%*?&]/.test(watchedPassword) },
  ];

  // Gestion des erreurs et du chargement
  if (!userId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
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
      <div className="p-6 max-w-4xl mx-auto">
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            {userLoading ? "Chargement..." : `Éditer ${userData?.name}`}
          </h1>
          <p className="text-gray-600 mt-1">
            Modifiez les informations de l'utilisateur
          </p>
        </div>
      </div>

      {userLoading ? (
        // Skeleton de chargement
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
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
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations utilisateur */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations personnelles
                    </CardTitle>
                    {userData && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Créé le {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nom complet */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Ex: Jean Dupont"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="jean.dupont@example.com"
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Biographie */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie (optionnel)</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Une courte description de l'utilisateur..."
                      rows={3}
                      className={errors.bio ? "border-red-500" : ""}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.bio.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {watch("bio")?.length || 0}/500 caractères
                    </p>
                  </div>

                  {/* Informations supplémentaires */}
                  {userData && (
                    <div className="pt-4 border-t space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Informations système
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <span className="ml-2 font-mono">{userData.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dernière modification:</span>
                          <span className="ml-2">{new Date(userData.updatedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {userData.lastLoginAt && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Dernière connexion:</span>
                            <span className="ml-2">{new Date(userData.lastLoginAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Sécurité
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {resetPasswordMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Réinitialiser le mot de passe
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Laissez les champs mot de passe vides pour conserver le mot de passe actuel.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="changePassword"
                      checked={isChangingPassword}
                      onCheckedChange={setIsChangingPassword}
                    />
                    <Label htmlFor="changePassword">
                      Je veux changer le mot de passe
                    </Label>
                  </div>

                  {isChangingPassword && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      {/* Nouveau mot de passe */}
                      <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="Nouveau mot de passe"
                            className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password.message}
                          </p>
                        )}
                        
                        {/* Critères de validation du mot de passe */}
                        {watchedPassword && (
                          <div className="space-y-1 mt-2">
                            <p className="text-xs text-gray-600 font-medium">Critères:</p>
                            <div className="grid grid-cols-2 gap-1">
                              {passwordCriteria.map((criterion, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs">
                                  {criterion.valid ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                                  )}
                                  <span className={criterion.valid ? "text-green-600" : "text-gray-500"}>
                                    {criterion.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirmation mot de passe */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword")}
                            placeholder="Confirmez le nouveau mot de passe"
                            className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Rôles et statut */}
            <div className="space-y-6">
              {/* Rôles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Rôles et permissions *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rolesLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Chargement des rôles...</span>
                    </div>
                  ) : roles?.length ? (
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <div key={role.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={watchedRoles?.includes(role.id) || false}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`role-${role.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {role.name}
                            </Label>
                            {role.description && (
                              <p className="text-xs text-gray-600">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucun rôle disponible. Créez d'abord des rôles.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {errors.roles && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.roles.message}
                    </p>
                  )}

                  {/* Rôles sélectionnés */}
                  {watchedRoles?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-600 mb-2">Rôles sélectionnés:</p>
                      <div className="flex flex-wrap gap-1">
                        {watchedRoles.map((roleId) => {
                          const role = roles?.find(r => r.id === roleId);
                          return role ? (
                            <Badge key={roleId} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statut */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut *</Label>
                    <Select
                      value={watch("status")}
                      onValueChange={(value) => setValue("status", value as "active" | "inactive", { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  {/* Statut actuel */}
                  {userData && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Statut actuel:</p>
                      <Badge 
                        variant={userData.status === 'inactive' ? 'secondary' : 'default'}
                        className={userData.status === 'inactive' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}
                      >
                        {userData.status === 'inactive' ? 'Inactif' : 'Actif'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={updateUserMutation.isPending}
                >
                  Annuler les modifications
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/users")}
                    disabled={updateUserMutation.isPending}
                  >
                    Retour à la liste
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || !isDirty || updateUserMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Sauvegarder les modifications
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}