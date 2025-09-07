import { z } from "zod";

export const createDelegationSchema = z.object({
  name: z.string().min(2),
  regionId: z.number().optional(),
});

export const updateDelegationSchema = z.object({
  name: z.string().min(2).optional(),
  regionId: z.number().optional(),
});
