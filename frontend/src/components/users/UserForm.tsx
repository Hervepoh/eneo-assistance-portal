// src/pages/admin/UserForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useCreateUser, useUpdateUser, useRoles } from "@/queries/rbac.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  roles: z.array(z.number()).optional(),
  active: z.boolean().optional(),
});

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user } = useUser(id);
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", roles: [], active: true },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, email: user.email, roles: user.roles?.map(r => Number(r.id)) || [], active: user.active ?? true });
    }
  }, [user]);

  const onSubmit = async (values: any) => {
    try {
      if (id) {
        await updateUser.mutateAsync({ id, payload: values });
        toast({ title: "Mis à jour" });
      } else {
        await createUser.mutateAsync(values);
        toast({ title: "Créé" });
      }
      navigate("/admin/users");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{id ? "Éditer utilisateur" : "Nouvel utilisateur"}</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input {...form.register("name")} placeholder="Nom complet" />
        <Input {...form.register("email")} placeholder="Email" />
        <div>
          <label className="block mb-2">Rôles</label>
          <div className="flex gap-2 flex-wrap">
            {roles?.map(r => (
              <label key={r.id} className="inline-flex items-center gap-2">
                <input type="checkbox" value={r.id} {...form.register("roles")} />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...form.register("active")} />
            <span>Actif</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit">{id ? "Sauvegarder" : "Créer"}</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
