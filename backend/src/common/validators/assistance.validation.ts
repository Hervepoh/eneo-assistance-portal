import { z } from "zod";

export const createAssistanceSchema = z.object({
  regionId: z.number().int().positive(),
  delegationId: z.number().int().positive(),
  agenceId: z.number().int().positive(),
  description: z.string().min(5),
  comment: z.string().optional(),
  applicationGroupId: z.number().int().positive(),
  applicationId: z.number().int().positive(),
  files: z.array(
    z.object({
      filePath: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
});
