import { Request, Response } from "express";
import { ApplicationService } from "./application.service";
import { createApplicationSchema, updateApplicationSchema } from "../../common/validators/application.validation";


export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  create = async (req: Request, res: Response) => {
    try {
      const parsed = createApplicationSchema.parse(req.body);
      const app = await this.service.create(parsed);
      return res.status(201).json(app);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  findAll = async (_req: Request, res: Response) => {
    const apps = await this.service.findAll();
    return res.json(apps);
  };

  findById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const app = await this.service.findById(id);
    if (!app) return res.status(404).json({ error: "Application introuvable" });
    return res.json(app);
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const parsed = updateApplicationSchema.parse(req.body);

      const app = await this.service.update(id, parsed);
      if (!app) return res.status(404).json({ error: "Application introuvable" });

      return res.json(app);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const app = await this.service.delete(id);
    if (!app) return res.status(404).json({ error: "Application introuvable" });

    return res.json({ message: "Application supprimée avec succès" });
  };
}
