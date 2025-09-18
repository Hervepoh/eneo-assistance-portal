import { z } from "zod";
import { emailSchema, isLdapSchema, passwordSchema } from "./auth.validator";

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    isLdap: isLdapSchema.optional(),
    isActive: z.boolean().optional(),
    phone: z.string().optional(),
    username: z.string().optional(),
    unitId: z.string().optional(),
    roleIds: z.array(z.number()).optional().default([]), // Rôles optionnels avec tableau vide par défaut
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
  });

  
export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  isLdap: z.boolean().optional(),
});

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional()
});

export const createPermissionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export const updatePermissionSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional()
});

