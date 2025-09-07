import { Request, Response } from "express";
import { AssistanceService } from "./assistance.service";
import { HTTPSTATUS } from "../../config/http.config";


const service = new AssistanceService();

export class AssistanceController {
  async create(req: Request, res: Response) {
    const request = await service.create(req.body);
    return res.status(HTTPSTATUS.CREATED).json({ request });
  }

  async findAll(req: Request, res: Response) {
    const { status } = req.query;
    const requests = await service.findAll(status as any);
    return res.json({ requests });
  }


  async findMyRequests(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Utilisateur non connecté" });

    const { status } = req.query;
    const requests = await service.findByUser(userId, status as any);

    return res.json({ requests });
  }

  async findMyRequestsWithPagination(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Utilisateur non connecté" });

    const filters = {
      status: req.query.status as string,
      regionId: req.query.regionId ? Number(req.query.regionId) : undefined,
      delegationId: req.query.delegationId ? Number(req.query.delegationId) : undefined,
      agenceId: req.query.agenceId ? Number(req.query.agenceId) : undefined,
      applicationGroupId: req.query.applicationGroupId ? Number(req.query.applicationGroupId) : undefined,
      applicationId: req.query.applicationId ? Number(req.query.applicationId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const result = await service.findByUserwithPagination(userId, filters);
    return res.json(result);
  }

  async findById(req: Request, res: Response) {
    const request = await service.findById(Number(req.params.id));
    return res.json({ request });
  }



  async update(req: Request, res: Response) {
    const request = await service.update(Number(req.params.id), req.body);
    return res.json({ request });
  }

  async delete(req: Request, res: Response) {
    await service.delete(Number(req.params.id));
    return res.status(HTTPSTATUS.NO_CONTENT).send();
  }
}

export const assistanceController = new AssistanceController();
