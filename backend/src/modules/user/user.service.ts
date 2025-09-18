import { Op, Transaction } from "sequelize";
import { PermissionModel, RoleModel, UserModel, UserRoleModel } from "../../database/models";
import { BadRequestException, NotFoundException } from "../../common/utils/catch-errors";
import { ErrorCode } from "../../common/enums/error-code.enum";
import { UserType } from "../../common/types/user.type";

interface Filter {
  field: string;
  operator: string;
  value: any;
}

interface ParsedFilters {
  conditions?: { operator: "AND" | "OR"; filters: Filter[] }[];
  [key: string]: any;
}


export class UserService {

  async createWithRoles(userData: any, transaction?: Transaction) {
    try {
      const { roleIds, ...userAttributes } = userData;

      // Validation de l'email unique
      const existingUser = await UserModel.findOne({
        where: { email: userAttributes.email },
        transaction
      });

      if (existingUser) {
        throw new BadRequestException(
          "User already exists with this email",
          ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
      }

      // Création de l'utilisateur
      const user = await UserModel.create(userAttributes, {
        transaction
      });

      // Assignation des rôles
      if (roleIds && roleIds.length > 0) {
        await this.assignRolesToUser(user.id, roleIds, transaction);
      }

      // Retourner l'utilisateur avec ses rôles
      return this.getUserWithRoles(user.id, transaction);

    } catch (error: any) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  public async findAll() {
    return await UserModel.findAll({
      include: [{
        model: RoleModel,
        as: "roles",
        through: { attributes: [] }, // Exclut les champs de la table user_roles
        attributes: ['id', 'name'] // Seulement les champs nécessaires des rôles
      }],
      order: [["created_at", "DESC"]],
      attributes: { exclude: ['password'] }
    });
  }


  public async findWithPaginationAndFilters({
    page = 1,
    limit = 10,
    filters = "",
  }: { page?: number; limit?: number; filters?: string }) {
    const offset = (page - 1) * limit;

    // Parse filters JSON
    let parsedFilters: ParsedFilters = {};
    try {
      parsedFilters = filters ? JSON.parse(filters) : {};
    } catch {
      throw new Error("Invalid JSON format for filters.");
    }

    // Helper pour créer les conditions Sequelize
    const createFilter = ({ field, operator, value }: Filter) => {
      const opMap: Record<string, any> = {
        contains: { [Op.like]: `%${value}%` },
        equals: { [Op.eq]: value },
        gte: { [Op.gte]: value },
        lte: { [Op.lte]: value },
        gt: { [Op.gt]: value },
        lt: { [Op.lt]: value },
      };
      const condition = opMap[operator];
      if (!condition) throw new Error(`Operator '${operator}' not supported.`);
      return { [field]: condition };
    };

    // Construire where clause
    const whereClause: any[] = [];

    if (Array.isArray(parsedFilters.conditions)) {
      for (const condition of parsedFilters.conditions) {
        const condFilters = condition.filters.map(createFilter);
        whereClause.push(condition.operator === "AND" ? { [Op.and]: condFilters } : { [Op.or]: condFilters });
      }
    } else {
      // simple filters
      for (const key in parsedFilters) {
        const { operator = "equals", value } = parsedFilters[key];
        whereClause.push(createFilter({ field: key, operator, value }));
      }
    }

    const finalWhere = whereClause.length ? { [Op.and]: whereClause } : {};

    // Count total items
    const totalItems = await UserModel.count({ where: finalWhere });

    // Fetch data paginée
    const data = await UserModel.findAll({
      where: finalWhere,
      include: [
        {
          model: RoleModel,
          as: "roles",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      attributes: { exclude: ["password"] },
    });

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }



  async findUserByEmail(email: string) {
    return UserModel.findOne({ where: { email } });
  }

  async findUserById(id: number) {
    return UserModel.findByPk(id, {
      include: [{
        model: RoleModel,
        as: 'roles',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ["password"] }, // exclut le mot de passe
    });
  }

  async getUserRolesWithPermissions(userId: number) {

    const user: UserType | null = await UserModel.findByPk(userId, {
      include: [{
        model: RoleModel,
        as: 'roles',
        through: { attributes: [] },
        include: [{
          model: PermissionModel,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['name'] // Seulement le code de permission
        }],
        attributes: ['id', 'name'] // Seulement les infos nécessaires des rôles
      }],
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'isLdap', 'isEmailVerified']
      }
    });

    if (!user) return null;

    // Transformation manuelle pour éviter l'objet Sequelize lourd
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userPreferences: user.userPreferences,
      isActive: user.isActive,
      roles: user.roles ? user.roles.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions ? role.permissions.map(p => p.name) : []
      })) : []
    };


  }

  async assignRole(userId: number, roleId: number) {
    const user = await UserModel.findByPk(userId);
    const role = await RoleModel.findByPk(roleId);
    if (!user || !role) throw new Error("User or Role not found");
    await (user as any).addRole(role);
    return user;
  }

  async deactivate(userId: number) {
    return await UserModel.update({ isActive: false }, { where: { id: userId } });
  }


  public async update(id: number, data: any) {
    const user = await this.findUserById(id);
    if (!user) throw new NotFoundException("User not found");

    await user.update(data)
    return user;
  }

  public async delete(id: number) {
    const user = await this.findUserById(id);
    if (user) {
      await user.destroy(); // soft delete
      return { message: "Agence deleted successfully" };
    }

  }



  private async assignRolesToUser(userId: number, roleIds: number[], transaction?: Transaction) {
    const roles = await RoleModel.findAll({
      where: { id: roleIds },
      transaction
    });

    if (roles.length !== roleIds.length) {
      const foundIds = roles.map(role => role.id);
      const missingIds = roleIds.filter(id => !foundIds.includes(id));
      throw new Error(`Rôles non trouvés: ${missingIds.join(', ')}`);
    }

    // Création directe des entrées dans la table de jointure
    const userRoleEntries = roleIds.map(roleId => ({
      user_id: userId,
      role_id: roleId
    }));

    await UserRoleModel.bulkCreate(userRoleEntries, { transaction });
  }


  private async getUserWithRoles(userId: number, transaction?: Transaction) {
    return UserModel.findByPk(userId, {
      include: [{
        model: RoleModel,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }],
      transaction,
      attributes: { exclude: ['password'] } // Exclure le mot de passe de la réponse
    });
  }
}









