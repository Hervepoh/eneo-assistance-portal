import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FileText, Loader, Save, Send, X } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createAssistanceMutationFn, getAppReferenceQueryFn, getOrgReferenceQueryFn } from "@/lib/api";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

interface Agence {
  id: number;
  name: string;
}

interface Delegation {
  id: number;
  name: string;
  agences: Agence[];
}

interface Region {
  id: number;
  name: string;
  delegations: Delegation[];
}

// Types pour les groupes d'applications
export interface Application {
  id: number;
  name: string;
}

export interface ApplicationGroup {
  id: number;
  name: string;
  applications: Application[];
}


// ✅ Schéma de validation avec fichiers multiples
const fileSchema = z.object({
  file: z
    .any()
    .refine((f) => f instanceof File, "Fichier invalide")
    .refine((f) => f.size <= 10 * 1024 * 1024, "Taille max 10MB"),
  commentaire: z.string().min(1, "Un commentaire est requis"),
});

// ✅ Schéma de validation
const formSchema = z.object({
  titre: z.string().min(3, "Le titre est obligatoire"),
  description: z.string().min(10, "La description est obligatoire"),
  region: z.string().min(1, "Sélectionnez une région"),
  delegation: z.string().min(1, "Sélectionnez une délégation"),
  agence: z.string().min(1, "Sélectionnez une agence"),
  applicationGroup: z.string().min(1, "Sélectionnez un groupe d'applications"),
  application: z.string().min(1, "Sélectionnez une application"),
  priorite: z.enum(["basse", "normale", "haute", "critique"]),
  fichiers: z.array(fileSchema).optional(),
});

export function NouvelleDemande() {
  const navigate = useNavigate();

  // ⚡ Récupération hiérarchie (Région -> Délégation -> Agence)
  const { data: regions, isLoading: isLoadingOrgRef } = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrgReferenceQueryFn, // => renvoie [{id, nom, delegations: [{id, nom, agences:[] }]}]
    select: (res) => res.data?.data, // ✅ on garde uniquement le tableau de régions
    staleTime: Infinity,
  });

  // ⚡ Récupération hiérarchie (Groupe d'applications -> Applications)
  const { data: applicationGroups, isLoading: isLoadingAppRef } = useQuery({
    queryKey: ["application-groups"],
    queryFn: getAppReferenceQueryFn,
    select: (res) => res.data?.data,
    staleTime: Infinity,
  });


  // ⚡ Mutation pour créer la demande
  const { mutate, isPending } = useMutation({
    mutationFn: createAssistanceMutationFn,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      region: "",
      delegation: "",
      agence: "",
      applicationGroup: "",
      application: "",
      priorite: "normale",
      fichiers: [],
    },
  });

  // Gestion fichiers multiples
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fichiers",
  });

  // Calcul des valeurs dérivées pour le filtrage hiérarchique

  const selectedRegion = regions?.find(
    (r: { id: { toString: () => string; }; }) => r.id.toString() === form.watch("region")
  );
  const delegations = selectedRegion?.delegations || [];

  const selectedDelegation = delegations.find(
    (d: { id: { toString: () => string; }; }) => d.id.toString() === form.watch("delegation")
  );
  const agences = selectedDelegation?.agences || [];

  const selectedApplicationGroup = applicationGroups?.find(
    (g: { id: { toString: () => string; }; }) => g.id.toString() === form.watch("applicationGroup")
  );
  const applications = selectedApplicationGroup?.applications || [];



  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();

    // Données principales
    formData.append("titre", values.titre);
    formData.append("description", values.description);
    formData.append("region", values.region);
    formData.append("delegation", values.delegation);
    formData.append("agence", values.agence);
    formData.append("applicationGroup", values.applicationGroup);
    formData.append("application", values.application);
    formData.append("priorite", values.priorite);

    // Fichiers joints
    values.fichiers?.forEach((f, index) => {
      formData.append(`files[${index}]`, f.file);
      formData.append(`comments[${index}]`, f.commentaire);
    });

    mutate(formData, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Demande soumise avec succès" });
        navigate("/mes-demandes");
      },
      onError: (error: any) => {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de créer la demande",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande d'assistance</h2>
        <p className="text-gray-600 mt-1">Décrivez votre problème ou votre besoin d'assistance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Région / Délégation / Agence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isLoadingOrgRef}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="">-- Région --</option>
                        {regions?.map((r: Region) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delegation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Délégation *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={!selectedRegion}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="">-- Délégation --</option>
                        {delegations.map((d: Delegation) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agence *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={!selectedDelegation}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="">-- Agence --</option>
                        {agences.map((a: Agence) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="w-full" />

            {/* Groupe d'applications / Applications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="applicationGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groupe d'applications *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isLoadingAppRef}
                        className="w-full border rounded-md px-3 py-2"
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("application", ""); // Réinitialiser l'application quand le groupe change
                        }}
                      >
                        <option value="">-- Groupe d'applications --</option>
                        {applicationGroups?.map((group: ApplicationGroup) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={!selectedApplicationGroup}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="">-- Application --</option>
                        {applications.map((app: Application) => (
                          <option key={app.id} value={app.id}>
                            {app.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="w-full" />

            {/* Titre */}
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé de la demande *</FormLabel>
                  <FormControl>
                    <Input placeholder="Résumé de la demande" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de la demande *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Décrivez le problème en détail"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="w-full" />

            {/* Priorité */}
            <FormField
              control={form.control}
              name="priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="basse">Basse</option>
                      <option value="normale">Normale</option>
                      <option value="haute">Haute</option>
                      <option value="critique">Critique</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zone de fichiers */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Pièces jointes
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Glissez-déposez vos fichiers ici ou{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept =
                        ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          append({ file, commentaire: "" });
                        }
                      };
                      input.click();
                    }}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    parcourez
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, Word, Excel, images jusqu'à 10MB
                </p>
              </div>

              {/* Liste fichiers + commentaires */}
              <div className="mt-4 space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row gap-3 items-start md:items-center border rounded-lg p-3"
                  >
                    <span className="text-sm font-medium flex-1">
                      {form.watch(`fichiers.${index}.file`)?.name ||
                        "Fichier sélectionné"}
                    </span>
                    <FormField
                      control={form.control}
                      name={`fichiers.${index}.commentaire`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-sm">
                            Commentaire
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Décrire le fichier"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                disabled={isPending}
                variant="outline"
                className="text-[15px] h-[40px] font-semibold"
                type="button"
              >
                {isPending && <Loader className="animate-spin mr-2" />}
                <Save className="w-4 h-4" /> Soumettre la demande
              </Button>

              <Button
                disabled={isPending}
                className="text-[15px] h-[40px] text-white font-semibold"
                type="submit"
              >
                {isPending && <Loader className="animate-spin mr-2" />}
                <Send className="w-4 h-4" /> Soumettre la demande
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Aide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Conseils pour une demande efficace :</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Soyez précis dans le titre de votre demande</li>
          <li>Décrivez les étapes qui ont mené au problème</li>
          <li>Mentionnez les messages d'erreur exacts si applicable</li>
          <li>Joignez des captures d'écran si nécessaire</li>
          <li>Indiquez l'urgence réelle de votre demande</li>
        </ul>
      </div>

    </main>
  );
}
