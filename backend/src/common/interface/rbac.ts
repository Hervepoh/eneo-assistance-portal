// src/types/rbac.ts
export type ID = number | string;

export interface Permission {
  id: ID;
  name: string; // ex: "users.create"
  label?: string;
  description?: string | null;
}

export interface Role {
  id: ID;
  name: string; // ex: "admin"
  label?: string;
  permissions?: Permission[]; // populated when reading role details
}

export interface User {
  id: ID;
  name: string;
  email: string;
  active?: boolean;
  roles?: Role[];
  permissions?: Permission[]; // effective permissions (optional)
  createdAt?: string;
  updatedAt?: string;
}
