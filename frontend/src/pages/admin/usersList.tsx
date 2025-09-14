// src/pages/admin/UsersList.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function UsersList() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useUsers({ q, limit: 20, page: 1 });
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await deleteUser.mutateAsync(id);
      toast({ title: "Supprimé", description: "Utilisateur supprimé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de supprimer", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Utilisateurs</h1>
        <div className="flex gap-2">
          <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={() => navigate("/admin/users/new")}>Créer</Button>
        </div>
      </div>

      <div className="bg-white border rounded">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rôles</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-4">Chargement...</td></tr>
            ) : data?.data?.length ? (
              data.data.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.roles?.map(r => r.name).join(", ")}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/admin/users/${u.id}`)} variant="outline">Voir</Button>
                      <Button onClick={() => navigate(`/admin/users/${u.id}/edit`)}>Éditer</Button>
                      <Button variant="destructive" onClick={() => handleDelete(u.id as any)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-4">Aucun utilisateur trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
