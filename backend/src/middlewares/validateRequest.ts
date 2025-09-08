import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({ ...req.body, ...req.query, ...req.params });
      // put parsed body back if needed (we skip that to avoid surprise)
      req.body = { ...req.body, ...parsed };
      next();
    } catch (err: any) {
      return res.status(400).json({ error: err.errors ?? err.message });
    }
  };
