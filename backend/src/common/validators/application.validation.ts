import { z } from "zod";

export const createApplicationSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  groupId: z.number().positive("Le groupe est obligatoire"),
});

export const updateApplicationSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").optional(),
  groupId: z.number().positive("Le groupe est obligatoire").optional(),
  isDeleted: z.boolean().optional(),
});
