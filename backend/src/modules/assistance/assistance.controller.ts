import { Request, Response } from "express";
import { assistanceService } from "./assistance.service";
import { HTTPSTATUS } from "../../config/http.config";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";

export class AssistanceController {
  async create(req: Request, res: Response) {
    // req.user.id must exist (authenticateJWT)
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dto = { ...req.body, userId };
    try {
      const created = await assistanceService.create(dto);
      return res.status(HTTPSTATUS.CREATED).json({ request: created });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async addFiles(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    const requestId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // files saved by multer: req.files
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    console.log("📂 Fichiers reçus :", files);
    const payload = files.map((f) => ({ filePath: `/uploads/assistance/${f.filename}`, description: req.body[`desc_${f.originalname}`] || undefined }));

    try {
      const created = await assistanceService.addFiles(requestId, payload, userId);
      return res.status(HTTPSTATUS.CREATED).json({ files: created });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async myRequests(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const filters = {
      status: req.query.status as string | undefined,
      regionId: req.query.regionId ? Number(req.query.regionId) : undefined,
      delegationId: req.query.delegationId ? Number(req.query.delegationId) : undefined,
      agenceId: req.query.agenceId ? Number(req.query.agenceId) : undefined,
      applicationGroupId: req.query.applicationGroupId ? Number(req.query.applicationGroupId) : undefined,
      applicationId: req.query.applicationId ? Number(req.query.applicationId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
    };

    const result = await assistanceService.findByUser(userId, filters);
    return res.status(HTTPSTATUS.OK).json(result);
  }

  async getAll(req: Request, res: Response) {
    const { status } = req.query;
    const requests = await assistanceService.findAll(status as any);
    return res.json({ requests });
  }

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const request = await assistanceService.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });
    return res.status(HTTPSTATUS.OK).json({ request });
  }

  async update(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);

    try {
      const updated = await assistanceService.update(id, req.body, userId);
      return res.status(HTTPSTATUS.OK).json({ request: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // submit a draft (send to verifier)
  async submit(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      // change status to UNDER_VERIFICATION / SUBMITTED
      const reqModel = await assistanceService.update(id, { status: AssistanceStatusEnum.SUBMITTED }, userId);
      await assistanceService.performAction(id, { type: "SEND_TO_DELEGUE", actorId: userId }); // or simply log - example
      // note: actual routing to verifier is handled by performAction calls from verifier later
      return res.status(HTTPSTATUS.OK).json({ request: reqModel });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // generic action endpoint for verifier / delegue / business / traiteur
  async action(req: Request, res: Response) {
    const actorId = (req.user as any)?.id;
    const id = Number(req.params.id);
    if (!actorId) return res.status(401).json({ message: "Unauthorized" });

    const { type, comment } = req.body;
    try {
      const result = await assistanceService.performAction(id, { type, comment, actorId });
      return res.status(200).json({ request: result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      await assistanceService.delete(id, userId);
      return res.status(HTTPSTATUS.NO_CONTENT).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export const assistanceController = new AssistanceController();
