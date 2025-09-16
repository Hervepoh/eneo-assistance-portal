"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/auth-provider";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const UsersList = () => {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Exemple d'appel API
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          {user?.activePermissions?.includes("users:update") && (
            <Button size="sm" onClick={() => editUser(row.original.id)}>
              Edit
            </Button>
          )}
          {user?.activePermissions?.includes("users:delete") && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteUser(row.original.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const editUser = (id: number) => {
    console.log("Edit user", id);
    // redirection vers /admin/users/:id
  };

  const deleteUser = (id: number) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      fetch(`/api/admin/users/${id}`, { method: "DELETE" }).then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Users Management</h1>

      {user?.activePermissions?.includes("users:create") && (
        <Button onClick={() => (window.location.href = "/admin/users/new")}>
          + Add User
        </Button>
      )}

      <table className="min-w-full border">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;