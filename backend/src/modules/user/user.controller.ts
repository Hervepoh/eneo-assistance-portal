import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { UserService } from "./user.service";
import { createUserSchema } from "../../common/validators/user.validator";
import { sequelize } from "../../database/models";


export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public create = asyncHandler(async (req: Request, res: Response) => {
    const body = createUserSchema.parse(req.body);

    // Démarrage d'une transaction
    const transaction = await sequelize.transaction();

    try {
      const data = await this.userService.createWithRoles(body, transaction);

      // Validation de la transaction
      await transaction.commit();

      return res.status(HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data,
      });
    } catch (error) {
      // Annulation de la transaction en cas d'erreur
      await transaction.rollback();
      throw error; // L'asyncHandler va gérer l'erreur
    }

  });

  public getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, filters } = req.query;

    const result = await this.userService.findWithPaginationAndFilters({
      page: Number(page),
      limit: Number(limit),
      filters: filters as string,
    });

    res.status(200).json({
      success: true,
      ...result,
    });


  });


  public assignRole = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.body;
      const user = await this.userService.assignRole(userId, roleId);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  public deactivate = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.deactivate(Number(req.params.id));
    return res.json({ message: "User deactivated" });
  });


  public getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findUserById(Number(req.params.id));
    res.status(HTTPSTATUS.OK).json({ message: "User retrieved", user });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.update(
      Number(req.params.id),
      req.body.name
    );
    res.status(HTTPSTATUS.OK).json({ message: "User updated", user });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.delete(Number(req.params.id));
    res.status(HTTPSTATUS.OK).json({ message: "User deleted" });
  });



}
