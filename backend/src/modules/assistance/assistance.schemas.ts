import { z } from 'zod';

// Schéma pour les fichiers
export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
});

// Schéma pour la création d'une demande d'assistance
export const createAssistanceSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  region: z.string().min(1, "La région est obligatoire"),
  delegation: z.string().min(1, "La délégation est obligatoire"),
  agence: z.string().min(1, "L'agence est obligatoire"),
  applicationGroup: z.string().min(1, "Le groupe d'applications est obligatoire"),
  application: z.string().min(1, "L'application est obligatoire"),
  priorite: z.enum(["basse", "normale", "haute", "critique"]).default("normale"),
  comments: z.array(z.string()).optional().default([]),
  files: z.array(fileSchema).optional().default([]),
//  userId: z.number().positive("L'ID utilisateur est invalide"),
});

// Type pour la création d'une demande
export type CreateAssistanceDto = z.infer<typeof createAssistanceSchema>;