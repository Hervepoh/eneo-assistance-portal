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

// Schéma pour la création d'une demande d'assistance  avec transformation
export const createAssistanceSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  region: z.string().min(1, "La région est obligatoire"),
  delegation: z.string().min(1, "La délégation est obligatoire"),
  agence: z.string().min(1, "L'agence est obligatoire"),
  applicationGroup: z.string().min(1, "Le groupe d'applications est obligatoire"),
  application: z.string().min(1, "L'application est obligatoire"),
  priorite: z.enum(["basse", "normale", "haute", "critique"]).default("normale"),
  files: z.array(fileSchema).optional().default([]),
  comments: z.array(z.string()).optional().default([]),
  userId: z.number().positive("L'ID utilisateur est invalide"),
  superiorUserId: z.number().positive("L'ID du supérieur hierachique de utilisateur est invalide"),
  status: z.string()
}).transform((data) => {
  if (data.status) {
    return {
      status: data.status,
      titre: data.titre,
      description: data.description,
      // description: `[${data.titre}] ${data.description}`, // Combiner titre et description
      regionId: parseInt(data.region),
      delegationId: parseInt(data.delegation),
      agenceId: parseInt(data.agence),
      applicationGroupId: parseInt(data.applicationGroup),
      applicationId: parseInt(data.application),
      priorite: data.priorite,
      files: data.files,
      comments: data.comments,
      userId: data.userId,
      superiorUserId: data.superiorUserId,
    };
  }
  // Transformation des données pour le service
  return {
    titre: data.titre,
    description: data.description,
    // description: `[${data.titre}] ${data.description}`, // Combiner titre et description
    regionId: parseInt(data.region),
    delegationId: parseInt(data.delegation),
    agenceId: parseInt(data.agence),
    applicationGroupId: parseInt(data.applicationGroup),
    applicationId: parseInt(data.application),
    priorite: data.priorite,
    files: data.files,
    comments: data.comments,
    userId: data.userId,
    superiorUserId: data.superiorUserId,
  };
});

// Type pour la création d'une demande (après transformation)
export type CreateAssistanceDto = z.infer<typeof createAssistanceSchema>;