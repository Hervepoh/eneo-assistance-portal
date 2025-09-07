import { Request, Response } from "express";
import { ApplicationGroupService } from "./applicationGroup.service";
import { createApplicationGroupSchema, updateApplicationGroupSchema } from "../../../common/validators/applicationGroup.validation";

export class ApplicationGroupController {
  constructor(private readonly service: ApplicationGroupService) {}

  create = async (req: Request, res: Response) => {
    try {
      const parsed = createApplicationGroupSchema.parse(req.body);
      const group = await this.service.create(parsed);
      return res.status(201).json(group);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  findAll = async (_req: Request, res: Response) => {
    const groups = await this.service.findAll();
    return res.json(groups);
  };

  findById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const group = await this.service.findById(id);
    if (!group) return res.status(404).json({ error: "Groupe introuvable" });
    return res.json(group);
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const parsed = updateApplicationGroupSchema.parse(req.body);

      const group = await this.service.update(id, parsed);
      if (!group) return res.status(404).json({ error: "Groupe introuvable" });

      return res.json(group);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const group = await this.service.delete(id);
    if (!group) return res.status(404).json({ error: "Groupe introuvable" });

    return res.json({ message: "Groupe supprimé avec succès" });
  };
}
