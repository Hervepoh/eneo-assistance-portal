import { Request, Response } from "express";
import { AssistanceService, assistanceService } from "./assistance.service";
import { HTTPSTATUS } from "../../config/http.config";
import { CreateAssistanceDto, createAssistanceSchema } from "./assistance.schemas";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AssistanceFilters } from "../../common/interface/assistance.interface";
import { getComments } from "./assistance.helpers";

export class AssistanceController {
  private readonly service: AssistanceService;

  constructor(service: AssistanceService) {
    this.service = service;
  }

  public create = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const files = req.files as Express.Multer.File[];
    const comments = getComments(req.body.comments);

    // Préparer les données pour la validation
    const requestData = {
      ...req.body,
      userId: parseInt(userId),
      superiorUserId: parseInt(userId),
      files,
      comments
    };

    // Valider les données avec Zod
    const validatedData: CreateAssistanceDto = createAssistanceSchema.parse(requestData);

    // Execute service to create 
    const created = await assistanceService.create(validatedData);

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: 'Demande créée avec succès',
      data: created
    });

  })


  public getMy = asyncHandler(async (req: Request, res: Response) =>
    this.handleFindRequests(req, res, 'my')
  )

  public getAsN1 = asyncHandler(async (req: Request, res: Response) =>
    this.handleFindRequests(req, res, 'as-n1')
  )

  public getAll = asyncHandler(async (req: Request, res: Response) =>
    this.handleFindRequests(req, res, 'all')
  )

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const request = await assistanceService.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });
    return res.status(HTTPSTATUS.OK).json({ request });
  })

  public getByReference = asyncHandler(async (req: Request, res: Response) => {
    const { reference } = req.params;
    if (!reference) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "La référence est requise"
      });
    }
    const request = await assistanceService.findByReference(reference);
    if (!request) return res.status(HTTPSTATUS.NOT_FOUND).json({ message: "Not found" });
    return res.status(HTTPSTATUS.OK).json({ request });
  });


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
      await assistanceService.submit(id, userId ); 
      return res.status(HTTPSTATUS.OK).json({ message: "Everything look good" });
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


  /**
   * Méthode générique pour toutes les routes de listing
   */
  private async handleFindRequests(
    req: Request,
    res: Response,
    mode: 'my' | 'as-n1' | 'all'
  ) {
    try {
      const userId = (req.user as any)?.id;

      if (!userId && mode !== 'all') {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          success: false,
          message: "Utilisateur non authentifié"
        });
      }

      // Vérification des permissions pour le mode 'all'
      if (mode === 'all') {
        const userRoles = (req.user as any)?.roles || [];
        if (!userRoles.includes('admin')) {
          return res.status(HTTPSTATUS.FORBIDDEN).json({
            success: false,
            message: "Accès réservé aux administrateurs"
          });
        }
      }

      const filters: AssistanceFilters = this.buildFiltersFromQuery(req.query);

      const result = await this.service.findRequests(mode, userId, filters);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });

    } catch (error) {
      console.error(`Erreur récupération demandes (mode: ${mode}):`, error);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur"
      });
    }
  }

  /**
   * Construction des filtres depuis les query parameters
   */
  private buildFiltersFromQuery(query: any): AssistanceFilters {
    return {
      q: query.q as string,
      status: query.status as string,
      regionId: query.regionId ? parseInt(query.regionId as string) : undefined,
      delegationId: query.delegationId ? parseInt(query.delegationId as string) : undefined,
      agenceId: query.agenceId ? parseInt(query.agenceId as string) : undefined,
      applicationGroupId: query.applicationGroupId ? parseInt(query.applicationGroupId as string) : undefined,
      applicationId: query.applicationId ? parseInt(query.applicationId as string) : undefined,
      page: query.page ? Math.max(1, parseInt(query.page as string)) : 1,
      limit: query.limit ? Math.min(100, Math.max(1, parseInt(query.limit as string))) : 10,
    };
  }


}





