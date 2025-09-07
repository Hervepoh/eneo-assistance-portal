import { z } from "zod";

export const createApplicationGroupSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
});

export const updateApplicationGroupSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").optional(),
  isDeleted: z.boolean().optional(),
});
