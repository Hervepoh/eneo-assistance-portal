import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { AgenceService } from "./agence.service";

export class AgenceController {
  private readonly service: AgenceService;

  constructor(service: AgenceService) {
    this.service = service;
  }

  public createAgence = asyncHandler(async (req: Request, res: Response) => {
    const agence = await this.service.createAgence(req.body);
    res.status(HTTPSTATUS.CREATED).json({ message: "Agence created", agence });
  });

  public getAllAgences = asyncHandler(async (req: Request, res: Response) => {
    const agences = await this.service.getAllAgences();
    res.status(HTTPSTATUS.OK).json({ agences });
  });

  public getAgenceById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const agence = await this.service.getAgenceById(id);
    res.status(HTTPSTATUS.OK).json({ agence });
  });

  public updateAgence = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const agence = await this.service.updateAgence(id, req.body);
    res.status(HTTPSTATUS.OK).json({ message: "Agence updated", agence });
  });

  public deleteAgence = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.service.deleteAgence(id);
    res.status(HTTPSTATUS.OK).json(result);
  });
}
