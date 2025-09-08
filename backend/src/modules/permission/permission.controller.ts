import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { PermissionService } from "./permission.service";
import { createPermissionSchema } from "../../common/validators/user.validator";
import { BadRequestException } from "../../common/utils/catch-errors";
import { ErrorCode } from "../../common/enums/error-code.enum";

export class PermissionController {
  private readonly service: PermissionService;

  constructor(service: PermissionService) {
    this.service = service;
  }

  public createPermission = asyncHandler(async (req: Request, res: Response) => {
    const body = createPermissionSchema.parse(req.body);
    const existing = await this.service.getPermissionByName(body.name)

    if (existing) {
      throw new BadRequestException(
        "Permission already exists with this name",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const role = await this.service.createPermission(body);

    res.status(HTTPSTATUS.CREATED).json({ message: "Permission created", role });
  });

  public getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.service.getAllPermissions();
    res.status(HTTPSTATUS.OK).json({ roles });
  });

  public getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await this.service.getPermissionById(id);
    res.status(HTTPSTATUS.OK).json({ role });
  });

  public updatePermission = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await this.service.updatePermission(id, req.body);
    res.status(HTTPSTATUS.OK).json({ message: "Permission updated", role });
  });

  public deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.service.deletePermission(id);
    res.status(HTTPSTATUS.OK).json(result);
  });
}
