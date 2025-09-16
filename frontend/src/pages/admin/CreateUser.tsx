import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserMutationFn, getRolesQueryFn } from "@/lib/api";
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
  UserPlus
} from "lucide-react";

// Schéma de validation Zod
const createUserSchema = z.object({
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
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial"),
  
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
  
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
  
  sendWelcomeEmail: z.boolean().optional(),
  
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface Role {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export default function CreateUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupération des rôles disponibles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesQueryFn,
    select: (res) => res?.roles as Role[],
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
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: [],
      status: "active",
      bio: "",
      sendWelcomeEmail: true,
    },
    mode: "onChange",
  });

  const watchedRoles = watch("roles");
  const watchedPassword = watch("password");

  // Mutation pour créer l'utilisateur
  const createUserMutation = useMutation({
    mutationFn: createUserMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Utilisateur créé avec succès",
        description: `L'utilisateur ${data?.user?.name} a été créé.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      if (error.field) {
        setError(error.field as keyof CreateUserForm, {
          type: "server",
          message: error.message,
        });
      } else {
        toast({
          title: "Erreur de création",
          description: error.message || "Impossible de créer l'utilisateur",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleRoleToggle = (roleId: number) => {
    const currentRoles = watchedRoles || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    setValue("roles", newRoles, { shouldValidate: true });
  };

  // Critères de validation du mot de passe
  const passwordCriteria = [
    { label: "Au moins 8 caractères", valid: watchedPassword?.length >= 8 },
    { label: "Une minuscule", valid: /[a-z]/.test(watchedPassword || "") },
    { label: "Une majuscule", valid: /[A-Z]/.test(watchedPassword || "") },
    { label: "Un chiffre", valid: /\d/.test(watchedPassword || "") },
    { label: "Un caractère spécial", valid: /[@$!%*?&]/.test(watchedPassword || "") },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Créer un utilisateur
          </h1>
          <p className="text-gray-600 mt-1">
            Ajoutez un nouvel utilisateur au système
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
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
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Mot de passe sécurisé"
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
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Confirmez le mot de passe"
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

                {/* Options supplémentaires */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendWelcomeEmail"
                      {...register("sendWelcomeEmail")}
                    />
                    <Label
                      htmlFor="sendWelcomeEmail"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Envoyer un email de bienvenue
                    </Label>
                  </div>
                </div>
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
                disabled={createUserMutation.isPending}
              >
                Réinitialiser
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                  disabled={createUserMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || !isDirty || createUserMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Créer l'utilisateur
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}