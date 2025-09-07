import { z } from "zod";
import { AssistanceStatusEnum } from "../enums/assistance-status.enum";


export const createAssistanceSchema = z.object({
    regionId: z.number(),
    delegationId: z.number(),
    agenceId: z.number(),
    userId: z.number(),
    superieurHierarchiqueId: z.number().optional(),
    description: z.string().min(5),
    comment: z.string().optional(),
    dateDemande: z.string(), // ISO string
    applicationGroupId: z.number(),
    applicationId: z.number(),
    status: z.nativeEnum(AssistanceStatusEnum).optional(),
    files: z
        .array(
            z.object({
                filePath: z.string(),
                description: z.string().optional(),
            })
        )
        .optional(),
});

export const updateAssistanceSchema = z.object({
    regionId: z.number().optional(),
    delegationId: z.number().optional(),
    agenceId: z.number().optional(),
    userId: z.number().optional(),
    superieurHierarchiqueId: z.number().optional(),
    description: z.string().min(5, "La description doit contenir au moins 5 caractères").optional(),
    dateDemande: z.string().refine((val) => !isNaN(Date.parse(val)), "Date invalide").optional(),
    groupApplicationId: z.number().optional(),
    applicationId: z.number().optional(),
    files: z
        .array(
            z.object({
                filePath: z.string(),
                description: z.string().min(1),
            })
        )
        .optional(),
});