import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { RoleService } from "./role.service";
import { createRoleSchema } from "../../common/validators/user.validator";
import { BadRequestException } from "../../common/utils/catch-errors";
import { ErrorCode } from "../../common/enums/error-code.enum";

export class RoleController {
  private readonly service: RoleService;

  constructor(service: RoleService) {
    this.service = service;
  }

  public createRole = asyncHandler(async (req: Request, res: Response) => {
    const body = createRoleSchema.parse(req.body);
    const existing = await this.service.getRoleByName(body.name)

    if (existing) {
      throw new BadRequestException(
        "Role already exists with this name",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const role = await this.service.createRole(body);

    res.status(HTTPSTATUS.CREATED).json({ message: "Role created", role });
  });

  public getAllRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.service.getAllRoles();
    res.status(HTTPSTATUS.OK).json({ roles });
  });

  public getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await this.service.getRoleById(id);
    res.status(HTTPSTATUS.OK).json({ role });
  });

  public updateRole = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await this.service.updateRole(id, req.body);
    res.status(HTTPSTATUS.OK).json({ message: "Role updated", role });
  });

  public deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.service.deleteRole(id);
    res.status(HTTPSTATUS.OK).json(result);
  });
}
